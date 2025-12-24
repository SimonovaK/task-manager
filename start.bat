@echo off
chcp 65001 >nul
title Task Manager - Starting Services
color 0B

echo ================================================
echo    TASK MANAGER - STARTING SERVICES
echo ================================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please run install.bat first
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "backend\venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found!
    echo Please run install.bat first
    pause
    exit /b 1
)

echo Starting Backend API Server (port 8000)...
start "Task Manager Backend" cmd /k "chcp 65001 && title Task Manager Backend && color 0A && cd /d %~dp0backend && call venv\Scripts\activate.bat && python run.py"
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server (port 8080)...
start "Task Manager Frontend" cmd /k "chcp 65001 && title Task Manager Frontend && color 0D && cd /d %~dp0frontend && python -m http.server 8080"
timeout /t 3 /nobreak >nul

echo.
echo Starting Application Launcher...
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080"

echo ================================================
echo    SERVICES STARTED!
echo ================================================
echo.
echo Access the application at: http://localhost:8080
echo.
echo Backend API: http://127.0.0.1:8000
echo.
echo To stop all services, run 'stop.bat'
echo.
echo [IMPORTANT] Keep this window open while using the app
echo Closing this window will NOT stop the services
echo.
pause