@echo off
title Push to GitHub - Levi.ai
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0push_to_github.ps1"
echo.
pause
