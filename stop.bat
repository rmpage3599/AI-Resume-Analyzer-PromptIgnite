@echo off
title AI Resume Analyzer - Stop All Services
color 0c

echo ============================================================
echo   STOPPING ALL AI RESUME ANALYZER SERVICES
echo ============================================================
echo.

echo [*] Stopping services running on ports 8000 (FastAPI), 3000 (Next.js), and 8501 (Streamlit)...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    echo Stopping PID %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    echo Stopping PID %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8501 ^| findstr LISTENING 2^>nul') do (
    echo Stopping PID %%a on port 8501...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [*] All project services have been stopped.
echo.
pause
