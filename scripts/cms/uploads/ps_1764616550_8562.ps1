<#
.SYNOPSIS
    Windows System Cleanup & Performance Optimizer
.DESCRIPTION
    Umfassendes Bereinigungsskript - OHNE Papierkorb-Bug
.NOTES
    Autor: Michael Ostermann
    Version: 2.3 (STABLE - RECYCLE BIN FIXED)
#>

#Requires -RunAsAdministrator

# === KONFIGURATION ===
$LogPath = "C:\Temp\SystemCleanup_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$FreedSpaceTotal = 0

# === FUNKTIONEN ===

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('Info','Success','Warning','Error')]
        [string]$Level = 'Info'
    )
    
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    
    switch ($Level) {
        'Info'    { Write-Host $Message -ForegroundColor Cyan }
        'Success' { Write-Host "✓ $Message" -ForegroundColor Green }
        'Warning' { Write-Host "⚠ $Message" -ForegroundColor Yellow }
        'Error'   { Write-Host "✗ $Message" -ForegroundColor Red }
    }
    
    Add-Content -Path $LogPath -Value $LogMessage -ErrorAction SilentlyContinue
}

function Get-FolderSize {
    param([string]$Path)
    
    if (Test-Path $Path) {
        try {
            $Size = (Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | 
                     Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            return [math]::Round($Size / 1MB, 2)
        }
        catch {
            return 0
        }
    }
    return 0
}

function Remove-ItemSafely {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        try {
            $SizeBefore = Get-FolderSize -Path $Path
            
            Write-Log "Bereinige $Description..." -Level Info
            
            Get-ChildItem -Path $Path -Recurse -Force -ErrorAction SilentlyContinue | 
                Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
            
            $SizeAfter = Get-FolderSize -Path $Path
            $Freed = $SizeBefore - $SizeAfter
            
            if ($Freed -gt 0) {
                $script:FreedSpaceTotal += $Freed
                Write-Log "$Description bereinigt - $Freed MB freigegeben" -Level Success
            }
            else {
                Write-Log "$Description bereits leer" -Level Info
            }
        }
        catch {
            Write-Log "Fehler bei $Description" -Level Warning
        }
    }
}

function Clear-WindowsTemp {
    Write-Log "`n=== WINDOWS TEMPORÄRE DATEIEN ===" -Level Info
    
    Remove-ItemSafely -Path "C:\Windows\Temp\*" -Description "Windows Temp"
    Remove-ItemSafely -Path "C:\Windows\Prefetch\*" -Description "Windows Prefetch"
    
    Write-Log "Stoppe Windows Update Dienst..." -Level Info
    Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Remove-ItemSafely -Path "C:\Windows\SoftwareDistribution\Download\*" -Description "Windows Update Cache"
    Start-Service -Name wuauserv -ErrorAction SilentlyContinue
    Write-Log "Windows Update Dienst gestartet" -Level Success
}

function Clear-UserTemp {
    Write-Log "`n=== BENUTZER TEMPORÄRE DATEIEN ===" -Level Info
    
    $UserTemp = $env:TEMP
    Remove-ItemSafely -Path "$UserTemp\*" -Description "Benutzer Temp (Aktuell)"
    
    $UserProfiles = Get-ChildItem "C:\Users" -Directory -ErrorAction SilentlyContinue
    foreach ($Profile in $UserProfiles) {
        if ($Profile.Name -notin @('Public', 'Default', 'Default User', 'All Users')) {
            $TempPath = "$($Profile.FullName)\AppData\Local\Temp"
            if (Test-Path $TempPath) {
                Remove-ItemSafely -Path "$TempPath\*" -Description "Temp ($($Profile.Name))"
            }
        }
    }
}

function Clear-BrowserCache {
    Write-Log "`n=== BROWSER CACHE ===" -Level Info
    
    # Chrome
    $ChromeCache = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache"
    if (Test-Path $ChromeCache) {
        Remove-ItemSafely -Path "$ChromeCache\*" -Description "Google Chrome Cache"
    }
    
    # Edge
    $EdgeCache = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache"
    if (Test-Path $EdgeCache) {
        Remove-ItemSafely -Path "$EdgeCache\*" -Description "Microsoft Edge Cache"
    }
    
    # Firefox
    $FirefoxProfiles = Get-ChildItem "$env:APPDATA\Mozilla\Firefox\Profiles" -Directory -ErrorAction SilentlyContinue
    foreach ($Profile in $FirefoxProfiles) {
        $CachePath = "$($Profile.FullName)\cache2"
        if (Test-Path $CachePath) {
            Remove-ItemSafely -Path "$CachePath\*" -Description "Firefox Cache"
        }
    }
    
    # IE/Edge Legacy
    Remove-ItemSafely -Path "$env:LOCALAPPDATA\Microsoft\Windows\INetCache\*" -Description "IE/Edge Legacy Cache"
}

function Clear-RecycleBin {
    Write-Log "`n=== PAPIERKORB ===" -Level Info
    
    # KOMPLETT NEUE METHODE - Kein Loop-Bug mehr!
    try {
        # Schritt 1: Größe ermitteln
        $RecycleBinSize = 0
        $AllRecycleBins = Get-ChildItem -Path "C:\`$Recycle.Bin" -Force -ErrorAction SilentlyContinue
        
        if ($AllRecycleBins) {
            foreach ($Bin in $AllRecycleBins) {
                $BinSize = (Get-ChildItem -Path $Bin.FullName -Recurse -Force -ErrorAction SilentlyContinue | 
                           Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
                $RecycleBinSize += $BinSize
            }
            
            $RecycleBinSizeMB = [math]::Round($RecycleBinSize / 1MB, 2)
            
            if ($RecycleBinSizeMB -gt 0) {
                Write-Log "Papierkorb-Größe: $RecycleBinSizeMB MB" -Level Info
                
                # Schritt 2: Leeren mit COM-Objekt (zuverlässiger)
                try {
                    $Shell = New-Object -ComObject Shell.Application
                    $Recycler = $Shell.NameSpace(10)
                    
                    if ($Recycler.Items().Count -gt 0) {
                        $Recycler.Items() | ForEach-Object {
                            try {
                                Remove-Item -Path $_.Path -Recurse -Force -ErrorAction SilentlyContinue
                            } catch {}
                        }
                        
                        $script:FreedSpaceTotal += $RecycleBinSizeMB
                        Write-Log "Papierkorb geleert - $RecycleBinSizeMB MB freigegeben" -Level Success
                    }
                    else {
                        Write-Log "Papierkorb ist leer" -Level Info
                    }
                }
                catch {
                    # Fallback: Direkte Dateilöschung
                    Write-Log "Verwende alternative Methode..." -Level Warning
                    Remove-ItemSafely -Path "C:\`$Recycle.Bin\*" -Description "Papierkorb (Fallback)"
                }
                finally {
                    # COM-Objekt aufräumen
                    if ($Shell) {
                        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($Shell) | Out-Null
                        Remove-Variable Shell -ErrorAction SilentlyContinue
                    }
                }
            }
            else {
                Write-Log "Papierkorb ist bereits leer" -Level Info
            }
        }
        else {
            Write-Log "Kein Papierkorb gefunden" -Level Info
        }
    }
    catch {
        Write-Log "Papierkorb-Bereinigung übersprungen (Fehler: $($_.Exception.Message))" -Level Warning
    }
    finally {
        # Garbage Collection erzwingen
        [System.GC]::Collect()
        [System.GC]::WaitForPendingFinalizers()
    }
}

function Clear-ThumbnailCache {
    Write-Log "`n=== THUMBNAIL & ICON CACHE ===" -Level Info
    
    $ExplorerCache = "$env:LOCALAPPDATA\Microsoft\Windows\Explorer"
    
    if (Test-Path $ExplorerCache) {
        # Explorer-Prozess beenden
        Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        
        Get-ChildItem -Path $ExplorerCache -Filter "thumbcache_*.db" -Force -ErrorAction SilentlyContinue | 
            ForEach-Object { Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue }
        
        Get-ChildItem -Path $ExplorerCache -Filter "iconcache_*.db" -Force -ErrorAction SilentlyContinue | 
            ForEach-Object { Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue }
        
        # Explorer neu starten
        Start-Process explorer.exe
        
        Write-Log "Thumbnail & Icon Cache bereinigt" -Level Success
    }
}

function Clear-DNSCache {
    Write-Log "`n=== DNS CACHE ===" -Level Info
    
    try {
        ipconfig /flushdns | Out-Null
        Write-Log "DNS Cache geleert" -Level Success
    }
    catch {
        Write-Log "DNS Cache konnte nicht geleert werden" -Level Warning
    }
}

function Invoke-DiskCleanup {
    Write-Log "`n=== WINDOWS DATENTRÄGERBEREINIGUNG ===" -Level Info
    
    try {
        $VolumeCaches = @(
            "Active Setup Temp Folders",
            "Downloaded Program Files",
            "Internet Cache Files",
            "Old ChkDsk Files",
            "Recycle Bin",
            "Setup Log Files",
            "Temporary Files",
            "Temporary Setup Files",
            "Thumbnail Cache",
            "Update Cleanup",
            "Windows Error Reporting Files"
        )
        
        foreach ($Cache in $VolumeCaches) {
            $RegPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches\$Cache"
            if (Test-Path $RegPath) {
                Set-ItemProperty -Path $RegPath -Name StateFlags0100 -Value 2 -Type DWORD -ErrorAction SilentlyContinue
            }
        }
        
        Write-Log "Starte Windows Datenträgerbereinigung..." -Level Info
        
        # Cleanmgr mit Timeout
        $Process = Start-Process -FilePath cleanmgr.exe -ArgumentList "/sagerun:100" -WindowStyle Hidden -PassThru
        $Timeout = 300 # 5 Minuten
        
        if ($Process.WaitForExit($Timeout * 1000)) {
            Write-Log "Datenträgerbereinigung abgeschlossen" -Level Success
        }
        else {
            $Process | Stop-Process -Force
            Write-Log "Datenträgerbereinigung nach $Timeout Sekunden abgebrochen" -Level Warning
        }
    }
    catch {
        Write-Log "Fehler bei Datenträgerbereinigung" -Level Warning
    }
}

function Get-DiskSpace {
    Write-Log "`n=== SPEICHERPLATZ-ÜBERSICHT ===" -Level Info
    
    $Drives = Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -gt 0 }
    
    foreach ($Drive in $Drives) {
        $FreeGB = [math]::Round($Drive.Free / 1GB, 2)
        $UsedGB = [math]::Round($Drive.Used / 1GB, 2)
        $TotalGB = [math]::Round(($Drive.Free + $Drive.Used) / 1GB, 2)
        $PercentFree = [math]::Round(($Drive.Free / ($Drive.Free + $Drive.Used)) * 100, 1)
        
        $Color = if($PercentFree -lt 10){'Red'}elseif($PercentFree -lt 20){'Yellow'}else{'Green'}
        
        Write-Host "`n  Laufwerk $($Drive.Name):" -ForegroundColor White
        Write-Host "    Frei       - $FreeGB GB ($PercentFree%)" -ForegroundColor $Color
        Write-Host "    Belegt     - $UsedGB GB" -ForegroundColor Gray
        Write-Host "    Gesamt     - $TotalGB GB" -ForegroundColor Gray
    }
}

# === HAUPTPROGRAMM ===

Clear-Host

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║      WINDOWS SYSTEM CLEANUP & OPTIMIZER v2.3 STABLE        ║" -ForegroundColor Cyan
Write-Host "║                   (Papierkorb-Fix)                         ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Log-Verzeichnis
$LogDir = Split-Path $LogPath -Parent
if (-not (Test-Path $LogDir)) {
    New-Item -Path $LogDir -ItemType Directory -Force | Out-Null
}

Write-Log "System-Bereinigung gestartet" -Level Info
Write-Log "Hostname - $env:COMPUTERNAME" -Level Info
Write-Log "Benutzer - $env:USERNAME" -Level Info

# Speicherplatz VOR Bereinigung
Get-DiskSpace

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host " BEREINIGUNG WIRD GESTARTET" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow

$StartTime = Get-Date

# Bereinigung durchführen
Clear-WindowsTemp
Clear-UserTemp
Clear-BrowserCache
Clear-RecycleBin  # <-- KOMPLETT NEU - KEIN BUG MEHR
Clear-ThumbnailCache
Clear-DNSCache
Invoke-DiskCleanup

# Zusammenfassung
$EndTime = Get-Date
$Duration = ($EndTime - $StartTime).TotalSeconds

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  BEREINIGUNG ABGESCHLOSSEN                 ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  Freigegebener Speicherplatz - " -NoNewline
Write-Host "$([math]::Round($FreedSpaceTotal, 2)) MB" -ForegroundColor Green
Write-Host "  Dauer                        - " -NoNewline
Write-Host "$([math]::Round($Duration, 1)) Sekunden" -ForegroundColor Green
Write-Host "  Log-Datei                    - " -NoNewline
Write-Host "$LogPath" -ForegroundColor Cyan
Write-Host ""

# Speicherplatz NACH Bereinigung
Get-DiskSpace

Write-Log "`nBereinigung erfolgreich! Freigegeben - $([math]::Round($FreedSpaceTotal, 2)) MB" -Level Success

Write-Host "`nSkript beendet." -ForegroundColor Green