@echo off
chcp 65001 >nul
echo ========================================
echo UCard Admin Docker Image Packager
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not running
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if .next directory exists
if not exist ".next\standalone" (
    echo [ERROR] .next\standalone directory not found
    echo Please run: npm run build
    pause
    exit /b 1
)

echo [1/4] Cleaning old image files...
if exist "ucard_admin_docker.tar.gz" del /f /q ucard_admin_docker.tar.gz
if exist "ucard_admin_docker.tar" del /f /q ucard_admin_docker.tar

echo [2/4] Building Docker image...
docker build -t ucard-admin:latest .

if %errorlevel% neq 0 (
    echo [ERROR] Docker image build failed
    pause
    exit /b 1
)

echo [3/4] Saving image to file...
docker save ucard-admin:latest -o ucard_admin_docker.tar

if %errorlevel% neq 0 (
    echo [ERROR] Failed to save image
    pause
    exit /b 1
)

echo [4/4] Compressing image file...
powershell -Command "Compress-Archive -Path 'ucard_admin_docker.tar' -DestinationPath 'ucard_admin_docker.tar.gz' -Force"

if %errorlevel% neq 0 (
    echo [WARNING] Compression failed, but .tar file is usable
) else (
    echo Compression successful, removing .tar file...
    del /f /q ucard_admin_docker.tar
)

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo Image Name: ucard-admin:latest

if exist "ucard_admin_docker.tar.gz" (
    for %%A in (ucard_admin_docker.tar.gz) do (
        set /a sizeMB=%%~zA/1048576
    )
    echo File: ucard_admin_docker.tar.gz
    echo Size: ~!sizeMB! MB
    echo Location: %CD%\ucard_admin_docker.tar.gz
) else (
    for %%A in (ucard_admin_docker.tar) do (
        set /a sizeMB=%%~zA/1048576
    )
    echo File: ucard_admin_docker.tar
    echo Size: ~!sizeMB! MB
    echo Location: %CD%\ucard_admin_docker.tar
)

echo.
echo Next Steps:
echo ----------------------------------------
echo 1. Upload to server:
if exist "ucard_admin_docker.tar.gz" (
    echo    scp ucard_admin_docker.tar.gz root@your-server:/tmp/
) else (
    echo    scp ucard_admin_docker.tar root@your-server:/tmp/
)
echo.
echo 2. Load image on server:
if exist "ucard_admin_docker.tar.gz" (
    echo    gunzip -c /tmp/ucard_admin_docker.tar.gz ^| docker load
) else (
    echo    docker load -i /tmp/ucard_admin_docker.tar
)
echo.
echo 3. Run container:
echo    docker run -d --name ucard-admin -p 3000:3000 \
echo      -e DATABASE_URL="mysql://user:pass@host:3306/db" \
echo      --restart unless-stopped \
echo      ucard-admin:latest
echo.
echo 4. Check status:
echo    docker ps
echo    docker logs ucard-admin
echo ----------------------------------------
echo.
pause
