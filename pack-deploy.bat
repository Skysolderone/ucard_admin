@echo off
echo ========================================
echo UCard Admin 部署文件打包工具
echo ========================================
echo.

REM 检查 .next 目录是否存在
if not exist ".next" (
    echo [错误] .next 目录不存在，请先运行 npm run build
    pause
    exit /b 1
)

REM 检查 .env.production 是否存在
if not exist ".env.production" (
    echo [警告] .env.production 不存在
    echo 正在创建模板文件...
    copy .env.production.example .env.production
    echo 请编辑 .env.production 文件，填入正确的配置信息
    echo.
)

echo [1/3] 清理旧的打包文件...
if exist "ucard_admin_deploy.zip" del /f /q ucard_admin_deploy.zip

echo [2/3] 正在打包部署文件...
echo   - .next (构建产物)
echo   - prisma (数据库配置)
echo   - package.json
echo   - package-lock.json
echo   - next.config.ts
echo   - ecosystem.config.js
echo   - .env.production

REM 使用 PowerShell 创建 ZIP 文件
powershell -Command "Compress-Archive -Path '.next','prisma','package.json','package-lock.json','next.config.ts','ecosystem.config.js','.env.production' -DestinationPath 'ucard_admin_deploy.zip' -Force"

if %errorlevel% neq 0 (
    echo [错误] 打包失败
    pause
    exit /b 1
)

echo [3/3] 检查打包文件大小...
for %%A in (ucard_admin_deploy.zip) do echo 文件大小: %%~zA 字节 (约 %%~zA / 1048576 MB)

echo.
echo ========================================
echo 打包完成！
echo ========================================
echo 文件名: ucard_admin_deploy.zip
echo 位置: %CD%\ucard_admin_deploy.zip
echo.
echo 下一步:
echo 1. 将 ucard_admin_deploy.zip 上传到服务器
echo 2. 在服务器上解压: unzip ucard_admin_deploy.zip -d /var/www/ucard_admin
echo 3. 安装依赖: npm install --production
echo 4. 生成 Prisma: npx prisma generate
echo 5. 启动应用: pm2 start ecosystem.config.js
echo.
pause
