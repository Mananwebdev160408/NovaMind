@echo off
REM NovaMind Quick Start Script for Windows
REM This script starts MongoDB, backend, and frontend automatically

echo.
echo  ===============================================
echo    Starting NovaMind AI Productivity Suite
echo  ===============================================
echo.

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MongoDB not found. Please install MongoDB first.
    echo Visit: https://www.mongodb.com/docs/manual/installation/
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Checking dependencies...
echo.

REM Install backend dependencies
cd server
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)
cd ..

REM Install frontend dependencies
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo.
echo [2/5] Starting MongoDB...
start "MongoDB" mongod

timeout /t 3 /nobreak >nul

echo [3/5] Starting backend server...
cd server
start "NovaMind Backend" cmd /k npm start
cd ..

timeout /t 3 /nobreak >nul

echo [4/5] Starting frontend...
start "NovaMind Frontend" cmd /k npm run dev

timeout /t 3 /nobreak >nul

echo.
echo [5/5] NovaMind is ready!
echo.
echo  ===============================================
echo    NovaMind is running!
echo  ===============================================
echo.
echo  Frontend:  http://localhost:5173
echo  Backend:   http://localhost:5000
echo  MongoDB:   mongodb://localhost:27017/novamind
echo.
echo  ===============================================
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:5173

echo.
echo NovaMind is running in separate windows.
echo Close those windows to stop the services.
echo.
pause
