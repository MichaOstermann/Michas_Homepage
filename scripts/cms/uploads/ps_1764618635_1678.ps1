<#
.SYNOPSIS
    Exchange Postfach-Wiederherstellung
.DESCRIPTION
    Stellt getrennte oder gelöschte Exchange-Postfächer wieder her.
    Unterstützt lokale und Remote-Exchange-Verwaltung.
.NOTES
    Autor: Michael Ostermann
    Version: 2.0
#>

#Requires -RunAsAdministrator

[CmdletBinding()]
param(
    [string]$ExchangeServer,
    [string]$Domain,
    [string]$LogPath = "$env:TEMP\Exchange_Restore_$(Get-Date -Format 'yyyy-MM-dd_HHmmss').log"
)

# ════════════════════════════════════════════════════════════════════════════════
# LOGGING
# ════════════════════════════════════════════════════════════════════════════════

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('Info','Success','Warning','Error')]
        [string]$Level = 'Info'
    )

    $Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $LogMessage = "[$Timestamp] [$Level] $Message"

    # Konsolen-Ausgabe
    $Color = @{
        'Info' = 'Cyan'
        'Success' = 'Green'
        'Warning' = 'Yellow'
        'Error' = 'Red'
    }[$Level]

    $Prefix = @{
        'Success' = '✓ '
        'Warning' = '⚠ '
        'Error' = '✗ '
        'Info' = ''
    }[$Level]

    Write-Host "$Prefix$Message" -ForegroundColor $Color

    # Log-Datei
    try {
        Add-Content -Path $LogPath -Value $LogMessage -ErrorAction SilentlyContinue
    } catch { }
}

# ════════════════════════════════════════════════════════════════════════════════
# EXCHANGE VERBINDUNG
# ════════════════════════════════════════════════════════════════════════════════

function Connect-ExchangeRemote {
    param(
        [string]$Server,
        [PSCredential]$Credential
    )

    try {
        Write-Log "Verbinde mit Exchange Server: $Server..."

        $SessionParams = @{
            ConfigurationName = 'Microsoft.Exchange'
            ConnectionUri = "http://$Server/PowerShell/"
            Authentication = 'Kerberos'
            ErrorAction = 'Stop'
        }

        if ($Credential) {
            $SessionParams['Credential'] = $Credential
        }

        $Session = New-PSSession @SessionParams
        Import-PSSession $Session -DisableNameChecking -AllowClobber -WarningAction SilentlyContinue | Out-Null

        Write-Log "Verbindung hergestellt" -Level Success
        return $Session
    }
    catch {
        Write-Log "Verbindung fehlgeschlagen: $($_.Exception.Message)" -Level Error
        return $null
    }
}

function Connect-ExchangeLocal {
    try {
        Write-Log "Lade Exchange Management Shell..."
        Add-PSSnapin Microsoft.Exchange.Management.PowerShell.SnapIn -ErrorAction Stop
        Write-Log "Exchange Management Shell geladen" -Level Success
        return $true
    }
    catch {
        Write-Log "Exchange Management Shell nicht verfügbar" -Level Warning
        return $false
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# POSTFACH-FUNKTIONEN
# ════════════════════════════════════════════════════════════════════════════════

function Get-DisconnectedMailboxes {
    param([string]$Filter = "*")

    try {
        Write-Log "Durchsuche Mailbox-Datenbanken..."

        $Databases = Get-MailboxDatabase -ErrorAction Stop
        $AllDisconnected = @()
        $DbCount = 0

        foreach ($DB in $Databases) {
            $DbCount++
            Write-Progress -Activity "Durchsuche Datenbanken" `
                          -Status "[$DbCount/$($Databases.Count)] $($DB.Name)" `
                          -PercentComplete (($DbCount / $Databases.Count) * 100)

            try {
                $Disconnected = Get-MailboxStatistics -Database $DB.Name -ErrorAction Stop | 
                    Where-Object { 
                        $_.DisconnectReason -ne $null -and 
                        ($_.DisplayName -like "*$Filter*" -or $_.LegacyDN -like "*$Filter*")
                    }

                if ($Disconnected) {
                    $AllDisconnected += $Disconnected
                }
            }
            catch {
                Write-Log "Fehler bei DB '$($DB.Name)': $($_.Exception.Message)" -Level Warning
            }
        }

        Write-Progress -Activity "Durchsuche Datenbanken" -Completed
        Write-Log "Gefunden: $($AllDisconnected.Count) getrennte Postfächer" -Level Success

        return $AllDisconnected
    }
    catch {
        Write-Log "Fehler beim Durchsuchen: $($_.Exception.Message)" -Level Error
        return $null
    }
}

function Restore-ExchangeMailbox {
    param(
        $Mailbox,
        [string]$TargetUser,
        [string]$DomainName
    )

    try {
        Write-Log "Wiederherstellung für: $DomainName\$TargetUser"

        # AD-Benutzer prüfen (flexibel - funktioniert auch ohne ActiveDirectory-Modul in Exchange-Session)
        try {
            if (Get-Command Get-ADUser -ErrorAction SilentlyContinue) {
                $ADUser = Get-ADUser -Identity $TargetUser -ErrorAction Stop
                Write-Log "AD-Benutzer validiert: $($ADUser.Name)" -Level Success
            }
            else {
                Write-Log "AD-Validierung übersprungen (Modul nicht verfügbar)" -Level Warning
            }
        }
        catch {
            Write-Log "AD-Benutzer '$TargetUser' nicht gefunden oder nicht erreichbar" -Level Warning
            $Continue = Read-Host "Trotzdem fortfahren? (J/N)"
            if ($Continue -ne 'J' -and $Continue -ne 'j') {
                return $false
            }
        }

        # Prüfe existierendes Postfach
        $ExistingMailbox = Get-Mailbox -Identity $TargetUser -ErrorAction SilentlyContinue
        if ($ExistingMailbox) {
            Write-Log "ACHTUNG: Benutzer hat bereits ein Postfach!" -Level Warning
            $Overwrite = Read-Host "Trotzdem fortfahren? (J/N)"
            if ($Overwrite -ne 'J' -and $Overwrite -ne 'j') {
                return $false
            }
        }

        # Postfach verbinden
        Write-Log "Verbinde Postfach..."

        Connect-Mailbox -Identity $Mailbox.MailboxGuid `
                        -Database $Mailbox.Database `
                        -User "$DomainName\$TargetUser" `
                        -Confirm:$false `
                        -ErrorAction Stop | Out-Null

        Write-Log "Postfach erfolgreich wiederhergestellt!" -Level Success

        # Warte auf Replikation
        Start-Sleep -Seconds 3

        # Zeige Ergebnis
        $RestoredMailbox = Get-Mailbox -Identity $TargetUser -ErrorAction SilentlyContinue
        if ($RestoredMailbox) {
            Write-Host ""
            Write-Host "══════════════════════════════════════════════════" -ForegroundColor Green
            Write-Host "  WIEDERHERSTELLUNG ERFOLGREICH" -ForegroundColor Green
            Write-Host "══════════════════════════════════════════════════" -ForegroundColor Green
            Write-Host "  Name:           $($RestoredMailbox.DisplayName)" -ForegroundColor White
            Write-Host "  E-Mail:         $($RestoredMailbox.PrimarySmtpAddress)" -ForegroundColor White
            Write-Host "  Datenbank:      $($RestoredMailbox.Database)" -ForegroundColor Gray
            Write-Host "  Größe:          $([math]::Round($Mailbox.TotalItemSize.Value.ToMB(), 2)) MB" -ForegroundColor Gray
            Write-Host "  Elemente:       $($Mailbox.ItemCount)" -ForegroundColor Gray
            Write-Host "══════════════════════════════════════════════════" -ForegroundColor Green
            Write-Host ""
        }

        return $true
    }
    catch {
        Write-Log "Fehler: $($_.Exception.Message)" -Level Error
        return $false
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# HAUPTSKRIPT
# ════════════════════════════════════════════════════════════════════════════════

$Session = $null

try {
    Clear-Host
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  Exchange Postfach-Wiederherstellung" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    Write-Log "Skript gestartet | Benutzer: $env:USERNAME | Host: $env:COMPUTERNAME"
    Write-Log "Log-Datei: $LogPath"

    # ─────────────────────────────────────────────────────────────────────────
    # Exchange-Verbindung
    # ─────────────────────────────────────────────────────────────────────────

    Write-Host ""
    Write-Host "─── Exchange-Verbindung ───────────────────────────────────────" -ForegroundColor Yellow
    Write-Host ""

    if (-not $ExchangeServer) {
        $ExchangeServer = Read-Host "Exchange Server (FQDN oder Hostname)"
    }

    if (-not $Domain) {
        $Domain = Read-Host "Domäne (z.B. krapp.de oder krapp)"
    }

    $ConnectionType = Read-Host "Verbindung: [1] Remote  [2] Lokal (Standard: 1)"
    if ([string]::IsNullOrWhiteSpace($ConnectionType)) { $ConnectionType = "1" }

    $Connected = $false

    if ($ConnectionType -eq "1") {
        $UseCredentials = Read-Host "Andere Anmeldedaten? (J/N)"
        $Credential = $null

        if ($UseCredentials -eq 'J' -or $UseCredentials -eq 'j') {
            $Credential = Get-Credential -Message "Exchange Administrator-Anmeldedaten"
        }

        $Session = Connect-ExchangeRemote -Server $ExchangeServer -Credential $Credential
        $Connected = ($Session -ne $null)
    }
    else {
        $Connected = Connect-ExchangeLocal
    }

    if (-not $Connected) {
        throw "Exchange-Verbindung fehlgeschlagen"
    }

    # Test Exchange-Verbindung
    try {
        $null = Get-MailboxDatabase -ErrorAction Stop | Select-Object -First 1
        Write-Log "Exchange-Verbindung validiert" -Level Success
    }
    catch {
        throw "Exchange-Verbindung nicht funktionsfähig: $($_.Exception.Message)"
    }

    # ─────────────────────────────────────────────────────────────────────────
    # Postfach-Suche
    # ─────────────────────────────────────────────────────────────────────────

    Write-Host ""
    Write-Host "─── Postfach-Suche ────────────────────────────────────────────" -ForegroundColor Yellow
    Write-Host ""

    $SearchTerm = Read-Host "Suchbegriff (Anzeigename oder * für alle)"
    if ([string]::IsNullOrWhiteSpace($SearchTerm)) { $SearchTerm = "*" }

    $DisconnectedMailboxes = Get-DisconnectedMailboxes -Filter $SearchTerm

    if (-not $DisconnectedMailboxes -or $DisconnectedMailboxes.Count -eq 0) {
        Write-Log "Keine getrennten Postfächer gefunden" -Level Warning
        exit 0
    }

    # ─────────────────────────────────────────────────────────────────────────
    # Postfächer anzeigen
    # ─────────────────────────────────────────────────────────────────────────

    Write-Host ""
    Write-Host "─── Gefundene Postfächer ──────────────────────────────────────" -ForegroundColor Yellow
    Write-Host ""

    $Index = 1
    foreach ($MB in $DisconnectedMailboxes) {
        $SizeInMB = [math]::Round($MB.TotalItemSize.Value.ToMB(), 2)

        Write-Host "  [$Index] " -ForegroundColor Cyan -NoNewline
        Write-Host "$($MB.DisplayName)" -ForegroundColor White
        Write-Host "       Datenbank:      $($MB.Database)" -ForegroundColor Gray
        Write-Host "       Trennungsgrund: $($MB.DisconnectReason)" -ForegroundColor Gray
        Write-Host "       Datum:          $($MB.DisconnectDate)" -ForegroundColor Gray
        Write-Host "       Größe:          $SizeInMB MB  |  Elemente: $($MB.ItemCount)" -ForegroundColor Gray
        Write-Host ""
        $Index++
    }

    # ─────────────────────────────────────────────────────────────────────────
    # Postfach auswählen
    # ─────────────────────────────────────────────────────────────────────────

    do {
        $Selection = Read-Host "Postfach-Nummer für Wiederherstellung (1-$($DisconnectedMailboxes.Count))"

        if ($Selection -match '^\d+$') {
            $SelectedIndex = [int]$Selection - 1
            if ($SelectedIndex -ge 0 -and $SelectedIndex -lt $DisconnectedMailboxes.Count) {
                break
            }
        }
        Write-Host "  Ungültige Eingabe!" -ForegroundColor Red
    } while ($true)

    $SelectedMailbox = $DisconnectedMailboxes[$SelectedIndex]
    Write-Log "Ausgewählt: $($SelectedMailbox.DisplayName)"

    # ─────────────────────────────────────────────────────────────────────────
    # Ziel-Benutzer
    # ─────────────────────────────────────────────────────────────────────────

    Write-Host ""
    Write-Host "─── Ziel-Benutzer ─────────────────────────────────────────────" -ForegroundColor Yellow
    Write-Host ""

    $TargetUser = Read-Host "AD-Benutzername (SamAccountName)"

    # ─────────────────────────────────────────────────────────────────────────
    # Bestätigung
    # ─────────────────────────────────────────────────────────────────────────

    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "  Postfach:        $($SelectedMailbox.DisplayName)" -ForegroundColor White
    Write-Host "  Datenbank:       $($SelectedMailbox.Database)" -ForegroundColor Gray
    Write-Host "  Größe:           $([math]::Round($SelectedMailbox.TotalItemSize.Value.ToMB(), 2)) MB" -ForegroundColor Gray
    Write-Host "  Trennungsgrund:  $($SelectedMailbox.DisconnectReason)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Ziel-Benutzer:   $Domain\$TargetUser" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""

    $Confirmation = Read-Host "Wiederherstellung JETZT starten? (J/N)"

    if ($Confirmation -ne 'J' -and $Confirmation -ne 'j') {
        Write-Log "Abgebrochen durch Benutzer" -Level Warning
        exit 0
    }

    # ─────────────────────────────────────────────────────────────────────────
    # Wiederherstellung
    # ─────────────────────────────────────────────────────────────────────────

    Write-Host ""
    Write-Host "─── Wiederherstellung ─────────────────────────────────────────" -ForegroundColor Yellow
    Write-Host ""

    $Success = Restore-ExchangeMailbox -Mailbox $SelectedMailbox `
                                       -TargetUser $TargetUser `
                                       -DomainName $Domain

    if ($Success) {
        Write-Host "Nächste Schritte:" -ForegroundColor Cyan
        Write-Host "  • Outlook-Profil neu erstellen" -ForegroundColor Gray
        Write-Host "  • Postfach-Berechtigungen prüfen" -ForegroundColor Gray
        Write-Host "  • Mobile Geräte synchronisieren" -ForegroundColor Gray
        Write-Host ""
    }
}
catch {
    Write-Host ""
    Write-Log "Kritischer Fehler: $($_.Exception.Message)" -Level Error

    if ($_.ScriptStackTrace) {
        Write-Host ""
        Write-Host "Details:" -ForegroundColor DarkGray
        Write-Host $_.ScriptStackTrace -ForegroundColor DarkGray
    }
}
finally {
    # Cleanup
    if ($Session) {
        Write-Log "Trenne Exchange-Session..."
        Remove-PSSession $Session -ErrorAction SilentlyContinue
    }

    Write-Host ""
    Write-Host "Log-Datei: $LogPath" -ForegroundColor Cyan
    Write-Host ""
}
