@echo off
title SYNAPSE Backend Server
cd /d %~dp0
echo Starting SYNAPSE FastAPI Server on port 8000...
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
pause

