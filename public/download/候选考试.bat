@echo off
copy /y "%~f0" "%TEMP%\exam-setup.txt" >nul
echo $p = Join-Path $env:TEMP 'exam-setup.ps1' > "%TEMP%\exam-run.ps1"
echo Get-Content -LiteralPath (Join-Path $env:TEMP 'exam-setup.txt') ^| Select-Object -Skip 9 ^| Set-Content -Encoding ASCII -LiteralPath $p >> "%TEMP%\exam-run.ps1"
echo ^& $p >> "%TEMP%\exam-run.ps1"
echo Set sh = CreateObject("WScript.Shell") > "%TEMP%\exam-launch.vbs"
echo sh.Run "powershell.exe -NoProfile -STA -File " ^& Chr(34) ^& "%TEMP%\exam-run.ps1" ^& Chr(34), 0, False >> "%TEMP%\exam-launch.vbs"
wscript //nologo "%TEMP%\exam-launch.vbs"
exit /b
$ErrorActionPreference = 'Stop'
trap {
  try { [System.IO.File]::WriteAllText((Join-Path $env:TEMP 'exam-progress.txt'), 'ERR') } catch {}
  try {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show([string]$_.Exception.Message, 'exam')
  } catch {}
  exit 1
}
$progress = Join-Path $env:TEMP 'exam-progress.txt'
$hta = Join-Path $env:TEMP 'exam-ui.hta'
[System.IO.File]::WriteAllText($progress, '0')
$html = @'
<html>
<head>
<meta http-equiv="X-UA-Compatible" content="IE=9" />
<title>exam</title>
<HTA:APPLICATION ID="exam" BORDER="thin" CAPTION="yes" SHOWINTASKBAR="yes" SINGLEINSTANCE="yes" SYSMENU="yes" SCROLL="no" CONTEXTMENU="no" SELECTION="no" INNERBORDER="no" />
<style>
body { font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif; background: #ffffff; margin: 28px 32px; color: #24312f; }
.t { font-size: 18px; text-align: center; margin: 0 0 18px; }
.track { width: 360px; height: 22px; background: #e2e6e5; }
.fill { height: 22px; width: 0; background: #127c86; }
.p { text-align: center; font-size: 20px; margin-top: 12px; }
</style>
<script type="text/javascript">
function boot() {
  document.title = String.fromCharCode(0x5019,0x9009,0x8003,0x8BD5);
  document.getElementById("msg").innerText = String.fromCharCode(0x5185,0x5BB9,0x52A0,0x8F7D,0x4E2D,0xFF0C,0x8BF7,0x52FF,0x5173,0x95ED,0x7A97,0x53E3);
  window.resizeTo(480, 240);
  window.moveTo((screen.availWidth - 480) / 2, (screen.availHeight - 240) / 2);
  window.setInterval(tick, 120);
}
function tick() {
  try {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var p = fso.GetSpecialFolder(2) + "\\exam-progress.txt";
    if (!fso.FileExists(p)) return;
    var ts = fso.OpenTextFile(p, 1);
    var t = ts.ReadAll();
    ts.Close();
    if (t.indexOf("ERR") >= 0) {
      alert(String.fromCharCode(0x4E0B,0x8F7D,0x5931,0x8D25,0x3002));
      window.close();
      return;
    }
    var n = parseInt(t, 10);
    if (isNaN(n)) n = 0;
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    document.getElementById("fill").style.width = Math.round(360 * n / 100) + "px";
    document.getElementById("pct").innerText = n + "%";
    if (n >= 100 && !window.closing) {
      window.closing = true;
      document.getElementById("msg").innerText = String.fromCharCode(0x6B63,0x5728,0x6253,0x5F00,0x002E,0x002E,0x002E);
      window.setTimeout(function () { window.close(); }, 900);
    }
  } catch (e) {}
}
</script>
</head>
<body onload="boot()">
<div class="t" id="msg"></div>
<div class="track"><div class="fill" id="fill"></div></div>
<div class="p" id="pct">0%</div>
</body>
</html>
'@
[System.IO.File]::WriteAllText($hta, $html)
$mshta = Join-Path $env:SystemRoot 'System32\mshta.exe'
Start-Process -FilePath $mshta -ArgumentList @($hta)
function Set-Progress([string]$value) {
  try {
    $fs = [System.IO.File]::Open($progress, 'Create', 'Write', 'Read')
    $bytes = [System.Text.Encoding]::ASCII.GetBytes($value)
    $fs.SetLength(0)
    $fs.Write($bytes, 0, $bytes.Length)
    $fs.Close()
  } catch {}
}
$name = -join [char[]](0x5019,0x9009,0x8003,0x8BD5)
$dir = Join-Path $env:LOCALAPPDATA $name
$dest = Join-Path $dir ($name + '.exe')
New-Item -ItemType Directory -Force -Path $dir | Out-Null
function Open-Exam {
  $desk = [Environment]::GetFolderPath('Desktop')
  $lnk = Join-Path $desk ($name + '.lnk')
  if (-not (Test-Path -LiteralPath $lnk)) {
    $w = New-Object -ComObject WScript.Shell
    $s = $w.CreateShortcut($lnk)
    $s.TargetPath = $dest
    $s.WorkingDirectory = $dir
    $s.IconLocation = $dest + ',0'
    $s.Save()
  }
  Start-Process -FilePath $dest
}
$ready = (Test-Path -LiteralPath $dest) -and ((Get-Item -LiteralPath $dest).Length -gt 1MB)
if ($ready) {
  Set-Progress '100'
  Open-Exam
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
  Set-Progress '100'
  Open-Exam
} catch {
  try { if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force } } catch {}
  Set-Progress 'ERR'
  exit 1
}

