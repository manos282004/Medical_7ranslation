$ErrorActionPreference = "Stop"

Write-Host "Starting backend + frontend..." -ForegroundColor Cyan
Write-Host "Tip: close this window to stop both." -ForegroundColor DarkGray

Set-Location $PSScriptRoot

if (-not $env:HF_HUB_DISABLE_SYMLINKS_WARNING) {
  $env:HF_HUB_DISABLE_SYMLINKS_WARNING = "1"
}

if (-not (Test-Path ".\\node_modules")) {
  Write-Host "node_modules not found. Running npm install..." -ForegroundColor Yellow
  npm install
}

# Start both processes via npm (uses concurrently)
npm run dev
