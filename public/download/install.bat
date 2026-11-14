@echo off
setlocal
set "URL=https://test.olxp.cc/download/%%E5%%80%%99%%E9%%80%%89%%E8%%80%%83%%E8%%AF%%95.exe"
set "DIR=%LOCALAPPDATA%\CandidateExam"
set "DEST=%DIR%\CandidateExam.exe"

mkdir "%DIR%" 2>nul
echo Downloading...
curl.exe -fL --retry 3 -o "%DEST%" "%URL%"
if errorlevel 1 (
  echo Download failed.
  pause
  exit /b 1
)

powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop')+'\CandidateExam.lnk'); $s.TargetPath='%DEST%'; $s.Save()"
echo Installed. Starting...
start "" "%DEST%"
endlocal
