#!/bin/bash

# UCard Admin Docker Image Packager

echo "========================================"
echo "UCard Admin Docker Image Packager"
echo "========================================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker is not installed or not running${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if .next/standalone exists
if [ ! -d ".next/standalone" ]; then
    echo -e "${RED}[ERROR] .next/standalone directory not found${NC}"
    echo "Please run: npm run build"
    exit 1
fi

echo "[1/4] Cleaning old image files..."
rm -f ucard_admin_docker.tar.gz ucard_admin_docker.tar

echo "[2/4] Building Docker image..."
docker build -t ucard-admin:latest .

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Docker image build failed${NC}"
    exit 1
fi

echo "[3/4] Saving image to file..."
docker save ucard-admin:latest -o ucard_admin_docker.tar

if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to save image${NC}"
    exit 1
fi

echo "[4/4] Compressing image file..."
gzip ucard_admin_docker.tar

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}[WARNING] Compression failed, but .tar file is usable${NC}"
else
    echo -e "${GREEN}Compression successful${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}Build Complete!${NC}"
echo "========================================"
echo "Image Name: ucard-admin:latest"

if [ -f "ucard_admin_docker.tar.gz" ]; then
    SIZE=$(du -h ucard_admin_docker.tar.gz | cut -f1)
    echo "File: ucard_admin_docker.tar.gz"
    echo "Size: $SIZE"
    echo "Location: $(pwd)/ucard_admin_docker.tar.gz"
    FILENAME="ucard_admin_docker.tar.gz"
    LOAD_CMD="gunzip -c /tmp/ucard_admin_docker.tar.gz | docker load"
else
    SIZE=$(du -h ucard_admin_docker.tar | cut -f1)
    echo "File: ucard_admin_docker.tar"
    echo "Size: $SIZE"
    echo "Location: $(pwd)/ucard_admin_docker.tar"
    FILENAME="ucard_admin_docker.tar"
    LOAD_CMD="docker load -i /tmp/ucard_admin_docker.tar"
fi

echo ""
echo "Next Steps:"
echo "----------------------------------------"
echo "1. Upload to server:"
echo "   scp $FILENAME root@your-server:/tmp/"
echo ""
echo "2. Load image on server:"
echo "   $LOAD_CMD"
echo ""
echo "3. Run container:"
echo "   docker run -d --name ucard-admin -p 3000:3000 \\"
echo "     -e DATABASE_URL=\"mysql://user:pass@host:3306/db\" \\"
echo "     --restart unless-stopped \\"
echo "     ucard-admin:latest"
echo ""
echo "4. Check status:"
echo "   docker ps"
echo "   docker logs ucard-admin"
echo "----------------------------------------"
echo ""
