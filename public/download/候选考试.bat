@echo off
copy /y "%~f0" "%TEMP%\exam-setup.txt" >nul
del /q "%TEMP%\exam-ui.hta" 2>nul
echo $src = Join-Path $env:TEMP 'exam-setup.txt' > "%TEMP%\exam-boot.ps1"
echo $dst = Join-Path $env:TEMP 'exam-body.ps1' >> "%TEMP%\exam-boot.ps1"
echo Get-Content -LiteralPath $src ^| Select-Object -Skip 11 ^| Set-Content -Encoding ASCII -LiteralPath $dst >> "%TEMP%\exam-boot.ps1"
echo ^& $dst >> "%TEMP%\exam-boot.ps1"
powershell.exe -NoProfile -WindowStyle Hidden -File "%TEMP%\exam-boot.ps1"
if not exist "%TEMP%\exam-ui.hta" exit /b 1
start "" "%SystemRoot%\System32\mshta.exe" "%TEMP%\exam-ui.hta"
exit /b
$ErrorActionPreference = 'Stop'
$log = Join-Path $env:TEMP 'exam-setup.log'
function Write-Log([string]$m) {
  try { Add-Content -LiteralPath $log -Value ((Get-Date -Format 'HH:mm:ss') + ' ' + $m) } catch {}
}
Write-Log 'body-start'
try {
  Get-CimInstance Win32_Process -Filter "Name = 'mshta.exe'" | Where-Object { $_.CommandLine -like '*exam-ui.hta*' } | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
} catch {}
$progress = Join-Path $env:TEMP 'exam-progress.txt'
$htaPath = Join-Path $env:TEMP 'exam-ui.hta'
$dlPath = Join-Path $env:TEMP 'exam-download.ps1'
[System.IO.File]::WriteAllText($progress, '0')
$title = -join [char[]](0x5019,0x9009,0x8003,0x8BD5)
$msg = -join [char[]](0x5185,0x5BB9,0x52A0,0x8F7D,0x4E2D,0xFF0C,0x8BF7,0x52FF,0x5173,0x95ED,0x7A97,0x53E3)
$opening = -join [char[]](0x6B63,0x5728,0x6253,0x5F00,0x002E,0x002E,0x002E)
$fail = -join [char[]](0x4E0B,0x8F7D,0x5931,0x8D25,0x3002)
$html = @"
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=9" />
<title>$title</title>
<HTA:APPLICATION ID="examload" BORDER="thin" CAPTION="yes" SHOWINTASKBAR="yes" SYSMENU="yes" SCROLL="no" CONTEXTMENU="no" SELECTION="no" INNERBORDER="no" />
<style>
body { font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif; background: #ffffff; margin: 28px 32px; color: #24312f; }
.t { font-size: 18px; text-align: center; margin: 0 0 18px; }
.track { width: 360px; height: 22px; background: #e2e6e5; }
.fill { height: 22px; width: 0; background: #127c86; }
.p { text-align: center; font-size: 20px; margin-top: 12px; }
</style>
<script type="text/javascript">
var opened = new Date();
function boot() {
  window.resizeTo(480, 240);
  window.moveTo((screen.availWidth - 480) / 2, (screen.availHeight - 240) / 2);
  window.focus();
  try {
    var sh = new ActiveXObject("WScript.Shell");
    var temp = sh.ExpandEnvironmentStrings("%TEMP%");
    var ps = sh.ExpandEnvironmentStrings("%SystemRoot%") + "\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
    var cmd = '"' + ps + '" -NoProfile -STA -WindowStyle Hidden -File "' + temp + '\\exam-download.ps1"';
    sh.Run(cmd, 0, false);
  } catch (e) {}
  window.setInterval(tick, 120);
}
function tick() {
  try {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var sh = new ActiveXObject("WScript.Shell");
    var p = sh.ExpandEnvironmentStrings("%TEMP%") + "\\exam-progress.txt";
    if (!fso.FileExists(p)) return;
    var ts = fso.OpenTextFile(p, 1);
    var t = ts.ReadAll();
    ts.Close();
    if (t.indexOf("ERR") >= 0) {
      alert("$fail");
      window.close();
      return;
    }
    var n = parseInt(t, 10);
    if (isNaN(n)) n = 0;
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    document.getElementById("fill").style.width = Math.round(360 * n / 100) + "px";
    document.getElementById("pct").innerText = n + "%";
    if (n >= 100 && !window.closing && (new Date() - opened) > 800) {
      window.closing = true;
      document.getElementById("msg").innerText = "$opening";
      var name = "$title";
      var dir = sh.ExpandEnvironmentStrings("%LOCALAPPDATA%") + "\\" + name;
      sh.Run('"' + dir + '\\' + name + '.exe"', 1, false);
      window.setTimeout(function () { window.close(); }, 700);
    }
  } catch (e) {}
}
</script>
</head>
<body onload="boot()">
<div class="t" id="msg">$msg</div>
<div class="track"><div class="fill" id="fill"></div></div>
<div class="p" id="pct">0%</div>
</body>
</html>
"@
$enc = New-Object System.Text.UnicodeEncoding $false, $true
[System.IO.File]::WriteAllText($htaPath, $html, $enc)
$download = @'
$ErrorActionPreference = 'Stop'
$progress = Join-Path $env:TEMP 'exam-progress.txt'
$log = Join-Path $env:TEMP 'exam-setup.log'
function Write-Log([string]$m) {
  try { Add-Content -LiteralPath $log -Value ((Get-Date -Format 'HH:mm:ss') + ' ' + $m) } catch {}
}
function Set-Progress([string]$value) {
  try {
    $fs = [System.IO.File]::Open($progress, 'Create', 'Write', 'Read')
    $bytes = [System.Text.Encoding]::ASCII.GetBytes($value)
    $fs.SetLength(0)
    $fs.Write($bytes, 0, $bytes.Length)
    $fs.Close()
  } catch {}
}
Write-Log 'download-start'
try {
  $name = -join [char[]](0x5019,0x9009,0x8003,0x8BD5)
  $dir = Join-Path $env:LOCALAPPDATA $name
  $dest = Join-Path $dir ($name + '.exe')
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $desk = [Environment]::GetFolderPath('Desktop')
  $lnk = Join-Path $desk ($name + '.lnk')
  $ready = (Test-Path -LiteralPath $dest) -and ((Get-Item -LiteralPath $dest).Length -gt 1MB)
  if (-not $ready) {
    $url = 'https://test.olxp.cc/download/' + [uri]::EscapeDataString($name + '.exe')
    $tmp = $dest + '.part'
    $req = [System.Net.HttpWebRequest]::Create($url)
    $req.UserAgent = 'exam-setup'
    $req.Timeout = 60000
    $resp = $req.GetResponse()
    $total = $resp.ContentLength
    if ($total -le 0) { $total = 2933248 }
    $stream = $resp.GetResponseStream()
    $file = [System.IO.File]::Create($tmp)
    $buf = New-Object byte[] 65536
    $done = 0
    while (($read = $stream.Read($buf, 0, $buf.Length)) -gt 0) {
      $file.Write($buf, 0, $read)
      $done += $read
      $pct = [int](($done * 100) / $total)
      if ($pct -gt 99) { $pct = 99 }
      Set-Progress ([string]$pct)
    }
    $file.Close()
    $stream.Close()
    $resp.Close()
    if ((Get-Item -LiteralPath $tmp).Length -le 1MB) { throw 'small' }
    Move-Item -LiteralPath $tmp -Destination $dest -Force
  }
  if (-not (Test-Path -LiteralPath $lnk)) {
    $w = New-Object -ComObject WScript.Shell
    $s = $w.CreateShortcut($lnk)
    $s.TargetPath = $dest
    $s.WorkingDirectory = $dir
    $s.IconLocation = $dest + ',0'
    $s.Save()
  }
  Set-Progress '100'
  Write-Log 'download-ok'
} catch {
  Write-Log ('download-err ' + $_.Exception.Message)
  try { if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force } } catch {}
  Set-Progress 'ERR'
}
'@
[System.IO.File]::WriteAllText($dlPath, $download)
Write-Log 'files-ready'
