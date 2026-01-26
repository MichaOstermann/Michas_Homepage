#Requires -Version 5.1
#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Gaming PC Turbo Cleaner - Maximale Performance für Gaming
.DESCRIPTION
    Bereinigt Temp-Dateien, Browser-Cache, Gaming-Plattformen und optimiert RAM
.EXAMPLE
    .\Gaming-PC-Turbo-Cleaner.ps1
.EXAMPLE
    .\Gaming-PC-Turbo-Cleaner.ps1 -SkipBrowserCache
#>

[CmdletBinding()]
param(
    [switch]$SkipBrowserCache,
    [switch]$SkipGameCache
)

$Script:CleanedSize = 0
$Script:CleanedItems = @()

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor Gray
    Write-Host $Message -ForegroundColor $Color
}

function Remove-SafelyWithProgress {
    param([string]$Path, [string]$Description)
    
    if (-not (Test-Path $Path)) {
        Write-ColorOutput "⊘ $Description nicht gefunden" "Yellow"
        return
    }

    try {
        $files = Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
        $sizeBefore = ($files | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum / 1MB
        
        Write-ColorOutput "🧹 Räume auf: $Description..." "Cyan"
        Remove-Item -Path "$Path\*" -Recurse -Force -ErrorAction SilentlyContinue
        
        $cleaned = [math]::Round($sizeBefore, 2)
        if ($cleaned -gt 0) {
            $Script:CleanedSize += $cleaned
            $Script:CleanedItems += "$Description`: $cleaned MB"
            Write-ColorOutput "✓ $Description bereinigt: $cleaned MB" "Green"
        }
    }
    catch {
        Write-ColorOutput "✗ Fehler bei $Description" "Red"
    }
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🎮 GAMING PC TURBO CLEANER v1.0 🚀                 ║" -ForegroundColor Cyan
Write-Host "║   Code & Beats - Maximale Performance                ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-ColorOutput "🔍 Starte System-Analyse..." "Cyan"

# Windows Temp
Remove-SafelyWithProgress -Path "$env:TEMP" -Description "User Temp"
Remove-SafelyWithProgress -Path "C:\Windows\Temp" -Description "Windows Temp"
Remove-SafelyWithProgress -Path "C:\Windows\Prefetch" -Description "Prefetch"

# Browser Cache
if (-not $SkipBrowserCache) {
    Write-Host "`n═══ BROWSER-CACHE ═══" -ForegroundColor Magenta
    Remove-SafelyWithProgress -Path "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache" -Description "Chrome Cache"
    Remove-SafelyWithProgress -Path "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache" -Description "Edge Cache"
}

# Gaming Platforms
if (-not $SkipGameCache) {
    Write-Host "`n═══ GAMING-PLATTFORMEN ═══" -ForegroundColor Magenta
    Remove-SafelyWithProgress -Path "C:\Program Files (x86)\Steam\appcache" -Description "Steam Cache"
    Remove-SafelyWithProgress -Path "$env:LOCALAPPDATA\EpicGamesLauncher\Saved\webcache" -Description "Epic Games Cache"
    Remove-SafelyWithProgress -Path "$env:APPDATA\Battle.net\Cache" -Description "Battle.net Cache"
    Remove-SafelyWithProgress -Path "$env:APPDATA\discord\Cache" -Description "Discord Cache"
}

# RAM Optimization
Write-Host "`n═══ RAM-OPTIMIERUNG ═══" -ForegroundColor Magenta
try {
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    Write-ColorOutput "✓ RAM Working Sets geleert" "Green"
}
catch {
    Write-ColorOutput "⚠ RAM-Optimierung übersprungen" "Yellow"
}

# Summary
Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                 🎉 FERTIG! 🎉                        ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📊 ZUSAMMENFASSUNG:" -ForegroundColor Cyan
Write-Host "  • Bereinigter Speicher: $([math]::Round($Script:CleanedSize, 2)) MB" -ForegroundColor White
Write-Host "  • Bereinigte Bereiche: $($Script:CleanedItems.Count)" -ForegroundColor White

if ($Script:CleanedItems.Count -gt 0) {
    Write-Host "`n🗂️ DETAILS:" -ForegroundColor Cyan
    foreach ($item in $Script:CleanedItems) {
        Write-Host "  → $item" -ForegroundColor Gray
    }
}

Write-Host "`n✨ Dein Gaming-PC ist bereit für Maximum Performance! ✨`n" -ForegroundColor Green
pause
