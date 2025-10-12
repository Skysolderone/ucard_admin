# Prisma ORM 使用说明

本项目使用 Prisma ORM 进行数据库操作，提供类型安全的数据库访问。

## 快速开始

### 1. 配置数据库连接

修改 `.env.local` 文件：

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/ucard_admin"
```

格式：`mysql://用户名:密码@主机:端口/数据库名`

### 2. 创建数据库

首先创建数据库：

```sql
CREATE DATABASE ucard_admin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 推送数据库表结构

使用 Prisma 将 schema 推送到数据库：

```bash
npm run db:push
```

这将根据 `prisma/schema.prisma` 创建或更新数据库表。

### 4. 初始化数据（可选）

运行 seed 脚本插入初始数据（包括 admin 用户）：

```bash
npm run db:seed
```

这会创建默认管理员账户：
- 用户名：admin
- 密码：admin123456

## 常用命令

### 数据库操作

```bash
# 推送 schema 到数据库（开发环境）
npm run db:push

# 初始化/重置数据
npm run db:seed

# 打开 Prisma Studio（数据库 GUI）
npm run db:studio

# 生成 Prisma Client
npx prisma generate

# 查看数据库状态
npx prisma db pull
```

### 生产环境迁移

```bash
# 创建迁移文件
npx prisma migrate dev --name init

# 应用迁移
npx prisma migrate deploy

# 查看迁移状态
npx prisma migrate status
```

## 在代码中使用 Prisma

### 导入 Prisma Client

```typescript
import { prisma } from '@/lib/prisma';
```

### 基本操作示例

#### 查询单个记录

```typescript
const user = await prisma.user.findUnique({
  where: { username: 'admin' },
});
```

#### 查询多个记录

```typescript
const users = await prisma.user.findMany({
  where: { status: 1 },
  orderBy: { createdAt: 'desc' },
});
```

#### 创建记录

```typescript
const newUser = await prisma.user.create({
  data: {
    username: 'newuser',
    password: 'password123',
    role: 'user',
    status: 1,
  },
});
```

#### 更新记录

```typescript
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: { status: 0 },
});
```

#### 删除记录

```typescript
const deletedUser = await prisma.user.delete({
  where: { id: 1 },
});
```

#### 统计

```typescript
const userCount = await prisma.user.count({
  where: { status: 1 },
});
```

### 高级操作

#### 关系查询

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: true, // 包含关联的 posts
  },
});
```

#### 事务

```typescript
const result = await prisma.$transaction([
  prisma.user.create({ data: { username: 'user1', password: 'pass' } }),
  prisma.user.create({ data: { username: 'user2', password: 'pass' } }),
]);
```

#### 分页

```typescript
const users = await prisma.user.findMany({
  skip: 0,
  take: 10,
  where: { status: 1 },
});
```

## Schema 文件

修改 `prisma/schema.prisma` 后，需要执行以下命令：

1. 推送到数据库：`npm run db:push`
2. 重新生成 Client：`npx prisma generate`

## Prisma Studio

Prisma Studio 是一个数据库 GUI 工具，可以方便地查看和编辑数据：

```bash
npm run db:studio
```

访问：http://localhost:5555

## 注意事项

1. **开发环境** 使用 `db:push` 快速同步 schema
2. **生产环境** 使用 `prisma migrate deploy` 应用迁移
3. `.env.local` 文件不要提交到版本控制
4. Prisma Client 会在首次运行时自动生成
5. 修改 schema 后记得重新生成 Client

## 参考资源

- [Prisma 官方文档](https://www.prisma.io/docs)
- [Prisma Schema 参考](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
