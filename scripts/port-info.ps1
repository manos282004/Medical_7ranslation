param(
  [Parameter(Mandatory = $false, Position = 0)]
  [int]$Port = 8000
)

$ErrorActionPreference = "Continue"

Write-Host "Port diagnostics for TCP $Port" -ForegroundColor Cyan

$conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $conns) {
  Write-Host "No LISTEN socket found on $Port." -ForegroundColor Green
  exit 0
}

$pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($processId in $pids) {
  Write-Host ""
  Write-Host "LISTEN on $Port owned by PID $processId" -ForegroundColor Yellow

  $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if ($proc) {
    $proc | Select-Object Id,ProcessName,Path | Format-List
  } else {
    Write-Host "Get-Process: PID not found (may be protected or ended)." -ForegroundColor DarkYellow
  }

  $wmiProc = Get-CimInstance Win32_Process -Filter "ProcessId=$processId" -ErrorAction SilentlyContinue
  if ($wmiProc) {
    $wmiProc | Select-Object ProcessId,Name,ExecutablePath,CommandLine | Format-List
  }

  $svc = Get-CimInstance Win32_Service -ErrorAction SilentlyContinue | Where-Object { $_.ProcessId -eq $processId }
  if ($svc) {
    $svc | Select-Object Name,DisplayName,State,StartMode,ProcessId | Format-List
  }
}

Write-Host ""
Write-Host "Raw netstat:" -ForegroundColor Cyan
cmd /c "netstat -aon | findstr :$Port"

Write-Host ""
Write-Host "If the PID can't be found but the port is still LISTENING, run the above in an Administrator terminal or reboot." -ForegroundColor DarkGray

