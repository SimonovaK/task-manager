@echo off
chcp 65001 >nul
title Task Manager - Installation
color 0A

echo ================================================
echo    TASK MANAGER - WINDOWS INSTALLATION
echo ================================================
echo.
echo This will install Python dependencies and setup the application.
echo Please wait...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo.
    echo Please install Python 3.8 or later from:
    echo https://www.python.org/downloads/
    echo.
    echo IMPORTANT: During installation, CHECK "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

REM Get Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYVER=%%i
echo [OK] Python %PYVER% detected
echo.

REM Create virtual environment
echo Creating virtual environment...
python -m venv backend\venv
if errorlevel 1 (
    echo [ERROR] Failed to create virtual environment
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
call backend\venv\Scripts\activate.bat
pip install --upgrade pip

REM Install required packages
pip install fastapi==0.104.1 uvicorn[standard]==0.24.0 sqlalchemy==2.0.23 pydantic==2.5.0
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

REM Initialize database
echo.
echo Initializing database...
cd backend
python -c "from app.database import init_db; init_db()"
cd ..
if errorlevel 1 (
    echo [ERROR] Failed to initialize database
    pause
    exit /b 1
)

echo.
echo ================================================
echo    INSTALLATION COMPLETE!
echo ================================================
echo.
echo To start the application, run:
echo    1. Double-click 'start.bat'
echo    2. OR Run 'start.bat' from command line
echo.
echo Application will be available at:
echo    Frontend: http://localhost:8080
echo    Backend API: http://127.0.0.1:8000
echo.
pause