@echo off
cd /d "T:\BookStore_Buoi8_Starter"
set "PATH=%APPDATA%\npm;%APPDATA%\npm\node_modules\@expo\ngrok\node_modules\.bin;%PATH%"

start "API" cmd /k "cd /d ""T:\BookStore_Buoi8_Starter"" && npm run api"
timeout /t 3 /n >nul

start "Expo Tunnel" cmd /k "cd /d ""T:\BookStore_Buoi8_Starter"" && npx expo start --tunnel --clear --port 8082"
