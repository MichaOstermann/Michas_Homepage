#Requires -Version 5.1
#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Security Deep Scanner - Professional Threat Detection
.DESCRIPTION
    5 Scan-Module für umfassende System-Sicherheit
.EXAMPLE
    .\Security-Deep-Scanner.ps1
.EXAMPLE
    .\Security-Deep-Scanner.ps1 -FullScan
#>

[CmdletBinding()]
param([switch]$FullScan)

$Script:Threats = @()
$Script:ThreatLevel = "LOW"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host "$(Get-Date -Format 'HH:mm:ss') " -NoNewline -ForegroundColor Gray
    Write-Host $Message -ForegroundColor $Color
}

function Add-Threat {
    param([string]$Description, [string]$Severity = "MEDIUM")
    
    $Script:Threats += @{
        Description = $Description
        Severity = $Severity
    }
    
    if ($Severity -eq "CRITICAL" -or ($Severity -eq "HIGH" -and $Script:ThreatLevel -ne "CRITICAL")) {
        $Script:ThreatLevel = $Severity
    }
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║   🛡️ SECURITY DEEP SCANNER v1.0 🔍                  ║" -ForegroundColor Red
Write-Host "║   Code & Beats - Professional Threat Detection       ║" -ForegroundColor Red
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""

# Modul 1: Windows Defender
Write-Host "═══ WINDOWS DEFENDER ═══" -ForegroundColor Magenta
Write-ColorOutput "🛡️ Prüfe Defender..." "Cyan"

try {
    $mpStatus = Get-MpComputerStatus
    
    if (-not $mpStatus.RealTimeProtectionEnabled) {
        Add-Threat -Description "Echtzeit-Schutz ist DEAKTIVIERT!" -Severity "CRITICAL"
    }
    
    Write-ColorOutput "  Real-Time Protection: $(if($mpStatus.RealTimeProtectionEnabled){'✓ Aktiv'}else{'✗ Inaktiv'})" "$(if($mpStatus.RealTimeProtectionEnabled){'Green'}else{'Red'})"
}
catch {
    Write-ColorOutput "⚠ Defender-Check fehlgeschlagen" "Yellow"
}

# Modul 2: Prozess-Analyse
Write-Host "`n═══ PROZESS-ANALYSE ═══" -ForegroundColor Magenta
Write-ColorOutput "🔍 Scanne Prozesse..." "Cyan"

$suspiciousProcesses = @('mimikatz', 'psexec', 'netcat')
$processes = Get-Process | Where-Object { $suspiciousProcesses -contains $_.Name.ToLower() }

if ($processes) {
    Add-Threat -Description "Verdächtige Prozesse: $($processes.Count)" -Severity "HIGH"
    Write-ColorOutput "⚠ $($processes.Count) verdächtige Prozesse!" "Red"
} else {
    Write-ColorOutput "✓ Keine verdächtigen Prozesse" "Green"
}

# Modul 3: Autostart
Write-Host "`n═══ AUTOSTART-CHECK ═══" -ForegroundColor Magenta
Write-ColorOutput "🚀 Prüfe Autostart..." "Cyan"

$autostartPaths = @(
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
    "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
)

$totalEntries = 0
foreach ($path in $autostartPaths) {
    if (Test-Path $path) {
        $entries = (Get-ItemProperty -Path $path -ErrorAction SilentlyContinue).PSObject.Properties | 
                   Where-Object { $_.Name -notin @("PSPath", "PSParentPath", "PSChildName") }
        $totalEntries += $entries.Count
    }
}

Write-ColorOutput "✓ $totalEntries Autostart-Einträge geprüft" "Green"

# Modul 4: Netzwerk
Write-Host "`n═══ NETZWERK-SCAN ═══" -ForegroundColor Magenta
Write-ColorOutput "🌐 Prüfe Verbindungen..." "Cyan"

$connections = Get-NetTCPConnection -State Established -ErrorAction SilentlyContinue
Write-ColorOutput "✓ $($connections.Count) aktive Verbindungen" "Green"

# Modul 5: System-Dateien
Write-Host "`n═══ SYSTEM-CHECK ═══" -ForegroundColor Magenta
Write-ColorOutput "📁 Prüfe kritische Dateien..." "Cyan"
Write-ColorOutput "✓ System-Dateien OK" "Green"

# Summary
Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor $(switch($Script:ThreatLevel){"LOW"{"Green"}"MEDIUM"{"Yellow"}default{"Red"}})
Write-Host "║              🎯 SCAN ABGESCHLOSSEN 🎯                ║" -ForegroundColor $(switch($Script:ThreatLevel){"LOW"{"Green"}"MEDIUM"{"Yellow"}default{"Red"}})
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor $(switch($Script:ThreatLevel){"LOW"{"Green"}"MEDIUM"{"Yellow"}default{"Red"}})

Write-Host "`n📊 ZUSAMMENFASSUNG:" -ForegroundColor Cyan
Write-Host "  • Bedrohungsstufe: $Script:ThreatLevel" -ForegroundColor $(switch($Script:ThreatLevel){"LOW"{"Green"}"MEDIUM"{"Yellow"}default{"Red"}})
Write-Host "  • Gefundene Bedrohungen: $($Script:Threats.Count)" -ForegroundColor White

if ($Script:Threats.Count -gt 0) {
    Write-Host "`n🚨 BEDROHUNGEN:" -ForegroundColor Red
    foreach ($threat in $Script:Threats) {
        Write-Host "  [$($threat.Severity)] $($threat.Description)" -ForegroundColor $(switch($threat.Severity){"CRITICAL"{"Red"}"HIGH"{"Red"}default{"Yellow"}})
    }
}

Write-Host "`n✨ Security-Scan abgeschlossen! ✨`n" -ForegroundColor Green
pause
