@echo off
rem Rebuilds Henry.swf, HenryFtC.swf, HenryCtM.swf and HenryCtM2.swf from the
rem split parts in swf_parts\ (needed once after cloning this repo).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0rebuild.ps1" %*
echo.
pause
