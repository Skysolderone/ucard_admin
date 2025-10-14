/**
 * 数据库密码迁移脚本
 * 将数据库中的明文密码转换为 SHA-256 加密密码
 *
 * 使用方法：
 * npx tsx scripts/migrate-passwords.ts
 */

import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * 使用 SHA-256 算法加密密码（Node.js 版本）
 */
function encryptPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function migratePasswords() {
  try {
    console.log('开始迁移密码...');

    // 获取所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        password: true,
      },
    });

    console.log(`找到 ${users.length} 个用户需要迁移`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // 检查密码是否已经是加密格式（SHA-256 的十六进制是 64 个字符）
      if (user.password.length === 64 && /^[a-f0-9]+$/i.test(user.password)) {
        console.log(`跳过用户 ${user.username} (密码已加密)`);
        skippedCount++;
        continue;
      }

      // 加密密码
      const encryptedPassword = encryptPassword(user.password);

      // 更新数据库
      await prisma.user.update({
        where: { id: user.id },
        data: { password: encryptedPassword },
      });

      console.log(`✓ 已迁移用户: ${user.username}`);
      migratedCount++;
    }

    console.log('\n迁移完成！');
    console.log(`- 已迁移: ${migratedCount} 个用户`);
    console.log(`- 已跳过: ${skippedCount} 个用户（密码已加密）`);
  } catch (error) {
    console.error('迁移过程中出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 执行迁移
migratePasswords()
  .then(() => {
    console.log('\n密码迁移成功完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n密码迁移失败:', error);
    process.exit(1);
  });
