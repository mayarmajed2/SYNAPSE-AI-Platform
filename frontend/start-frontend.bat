@echo off
title SYNAPSE Frontend Server
cd /d %~dp0
echo Starting SYNAPSE React+Vite Frontend on port 5173...
npm run dev
pause

