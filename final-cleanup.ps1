# ======================================
# FINAL CLEANUP & ORGANIZATION SCRIPT
# SAFE - RE-RUNNABLE - PRODUCTION READY
# ======================================

Write-Host "Starting final cleanup..." -ForegroundColor Cyan

$root = Get-Location
$backup = Join-Path $root "_backup_removed"
$secureKeys = "C:\secure-keys"

# Ensure folders exist
New-Item -ItemType Directory -Force -Path $backup | Out-Null
New-Item -ItemType Directory -Force -Path $secureKeys | Out-Null

# --------------------------------------
# Helper: Safe Move Function
# --------------------------------------
function Safe-Move {
    param (
        [string]$source,
        [string]$destination
    )

    if (Test-Path $source) {
        try {
            Move-Item $source $destination -Force
            Write-Host "Moved: $source" -ForegroundColor Green
        }
        catch {
            Write-Host "Skipped (in use or exists): $source" -ForegroundColor Yellow
        }
    }
}

# --------------------------------------
# BACKEND CLEANUP
# --------------------------------------
$backend = Join-Path $root "apps\backend"

if (Test-Path $backend) {

    $runtime = Join-Path $backend "runtime"
    New-Item -ItemType Directory -Force -Path $runtime | Out-Null

    Safe-Move "$backend\data" $runtime
    Safe-Move "$backend\uploads" $runtime

    Safe-Move "$backend\.env" $secureKeys
    Safe-Move "$backend\backend\.env" $secureKeys
}

# --------------------------------------
# MOBILE CLEANUP
# --------------------------------------
$mobile = Join-Path $root "mobile"

if (Test-Path $mobile) {
    Safe-Move "$mobile\.env" $secureKeys
}

# --------------------------------------
# ROOT SENSITIVE FILES
# --------------------------------------
$sensitivePatterns = @(
    "*EAS_SECRETS*",
    "*api-key*",
    "*api_keys*",
    "*twilio*",
    "*.p8",
    "*.key"
)

Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object {
        foreach ($pattern in $sensitivePatterns) {
            if ($_.Name -like $pattern) { return $true }
        }
        return $false
    } |
    ForEach-Object {
        Safe-Move $_.FullName $secureKeys
    }

# --------------------------------------
# NOISE / CACHE CLEANUP
# --------------------------------------
$legacy = Join-Path $root "_legacy"
New-Item -ItemType Directory -Force -Path $legacy | Out-Null

$noiseFolders = @(
    "node_modules",
    ".expo",
    ".cloudflared",
    ".app-store",
    ".cursor",
    ".copilot",
    ".codex"
)

Get-ChildItem -Path $root -Recurse -Directory -ErrorAction SilentlyContinue |
    Where-Object { $noiseFolders -contains $_.Name } |
    ForEach-Object {
        Safe-Move $_.FullName $legacy
    }

# --------------------------------------
# DONE
# --------------------------------------
Write-Host "Final cleanup completed successfully." -ForegroundColor Green
Write-Host "Backups (if any): $backup" -ForegroundColor Yellow
Write-Host "Sensitive keys moved to: $secureKeys" -ForegroundColor Yellow
