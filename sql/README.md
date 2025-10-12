# 数据库初始化说明

## 1. 创建数据库

首先，创建数据库：

```sql
CREATE DATABASE ucard_admin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. 配置数据库连接

修改项目根目录下的 `.env.local` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=ucard_admin
```

## 3. 导入初始化 SQL

使用 MySQL 命令行或图形化工具（如 Navicat、phpMyAdmin）执行 `init.sql` 文件：

### 方法 1: 使用命令行

```bash
mysql -u root -p ucard_admin < sql/init.sql
```

### 方法 2: 在 MySQL 命令行中执行

```bash
mysql -u root -p
```

然后在 MySQL 命令行中：

```sql
USE ucard_admin;
SOURCE D:/wws/ucard_admin/sql/init.sql;
```

### 方法 3: 使用图形化工具

1. 连接到数据库
2. 选择 `ucard_admin` 数据库
3. 导入 `sql/init.sql` 文件

## 4. 验证数据库

查看表是否创建成功：

```sql
USE ucard_admin;
SHOW TABLES;
SELECT * FROM users;
```

应该看到一条默认管理员记录：
- 用户名：admin
- 密码：admin123456
- 角色：admin

## 5. 测试登录

启动开发服务器：

```bash
npm run dev
```

测试登录接口：

```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}'
```

成功响应示例：

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "token": "token-1-1760172000000"
  }
}
```

## 注意事项

⚠️ **安全警告**：
- 当前密码使用明文存储，仅用于开发环境
- 生产环境必须使用加密方式（如 bcrypt）存储密码
- 请及时修改默认密码
- 不要将 `.env.local` 文件提交到版本控制系统
