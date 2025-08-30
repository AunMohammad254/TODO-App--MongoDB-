@echo off 
echo Personal Task Manager v1.0.0 Installer 
echo Installing dependencies... 
npm install --production 
if not exist ".env" copy ".env.example" ".env" 
echo Installation complete! 
pause 
