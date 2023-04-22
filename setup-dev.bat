@echo off
REM RTA Camera Management - Development Setup Script for Windows

echo 🚀 Starting RTA Camera Management System...

REM Check if we're in the correct directory
if not exist "requirements.txt" (
    echo ❌ Error: Please run this script from the rta_cma project root directory
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Error: Frontend directory not found
    exit /b 1
)

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is not installed
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed
    exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: npm is not installed
    exit /b 1
)

echo ✅ All dependencies are available

REM Create Python virtual environment if needed
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

echo 🔧 Activating virtual environment...
call venv\Scripts\activate

echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
cd frontend
if not exist "node_modules" (
    npm install
)
cd ..

echo.
echo 🎉 Setup complete!
echo.
echo To start the system:
echo 1. Start the backend API:
echo    uvicorn app.main:app --reload
echo.  
echo 2. In another terminal, start the frontend:
echo    cd frontend ^&^& npm start
echo.
echo Then visit: http://localhost:3000
echo.