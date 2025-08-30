@echo off
echo ========================================
echo Personal Task Manager v1.0.0 Setup
echo ========================================
echo.

:: Check if Node.js is installed
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please download and install Node.js from https://nodejs.org/
    echo Minimum required version: v16.0.0
    pause
    exit /b 1
)

:: Display Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js version: %NODE_VERSION%
echo.

:: Check if npm is available
echo [2/6] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo npm should come with Node.js installation
    pause
    exit /b 1
)

:: Display npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo npm version: %NPM_VERSION%
echo.

:: Install dependencies
echo [3/6] Installing dependencies...
echo This may take a few minutes...
npm install --production
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

:: Check if .env file exists
echo [4/6] Checking environment configuration...
if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env file from template...
        copy ".env.example" ".env" >nul
        echo .env file created successfully!
        echo.
        echo IMPORTANT: You need to configure your .env file with:
        echo - MongoDB Atlas connection string (MONGO_URI)
        echo - JWT secret key (JWT_SECRET)
        echo.
        echo Opening .env file for editing...
        timeout /t 3 >nul
        notepad .env
    ) else (
        echo ERROR: .env.example file not found
        echo Please ensure you have the complete release package
        pause
        exit /b 1
    )
) else (
    echo .env file already exists
)
echo.

:: Generate JWT secret if needed
echo [5/6] Checking JWT secret configuration...
findstr /C:"JWT_SECRET=your-" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo Generating secure JWT secret...
    for /f "tokens=*" %%i in ('node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"') do set JWT_SECRET=%%i
    
    :: Create temporary file with updated JWT secret
    powershell -Command "(Get-Content '.env') -replace 'JWT_SECRET=your-.*', 'JWT_SECRET=%JWT_SECRET%' | Set-Content '.env.tmp'"
    move ".env.tmp" ".env" >nul
    echo JWT secret generated and updated in .env file
else (
    echo JWT secret is already configured
)
echo.

:: Final setup check
echo [6/6] Performing final setup check...

:: Check if MongoDB URI is configured
findstr /C:"MONGO_URI=mongodb+srv://" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MongoDB Atlas connection string not configured
    echo Please update MONGO_URI in .env file with your MongoDB Atlas connection string
    echo.
)

:: Check if port is available
netstat -an | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port 3000 is already in use
    echo You may need to change the PORT setting in .env file
    echo.
)

echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Configure your MongoDB Atlas connection in .env file
echo 2. Run 'npm start' to start the backend server
echo 3. Run 'npm run electron' to launch the desktop app
echo.
echo For detailed instructions, see RELEASE_NOTES.md
echo For troubleshooting, see README.md
echo.
echo Would you like to start the application now? (y/n)
set /p START_APP="Enter your choice: "

if /i "%START_APP%"=="y" (
    echo.
    echo Starting Personal Task Manager...
    echo Backend server will start first, then the desktop app will launch
    echo.
    echo Starting backend server...
    start "Personal Task Manager Backend" cmd /k "npm start"
    
    echo Waiting for backend to initialize...
    timeout /t 5 >nul
    
    echo Starting desktop application...
    start "Personal Task Manager Desktop" cmd /k "npm run electron"
    
    echo.
    echo Personal Task Manager is starting!
    echo - Backend server: http://localhost:3000
    echo - Desktop app: Should open automatically
    echo.
    echo If you encounter any issues, check the troubleshooting guide in README.md
) else (
    echo.
    echo Setup complete! You can start the application later by running:
    echo   npm start          (to start the backend)
    echo   npm run electron   (to start the desktop app)
)

echo.
echo Thank you for using Personal Task Manager!
echo.
pause