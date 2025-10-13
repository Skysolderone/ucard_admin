# UCard Admin 部署指南

## 一、部署前准备

### 服务器要求
- Node.js 20.x 或更高版本
- MySQL 8.0 或更高版本
- 至少 2GB RAM
- 至少 10GB 磁盘空间

### 需要上传的文件

```
ucard_admin/
├── .next/                    # 构建输出（必需）
├── node_modules/             # 依赖包（或在服务器上安装）
├── prisma/                   # 数据库配置（必需）
├── public/                   # 静态资源（如果有）
├── src/                      # 源代码（可选，建议保留）
├── .env.production           # 生产环境变量（必需）
├── package.json              # 依赖配置（必需）
├── package-lock.json         # 依赖锁定（必需）
├── next.config.ts            # Next.js 配置（必需）
├── ecosystem.config.js       # PM2 配置（推荐）
└── prisma/schema.prisma      # 数据库模型（必需）
```

## 二、部署步骤

### 方法一：使用 PM2（推荐）

#### 1. 安装 PM2
```bash
npm install -g pm2
```

#### 2. 上传文件到服务器
```bash
# 使用 scp 或 FTP 工具上传整个项目目录
scp -r ucard_admin root@your-server-ip:/var/www/
```

#### 3. 服务器端操作
```bash
# 进入项目目录
cd /var/www/ucard_admin

# 安装依赖
npm install --production

# 生成 Prisma Client
npx prisma generate

# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 进程列表
pm2 save

# 设置 PM2 开机自启动
pm2 startup
```

#### 4. PM2 常用命令
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs ucard_admin

# 重启应用
pm2 restart ucard_admin

# 停止应用
pm2 stop ucard_admin

# 删除应用
pm2 delete ucard_admin

# 监控应用
pm2 monit
```

### 方法二：使用 systemd 服务

#### 1. 创建服务文件
```bash
sudo nano /etc/systemd/system/ucard-admin.service
```

#### 2. 添加以下内容
```ini
[Unit]
Description=UCard Admin Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/ucard_admin
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

#### 3. 启动服务
```bash
# 重新加载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start ucard-admin

# 设置开机自启动
sudo systemctl enable ucard-admin

# 查看状态
sudo systemctl status ucard-admin

# 查看日志
sudo journalctl -u ucard-admin -f
```

### 方法三：使用 Docker（推荐用于容器化部署）

#### 1. 创建 Dockerfile
详见项目中的 `Dockerfile`

#### 2. 构建镜像
```bash
docker build -t ucard-admin .
```

#### 3. 运行容器
```bash
docker run -d \
  --name ucard-admin \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://user:password@host:3306/ucard" \
  --restart unless-stopped \
  ucard-admin
```

## 三、环境变量配置

创建 `.env.production` 文件：

```env
# 数据库连接
DATABASE_URL="mysql://ucard_app:Q3fGpsiMzIh789@192.168.3.3:3306/ucard"

# 应用配置
NODE_ENV=production
PORT=3000

# JWT 密钥（如果有）
JWT_SECRET=your-secret-key-here

# 其他配置
NEXT_PUBLIC_API_URL=https://your-domain.com
```

## 四、Nginx 反向代理配置（可选）

如果需要使用域名和 HTTPS，配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # 反向代理到 Next.js 应用
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

重载 Nginx：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 五、安全建议

1. **更改默认端口**：不要使用 3000 端口直接暴露
2. **使用 HTTPS**：配置 SSL 证书
3. **防火墙配置**：
   ```bash
   # 开放必要端口
   sudo ufw allow 22      # SSH
   sudo ufw allow 80      # HTTP
   sudo ufw allow 443     # HTTPS
   sudo ufw enable
   ```
4. **数据库安全**：
   - 不要使用 root 用户
   - 限制数据库访问 IP
   - 使用强密码
5. **定期备份**：
   ```bash
   # 备份数据库
   mysqldump -u ucard_app -p ucard > backup_$(date +%Y%m%d).sql
   ```

## 六、监控和维护

### 日志查看
```bash
# PM2 日志
pm2 logs ucard_admin --lines 100

# 系统日志（systemd）
sudo journalctl -u ucard-admin -n 100 -f
```

### 性能监控
```bash
# 使用 PM2 监控
pm2 monit

# 查看资源使用
pm2 show ucard_admin
```

### 更新部署
```bash
# 1. 拉取最新代码
git pull origin master

# 2. 安装新依赖
npm install

# 3. 重新构建
npm run build

# 4. 生成 Prisma Client
npx prisma generate

# 5. 重启应用
pm2 restart ucard_admin
```

## 七、故障排查

### 应用无法启动
1. 检查日志：`pm2 logs ucard_admin`
2. 检查端口占用：`netstat -tlnp | grep 3000`
3. 检查环境变量：`pm2 show ucard_admin`

### 数据库连接失败
1. 检查数据库是否运行：`systemctl status mysql`
2. 测试数据库连接：`mysql -u ucard_app -p -h 192.168.3.3`
3. 检查防火墙规则

### 页面无法访问
1. 检查 Nginx 状态：`systemctl status nginx`
2. 检查 Nginx 配置：`nginx -t`
3. 查看 Nginx 日志：`tail -f /var/log/nginx/error.log`

## 八、联系支持

如有问题，请检查日志文件或联系技术支持。
