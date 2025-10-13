#!/bin/bash

# UCard Admin 部署文件打包工具

echo "========================================"
echo "UCard Admin 部署文件打包工具"
echo "========================================"
echo ""

# 颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 .next 目录
if [ ! -d ".next" ]; then
    echo -e "${RED}[错误] .next 目录不存在，请先运行 npm run build${NC}"
    exit 1
fi

# 检查 .env.production
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}[警告] .env.production 不存在${NC}"
    echo "正在创建模板文件..."
    cp .env.production.example .env.production
    echo "请编辑 .env.production 文件，填入正确的配置信息"
    echo ""
fi

echo "[1/3] 清理旧的打包文件..."
rm -f ucard_admin_deploy.tar.gz

echo "[2/3] 正在打包部署文件..."
echo "  - .next (构建产物)"
echo "  - prisma (数据库配置)"
echo "  - package.json"
echo "  - package-lock.json"
echo "  - next.config.ts"
echo "  - ecosystem.config.js"
echo "  - .env.production"

tar -czf ucard_admin_deploy.tar.gz \
  .next \
  prisma \
  package.json \
  package-lock.json \
  next.config.ts \
  ecosystem.config.js \
  .env.production

if [ $? -ne 0 ]; then
    echo -e "${RED}[错误] 打包失败${NC}"
    exit 1
fi

echo "[3/3] 检查打包文件大小..."
SIZE=$(du -h ucard_admin_deploy.tar.gz | cut -f1)
echo -e "${GREEN}文件大小: $SIZE${NC}"

echo ""
echo "========================================"
echo -e "${GREEN}打包完成！${NC}"
echo "========================================"
echo "文件名: ucard_admin_deploy.tar.gz"
echo "位置: $(pwd)/ucard_admin_deploy.tar.gz"
echo ""
echo "下一步:"
echo "1. 上传到服务器:"
echo "   scp ucard_admin_deploy.tar.gz root@your-server:/var/www/"
echo ""
echo "2. 服务器端操作:"
echo "   cd /var/www"
echo "   tar -xzf ucard_admin_deploy.tar.gz"
echo "   cd ucard_admin"
echo "   npm install --production"
echo "   npx prisma generate"
echo "   pm2 start ecosystem.config.js"
echo ""
