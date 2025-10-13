# UCard Admin 快速部署指南

## 📦 准备部署文件

### 需要上传到服务器的文件和目录：

```
✅ 必需文件：
├── .next/                    # 已构建的应用（运行 npm run build 后生成）
├── node_modules/             # 依赖包（或在服务器上运行 npm install）
├── prisma/                   # 数据库配置
├── package.json
├── package-lock.json
├── ecosystem.config.js       # PM2 配置
├── next.config.ts
└── .env.production           # 生产环境变量

❌ 不需要上传：
├── .git/
├── src/                      # 已编译，可选
├── .env.local
└── node_modules/             # 如果在服务器上安装
```

## 🚀 三种部署方式

---

### 方式一：使用 PM2（推荐 ⭐）

**1. 服务器端安装 PM2**
```bash
npm install -g pm2
```

**2. 上传文件到服务器**
```bash
# 方法 A: 使用 SCP
scp -r ucard_admin root@your-server-ip:/var/www/

# 方法 B: 使用 FTP 工具（FileZilla、WinSCP 等）
# 将整个 ucard_admin 目录上传到 /var/www/
```

**3. 服务器端操作**
```bash
# 进入项目目录
cd /var/www/ucard_admin

# 安装依赖
npm install --production

# 生成 Prisma Client
npx prisma generate

# 创建日志目录
mkdir -p logs

# 配置环境变量
cp .env.production.example .env.production
nano .env.production  # 编辑配置

# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

**4. 完成！访问应用**
```
http://your-server-ip:3000
```

---

### 方式二：使用自动部署脚本

**1. 上传文件到服务器**

**2. 运行部署脚本**
```bash
cd /var/www/ucard_admin

# 给脚本执行权限
chmod +x deploy.sh

# 运行部署
./deploy.sh production
```

脚本会自动完成：
- ✅ 安装依赖
- ✅ 生成 Prisma Client
- ✅ 创建必要目录
- ✅ 启动应用

---

### 方式三：使用 Docker

**1. 构建镜像**
```bash
docker build -t ucard-admin .
```

**2. 运行容器**
```bash
docker run -d \
  --name ucard-admin \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://ucard_app:password@host:3306/ucard" \
  --restart unless-stopped \
  ucard-admin
```

**3. 查看日志**
```bash
docker logs -f ucard-admin
```

---

## 🔧 配置 Nginx 反向代理（可选但推荐）

**1. 安装 Nginx**
```bash
sudo apt update
sudo apt install nginx
```

**2. 创建配置文件**
```bash
sudo nano /etc/nginx/sites-available/ucard-admin
```

**3. 添加配置**
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 改为你的域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**4. 启用配置**
```bash
sudo ln -s /etc/nginx/sites-available/ucard-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**5. 配置 SSL（推荐使用 Let's Encrypt）**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📋 环境变量配置

创建 `.env.production` 文件：

```env
# 数据库连接（必需）
DATABASE_URL="mysql://用户名:密码@数据库地址:3306/ucard"

# 应用配置
NODE_ENV=production
PORT=3000

# JWT 密钥（修改为随机字符串）
JWT_SECRET=your-secret-key-change-this

# API 地址（如果有域名）
NEXT_PUBLIC_API_URL=https://your-domain.com
```

---

## 🛠️ 常用管理命令

### PM2 命令
```bash
pm2 status                    # 查看状态
pm2 logs ucard_admin          # 查看日志
pm2 restart ucard_admin       # 重启应用
pm2 stop ucard_admin          # 停止应用
pm2 delete ucard_admin        # 删除应用
pm2 monit                     # 监控面板
```

### 更新应用
```bash
cd /var/www/ucard_admin

# 1. 备份（可选）
cp -r .next .next.backup

# 2. 上传新的构建文件（覆盖 .next 目录）

# 3. 重启应用
pm2 restart ucard_admin
```

---

## ✅ 部署检查清单

部署前确认：
- [ ] 服务器已安装 Node.js 20+
- [ ] 服务器已安装 MySQL
- [ ] 数据库连接信息正确
- [ ] 已运行 `npm run build` 生成 `.next` 目录
- [ ] 已配置 `.env.production` 文件
- [ ] 服务器防火墙已开放必要端口

部署后确认：
- [ ] 访问 `http://服务器IP:3000` 能看到登录页面
- [ ] 能够正常登录
- [ ] 数据能正常显示
- [ ] 日志中无错误信息

---

## 🆘 常见问题

### 1. 应用无法启动
```bash
# 查看详细日志
pm2 logs ucard_admin --lines 100

# 检查端口占用
netstat -tlnp | grep 3000

# 检查环境变量
pm2 show ucard_admin
```

### 2. 数据库连接失败
```bash
# 测试数据库连接
mysql -u ucard_app -p -h 192.168.3.3

# 检查数据库服务
systemctl status mysql

# 检查防火墙
sudo ufw status
```

### 3. Nginx 配置问题
```bash
# 测试配置文件
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 📞 技术支持

如遇问题，请提供：
1. 错误日志：`pm2 logs ucard_admin`
2. 应用状态：`pm2 status`
3. 系统信息：`node -v`, `npm -v`

---

**部署完成后，访问您的应用：**
- HTTP: `http://your-server-ip:3000`
- HTTPS (配置 Nginx 后): `https://your-domain.com`

**默认登录信息请查看数据库或管理员提供的凭据。**
