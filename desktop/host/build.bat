@echo off
setlocal
cd /d "%~dp0"
if exist "%USERPROFILE%\go\bin\go-winres.exe" "%USERPROFILE%\go\bin\go-winres.exe" make --in winres.json --arch amd64 --out rsrc
set CGO_ENABLED=0
go build -trimpath -ldflags="-s -w -H windowsgui" -o "..\..\public\download\候选考试.exe"
if errorlevel 1 exit /b 1
echo Built public\download\候选考试.exe
