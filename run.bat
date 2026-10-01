@echo off
title AI Resume Analyzer Launcher
color 0b

echo ============================================================
echo        AI RESUME ANALYZER ^& BENCHMARK PLATFORM
echo ============================================================
echo.
echo [*] Project Directory: %~dp0
echo.

:: 1. Check Python installation
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found in your PATH!
    echo Please install Python 3.10+ from https://python.org and enable "Add to PATH".
    pause
    exit /b 1
)

:: 2. Check Node.js / NPM installation
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / NPM was not found in your PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Starting FastAPI Backend on http://localhost:8000 ...
start "AI Resume - FastAPI Backend (Port 8000)" cmd /k "cd /d ""%~dp0backend"" && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Starting Next.js Frontend on http://localhost:3000 ...
start "AI Resume - Next.js Frontend (Port 3000)" cmd /k "cd /d ""%~dp0frontend\ai-resume-analyzer"" && npm run dev"

echo [3/3] Starting Streamlit Benchmark Dashboard on http://localhost:8501 ...
start "AI Resume - Streamlit UI (Port 8501)" cmd /k "cd /d ""%~dp0backend"" && python -m streamlit run app.py --server.port 8501 --server.headless true"

echo.
echo ============================================================
echo  All services have been launched in separate terminal windows:
echo.
echo    * Web App (Next.js):     http://localhost:3000
echo    * API Documentation:     http://localhost:8000/docs
echo    * Benchmark Dashboard:   http://localhost:8501
echo    * Active Database:       Supabase Cloud
echo    * Active AI Engine:      Groq Cloud LLM
echo ============================================================
echo.
echo Opening http://localhost:3000 in your browser...
timeout /t 4 /nobreak >nul

start http://localhost:3000

echo.
echo Launcher complete. You can close this window at any time.
echo To stop all services, run stop.bat or close the individual windows.
pause >nul
