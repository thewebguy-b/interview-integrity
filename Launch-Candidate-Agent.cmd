@echo off
title Interview Integrity - Candidate Desktop Agent
echo ========================================================
echo   Launching Interview Integrity Candidate Agent...
echo ========================================================
echo.
cd /d "%~dp0"
call npm run dev:agent
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start Candidate Agent.
    echo Please make sure Node.js and dependencies are installed.
    pause
)
