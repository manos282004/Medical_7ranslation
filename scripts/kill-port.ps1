param(
  [Parameter(Mandatory = $false, Position = 0)]
  [int]$Port = 8000
)

$ErrorActionPreference = "Stop"

for ($attempt = 1; $attempt -le 5; $attempt++) {
  try {
    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  } catch {
    $connections = @()
  }

  if (-not $connections) {
    exit 0
  }

  $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($processId in $pids) {
    if (-not $processId) { continue }
    try {
      Stop-Process -Id $processId -Force -ErrorAction Stop
    } catch {
      $proc = $null
      try { $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue } catch {}
      $name = if ($proc) { $proc.ProcessName } else { "unknown" }
      Write-Host "Port $Port is in use by PID $processId ($name), but it could not be stopped. Close it manually and retry." -ForegroundColor Red
      Write-Host "Tip (Admin terminal): Stop-Process -Id $processId -Force" -ForegroundColor DarkGray
      exit 1
    }
  }

  Start-Sleep -Milliseconds 300

  # Re-check if the port is actually free yet.
  try {
    $stillListening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  } catch {
    $stillListening = @()
  }
  if (-not $stillListening) {
    Write-Host "Freed port $Port." -ForegroundColor Yellow
    exit 0
  }
}

Write-Host "Port $Port is still in use after retries. Close the process using it and retry." -ForegroundColor Red
exit 1
