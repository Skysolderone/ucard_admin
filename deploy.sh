#!/bin/bash

# UCard Admin 部署脚本
# 用法: ./deploy.sh [production|staging]

set -e

echo "=========================================="
echo "UCard Admin 部署脚本"
echo "=========================================="

# 检查参数
ENV=${1:-production}
echo "部署环境: $ENV"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查必要工具
check_tools() {
    echo -e "${YELLOW}检查必要工具...${NC}"

    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: Node.js 未安装${NC}"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}错误: npm 未安装${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ 工具检查完成${NC}"
}

# 安装依赖
install_deps() {
    echo -e "${YELLOW}安装依赖...${NC}"
    npm ci --production
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
}

# 生成 Prisma Client
generate_prisma() {
    echo -e "${YELLOW}生成 Prisma Client...${NC}"
    npx prisma generate
    echo -e "${GREEN}✓ Prisma Client 生成完成${NC}"
}

# 构建应用（如果本地部署需要）
build_app() {
    echo -e "${YELLOW}构建应用...${NC}"
    npm run build
    echo -e "${GREEN}✓ 应用构建完成${NC}"
}

# 创建必要目录
create_dirs() {
    echo -e "${YELLOW}创建日志目录...${NC}"
    mkdir -p logs
    echo -e "${GREEN}✓ 目录创建完成${NC}"
}

# 启动应用
start_app() {
    echo -e "${YELLOW}启动应用...${NC}"

    # 检查是否安装了 PM2
    if command -v pm2 &> /dev/null; then
        echo "使用 PM2 启动应用..."
        pm2 restart ecosystem.config.js
        pm2 save
        echo -e "${GREEN}✓ 应用已通过 PM2 启动${NC}"
        echo ""
        echo "查看应用状态: pm2 status"
        echo "查看日志: pm2 logs ucard_admin"
    else
        echo -e "${YELLOW}PM2 未安装，使用 npm start 启动...${NC}"
        echo "建议安装 PM2: npm install -g pm2"
        npm start &
        echo -e "${GREEN}✓ 应用已启动（后台运行）${NC}"
    fi
}

# 健康检查
health_check() {
    echo -e "${YELLOW}等待应用启动...${NC}"
    sleep 5

    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 应用健康检查通过${NC}"
    else
        echo -e "${RED}⚠ 警告: 应用可能未正常启动${NC}"
        echo "请检查日志: pm2 logs ucard_admin"
    fi
}

# 主流程
main() {
    echo ""
    check_tools
    echo ""
    install_deps
    echo ""
    generate_prisma
    echo ""
    create_dirs
    echo ""

    # 如果是首次部署或需要重新构建
    if [ ! -d ".next" ]; then
        build_app
        echo ""
    fi

    start_app
    echo ""
    health_check

    echo ""
    echo "=========================================="
    echo -e "${GREEN}部署完成！${NC}"
    echo "=========================================="
    echo "应用访问地址: http://localhost:3000"
    echo "数据库: MySQL (确保数据库连接配置正确)"
    echo ""
    echo "常用命令:"
    echo "  查看状态: pm2 status"
    echo "  查看日志: pm2 logs ucard_admin"
    echo "  重启应用: pm2 restart ucard_admin"
    echo "  停止应用: pm2 stop ucard_admin"
    echo ""
}

# 执行主流程
main
