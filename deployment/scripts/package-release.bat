@echo off
echo ========================================
echo Personal Task Manager Release Packager
echo ========================================
echo.

set VERSION=1.0.0
set APP_NAME=personal-task-manager
set RELEASE_DIR=release
set PACKAGE_NAME=%APP_NAME%-v%VERSION%

echo Creating release package for %APP_NAME% v%VERSION%
echo.

echo [1/6] Creating release directory...
if exist "%RELEASE_DIR%" rmdir /s /q "%RELEASE_DIR%"
mkdir "%RELEASE_DIR%"
mkdir "%RELEASE_DIR%\%PACKAGE_NAME%"
echo Release directory created
echo.

echo [2/6] Copying application files...
copy "package.json" "%RELEASE_DIR%\%PACKAGE_NAME%\" >nul
copy "main.js" "%RELEASE_DIR%\%PACKAGE_NAME%\" >nul
copy ".env.example" "%RELEASE_DIR%\%PACKAGE_NAME%\" >nul
copy "setup.bat" "%RELEASE_DIR%\%PACKAGE_NAME%\" >nul
copy "README.md" "%RELEASE_DIR%\%PACKAGE_NAME%\" >nul
copy "RELEASE_NOTES.md" "%RELEASE_DIR%\%PACKAGE_NAME%\" >nul
if exist "package-lock.json" copy "package-lock.json" "%RELEASE_DIR%\%PACKAGE_NAME%\" >nul
echo Application files copied
echo.

echo [3/6] Copying directories...
if exist "src" xcopy "src" "%RELEASE_DIR%\%PACKAGE_NAME%\src\" /E /I /Q >nul
if exist "public" xcopy "public" "%RELEASE_DIR%\%PACKAGE_NAME%\public\" /E /I /Q >nul
if exist "config" xcopy "config" "%RELEASE_DIR%\%PACKAGE_NAME%\config\" /E /I /Q >nul
if exist "tests" xcopy "tests" "%RELEASE_DIR%\%PACKAGE_NAME%\tests\" /E /I /Q >nul
echo Directories copied
echo.

echo [4/6] Creating installation script...
echo @echo off > "%RELEASE_DIR%\%PACKAGE_NAME%\install.bat"
echo echo Personal Task Manager v1.0.0 Installer >> "%RELEASE_DIR%\%PACKAGE_NAME%\install.bat"
echo echo Installing dependencies... >> "%RELEASE_DIR%\%PACKAGE_NAME%\install.bat"
echo npm install --production >> "%RELEASE_DIR%\%PACKAGE_NAME%\install.bat"
echo if not exist ".env" copy ".env.example" ".env" >> "%RELEASE_DIR%\%PACKAGE_NAME%\install.bat"
echo echo Installation complete! >> "%RELEASE_DIR%\%PACKAGE_NAME%\install.bat"
echo pause >> "%RELEASE_DIR%\%PACKAGE_NAME%\install.bat"
echo Installation script created
echo.

echo [5/6] Creating quick start guide...
echo # Personal Task Manager v1.0.0 - Quick Start > "%RELEASE_DIR%\%PACKAGE_NAME%\QUICK_START.md"
echo. >> "%RELEASE_DIR%\%PACKAGE_NAME%\QUICK_START.md"
echo ## Installation >> "%RELEASE_DIR%\%PACKAGE_NAME%\QUICK_START.md"
echo 1. Run install.bat >> "%RELEASE_DIR%\%PACKAGE_NAME%\QUICK_START.md"
echo 2. Configure .env file >> "%RELEASE_DIR%\%PACKAGE_NAME%\QUICK_START.md"
echo 3. Run: npm start >> "%RELEASE_DIR%\%PACKAGE_NAME%\QUICK_START.md"
echo 4. Run: npm run electron >> "%RELEASE_DIR%\%PACKAGE_NAME%\QUICK_START.md"
echo Quick start guide created
echo.

echo [6/6] Creating release package...
powershell -Command "Compress-Archive -Path 'release\personal-task-manager-v1.0.0\*' -DestinationPath 'release\personal-task-manager-v1.0.0.zip' -Force"

if exist "release\personal-task-manager-v1.0.0.zip" (
    echo.
    echo ========================================
    echo Release package created successfully!
    echo ========================================
    echo.
    echo Package: personal-task-manager-v1.0.0.zip
    echo Location: release folder
    echo.
    echo The package is ready for GitHub release!
) else (
    echo ERROR: Failed to create release package
)

echo.
pause