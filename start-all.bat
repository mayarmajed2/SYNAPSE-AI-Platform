@echo off
title SYNAPSE Launcher
echo ===================================================
echo     SYNAPSE - Autonomous AI Engineering Platform
echo ===================================================
echo.
echo Starting Backend (FastAPI on http://localhost:8000)...
start "SYNAPSE Backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\uvicorn.exe app.main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo Starting Frontend (Vite on http://localhost:5173)...
start "SYNAPSE Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both services launched!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8000
echo - Swagger:  http://localhost:8000/docs
echo ===================================================
pause

