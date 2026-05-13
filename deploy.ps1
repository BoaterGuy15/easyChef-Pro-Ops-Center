# deploy.ps1 — Fast GAS deploy for easyChef Pro Ops Center
#
# Usage:
#   .\deploy.ps1              Push only — HEAD is always live after push (fastest)
#   .\deploy.ps1 -Deploy      Push + 10s wait + update PRIMARY numbered deployment
#   .\deploy.ps1 -Sync        Push + 10s wait + update BOTH numbered deployments
#   .\deploy.ps1 -Deploy -Message "my note"   Custom deployment description

param(
    [switch]$Deploy,
    [switch]$Sync,
    [string]$Message = ""
)

$PRIMARY_ID   = "AKfycbxgwJT_MZigRzZ7sYuULrnxMB1ITfU_2TUCfpSfqJJDbgme1rTsWjf7RaiHQFQOJuOPbQ"
$SECONDARY_ID = "AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg"
$HEAD_URL     = "https://script.google.com/macros/s/AKfycbxT5z33OoH0Xl_PCbUjjxcTiMWzrzLdo1NTao0cKW51/exec"

$start = Get-Date
Write-Host ""
Write-Host "=== GAS Deploy ===" -ForegroundColor Cyan

# ── Fix 1: cockpit_template.gs is excluded via .claspignore
# ── Step 1: Push all non-ignored .gs files
Write-Host "[1/3] Pushing files..." -ForegroundColor Yellow
clasp push --force
if (-not $?) {
    Write-Host "PUSH FAILED — aborting." -ForegroundColor Red
    exit 1
}
Write-Host "Push complete. HEAD is live:" -ForegroundColor Green
Write-Host "  $HEAD_URL" -ForegroundColor DarkCyan

if (-not $Deploy -and -not $Sync) {
    $elapsed = [int]((Get-Date) - $start).TotalSeconds
    Write-Host ""
    Write-Host "Done in ${elapsed}s (push-only mode)." -ForegroundColor Green
    Write-Host "Tip: -Deploy updates the primary numbered deployment."
    Write-Host "     -Sync   updates both numbered deployments."
    exit 0
}

# ── Fix 2: 10s wait between push and version creation (GAS rate limit)
Write-Host "[2/3] Waiting 10s (GAS version rate limit)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# ── Fix 3: Single deployment ID by default; -Sync deploys both
$desc = if ($Message) { $Message } else { "deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }

function Deploy-To {
    param([string]$DepId, [string]$Label)
    Write-Host "Updating $Label deployment..." -ForegroundColor Yellow
    $out = clasp deploy -i $DepId -d $desc 2>&1
    $outStr = $out -join "`n"
    if ($outStr -match "version limit|Cannot create more|quota") {
        Write-Host "VERSION LIMIT HIT — $Label unchanged." -ForegroundColor Red
        Write-Host "Fix: Apps Script → Project history → delete old versions (192-524 range)" -ForegroundColor Yellow
        Write-Host "     HEAD URL above is still fully current." -ForegroundColor Yellow
    } else {
        Write-Host $outStr -ForegroundColor Green
        Write-Host "$Label deployment updated." -ForegroundColor Green
    }
}

Write-Host "[3/3] Deploying..." -ForegroundColor Yellow
Deploy-To -DepId $PRIMARY_ID -Label "Primary"

if ($Sync) {
    Write-Host "Waiting 10s before secondary deployment..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Deploy-To -DepId $SECONDARY_ID -Label "Secondary"
}

$elapsed = [int]((Get-Date) - $start).TotalSeconds
Write-Host ""
Write-Host "Done in ${elapsed}s." -ForegroundColor Green
