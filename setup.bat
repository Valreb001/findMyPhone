@echo off
REM Find My Phone - Development Setup Script (Windows)

echo.
echo 🚀 Find My Phone - Setup Script
echo ================================
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION%

REM Setup Server
echo.
echo 📦 Setting up Server...
cd server
call npm install
if not exist .env (
    copy .env.example .env
    echo ✅ Created server\.env
)
cd ..

REM Setup Client
echo.
echo 📦 Setting up Client...
cd client
call npm install
if not exist .env (
    copy .env.example .env
    echo ✅ Created client\.env
)
cd ..

echo.
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Start server: cd server ^&^& npm run dev
echo 2. Start client: cd client ^&^& npm run dev (in another terminal)
echo 3. Open browser: http://localhost:5173
echo.
pause
