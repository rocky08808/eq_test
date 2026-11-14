@echo off
setlocal
powershell -NoProfile -Command ^
  "$n=-join [char[]](0x5019,0x9009,0x8003,0x8BD5);" ^
  "Write-Host ([string]::new([char[]](0x6B63,0x5728,0x5378,0x8F7D,0x002E,0x002E,0x002E)));" ^
  "Get-Process -Name $n -ErrorAction SilentlyContinue | Stop-Process -Force;" ^
  "$lnk=Join-Path ([Environment]::GetFolderPath('Desktop')) ($n+'.lnk');" ^
  "$dir=Join-Path $env:LOCALAPPDATA $n;" ^
  "$cache=Join-Path $env:APPDATA ($n+'.exe');" ^
  "$failed=$false;" ^
  "foreach ($p in @($lnk,$dir,$cache)) { if (Test-Path -LiteralPath $p) { try { Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction Stop } catch { $failed=$true } } };" ^
  "if ($failed) { Write-Host ([string]::new([char[]](0x5378,0x8F7D,0x5931,0x8D25,0x3002))); exit 1 };" ^
  "Write-Host ([string]::new([char[]](0x5DF2,0x5378,0x8F7D,0x3002)))"
if errorlevel 1 (
  pause
  exit /b 1
)
pause
endlocal
