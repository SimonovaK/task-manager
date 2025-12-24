@echo off
chcp 65001 >nul
title Task Manager - Stopping Services
color 0C

echo ================================================
echo    TASK MANAGER - STOPPING SERVICES
echo ================================================
echo.

echo Stopping all Task Manager processes...

REM Kill Python processes on ports 8000 and 8080
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Kill any remaining uvicorn processes
taskkill /F /IM uvicorn.exe >nul 2>&1

REM Kill any remaining python processes with our title
taskkill /FI "WINDOWTITLE eq Task Manager Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Task Manager Frontend*" /F >nul 2>&1

echo.
echo [✓] All services stopped
echo.
pause