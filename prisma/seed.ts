import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local 文件
config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库数据...');

  // 创建或更新管理员用户
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: 'admin123456',
      role: 'admin',
      status: 1,
    },
    create: {
      username: 'admin',
      password: 'admin123456',
      role: 'admin',
      status: 1,
    },
  });

  console.log('✅ 管理员用户创建成功:', admin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 数据初始化失败:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
