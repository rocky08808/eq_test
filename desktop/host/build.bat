@echo off
setlocal
cd /d "%~dp0"
if exist "%USERPROFILE%\go\bin\go-winres.exe" "%USERPROFILE%\go\bin\go-winres.exe" make --in winres.json --arch amd64 --out rsrc
set CGO_ENABLED=0
go build -trimpath -ldflags="-s -w -H windowsgui" -o "..\..\public\download\exam.exe"
if errorlevel 1 exit /b 1
powershell -NoProfile -Command "$n=-join [char[]](0x5019,0x9009,0x8003,0x8BD5); $dir=(Resolve-Path '..\..\public\download').Path; $dest=Join-Path $dir ($n+'.exe'); Move-Item -LiteralPath (Join-Path $dir 'exam.exe') -Destination $dest -Force; Write-Host ('Built ' + $dest)"
if errorlevel 1 exit /b 1
endlocal
