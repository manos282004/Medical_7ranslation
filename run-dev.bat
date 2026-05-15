@echo off
setlocal
cd /d "%~dp0"

REM Starts backend + frontend with one double-click.
REM Requires PowerShell and Node.js installed.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-dev.ps1"

