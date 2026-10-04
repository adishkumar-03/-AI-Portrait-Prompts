@echo off
title PromptPersona AI Server
echo Starting PromptPersona local server...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
