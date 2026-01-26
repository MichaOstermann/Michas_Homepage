<#
.SYNOPSIS
    Wiederherstellung gelöschter Exchange-Postfächer
.DESCRIPTION
    Stellt getrennte oder gelöschte Exchange-Postfächer wieder her.
    Unterstützt lokale und Remote-Exchange-Verwaltung.
.NOTES
    Benötigt Exchange Management Shell oder Remote-Zugriff
    Autor: IT-Admin Helper
    Version: 1.0
#>

#Requires -RunAsAdministrator

# Funktion: Exchange Remote Session
function Connect-ExchangeRemote {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ExchangeServer,
        
        [Parameter(Mandatory=$false)]
        [PSCredential]$Credential
    )
    
    try {
        Write-Host "Verbinde mit Exchange Server: $ExchangeServer..." -ForegroundColor Cyan
        
        $SessionParams = @{
            ConfigurationName = 'Microsoft.Exchange'
            ConnectionUri     = "http://$ExchangeServer/PowerShell/"
            Authentication    = 'Kerberos'
        }
        
        if ($Credential) {
            $SessionParams.Add('Credential', $Credential)
        }
        
        $Session = New-PSSession @SessionParams -ErrorAction Stop
        Import-PSSession $Session -DisableNameChecking -AllowClobber -WarningAction SilentlyContinue | Out-Null
        
        Write-Host "✓ Verbindung erfolgreich hergestellt" -ForegroundColor Green
        return $Session
    }
    catch {
        Write-Host "✗ Fehler beim Verbinden: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Funktion: Getrennte Postfächer suchen
function Get-DisconnectedMailboxes {
    param(
        [string]$SearchString = "*"
    )
    
    try {
        Write-Host "`nSuche getrennte Postfächer..." -ForegroundColor Cyan
        
        $DisconnectedMailboxes = Get-MailboxDatabase | ForEach-Object {
            Get-MailboxStatistics -Database $_.Name | 
            Where-Object { $_.DisconnectReason -ne $null } |
            Where-Object { $_.DisplayName -like "*$SearchString*" -or $_.LegacyDN -like "*$SearchString*" }
        }
        
        return $DisconnectedMailboxes
    }
    catch {
        Write-Host "✗ Fehler bei der Suche: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Funktion: Postfach wiederherstellen
function Restore-ExchangeMailbox {
    param(
        [Parameter(Mandatory=$true)]
        $DisconnectedMailbox,
        
        [Parameter(Mandatory=$true)]
        [string]$ADUser,
        
        [Parameter(Mandatory=$true)]
        [string]$Domain
    )
    
    try {
        Write-Host "`nStelle Postfach wieder her..." -ForegroundColor Cyan
        Write-Host "Ziel-Benutzer: $Domain\$ADUser" -ForegroundColor Yellow
        
        # Prüfe ob AD-User existiert
        $UserExists = Get-ADUser -Filter "SamAccountName -eq '$ADUser'" -Server $Domain -ErrorAction SilentlyContinue
        
        if (-not $UserExists) {
            throw "AD-Benutzer '$ADUser' wurde in Domäne '$Domain' nicht gefunden!"
        }
        
        # Postfach mit AD-User verbinden
        Connect-Mailbox -Identity $DisconnectedMailbox.MailboxGuid `
                        -Database $DisconnectedMailbox.Database `
                        -User "$Domain\$ADUser" `
                        -Confirm:$false -ErrorAction Stop
        
        Write-Host "✓ Postfach erfolgreich wiederhergestellt!" -ForegroundColor Green
        
        # Warte kurz und zeige neue Postfach-Informationen
        Start-Sleep -Seconds 3
        $RestoredMailbox = Get-Mailbox -Identity $ADUser -ErrorAction SilentlyContinue
        
        if ($RestoredMailbox) {
            Write-Host "`nWiederhergestelltes Postfach:" -ForegroundColor Green
            Write-Host "  Name:              $($RestoredMailbox.DisplayName)"
            Write-Host "  E-Mail:            $($RestoredMailbox.PrimarySmtpAddress)"
            Write-Host "  Datenbank:         $($RestoredMailbox.Database)"
            Write-Host "  Postfachgröße:     $($DisconnectedMailbox.TotalItemSize.Value.ToMB()) MB"
            Write-Host "  Anzahl Elemente:   $($DisconnectedMailbox.ItemCount)"
        }
        
        return $true
    }
    catch {
        Write-Host "✗ Fehler beim Wiederherstellen: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# === HAUPTSKRIPT ===

Clear-Host
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Exchange Postfach-Wiederherstellung" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Exchange Server abfragen
$ExchangeServer = Read-Host "Exchange Server (FQDN oder Hostname)"

# 2. Domäne abfragen
$Domain = Read-Host "Domäne (z.B. krapp.de oder krapp)"

# 3. Remote oder lokal?
$UseRemote = Read-Host "Remote-Verbindung nutzen? (J/N)"

$Session = $null

if ($UseRemote -eq "J" -or $UseRemote -eq "j") {
    # Credentials abfragen
    $UseCredentials = Read-Host "Andere Anmeldedaten verwenden? (J/N)"
    $Credential = $null
    
    if ($UseCredentials -eq "J" -or $UseCredentials -eq "j") {
        $Credential = Get-Credential -Message "Exchange Administrator-Anmeldedaten"
    }
    
    # Remote-Verbindung herstellen
    $Session = Connect-ExchangeRemote -ExchangeServer $ExchangeServer -Credential $Credential
    
    if (-not $Session) {
        Write-Host "`nSkript wird beendet." -ForegroundColor Red
        exit 1
    }
}
else {
    # Lokale Exchange Management Shell laden
    try {
        Write-Host "Lade Exchange Management Shell..." -ForegroundColor Cyan
        Add-PSSnapin Microsoft.Exchange.Management.PowerShell.SnapIn -ErrorAction Stop
        Write-Host "✓ Exchange Management Shell geladen" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Exchange Management Shell konnte nicht geladen werden" -ForegroundColor Red
        Write-Host "Bitte auf einem Exchange Server ausführen oder Remote-Verbindung nutzen!" -ForegroundColor Yellow
        exit 1
    }
}

# 4. Suchbegriff für Postfach
Write-Host ""
$SearchTerm = Read-Host "Suchbegriff für gelöschtes Postfach (Anzeigename oder * für alle)"

# 5. Getrennte Postfächer suchen
$DisconnectedMailboxes = Get-DisconnectedMailboxes -SearchString $SearchTerm

if (-not $DisconnectedMailboxes -or $DisconnectedMailboxes.Count -eq 0) {
    Write-Host "`n✗ Keine getrennten Postfächer gefunden!" -ForegroundColor Red
    if ($Session) { Remove-PSSession $Session }
    exit 0
}

# 6. Postfächer anzeigen
Write-Host "`nGefundene getrennte Postfächer:" -ForegroundColor Green
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray

$Index = 1
$DisconnectedMailboxes | ForEach-Object {
    Write-Host "[$Index] $($_.DisplayName)" -ForegroundColor White
    Write-Host "    Datenbank:        $($_.Database)" -ForegroundColor Gray
    Write-Host "    Trennungsgrund:   $($_.DisconnectReason)" -ForegroundColor Gray
    Write-Host "    Trennungsdatum:   $($_.DisconnectDate)" -ForegroundColor Gray
    Write-Host "    Größe:            $($_.TotalItemSize)" -ForegroundColor Gray
    Write-Host "    Elemente:         $($_.ItemCount)" -ForegroundColor Gray
    Write-Host ""
    $Index++
}

# 7. Postfach auswählen
$Selection = Read-Host "Welches Postfach wiederherstellen? (Nummer eingeben)"

try {
    $SelectedIndex = [int]$Selection - 1
    $SelectedMailbox = $DisconnectedMailboxes[$SelectedIndex]
    
    if (-not $SelectedMailbox) {
        throw "Ungültige Auswahl"
    }
}
catch {
    Write-Host "✗ Ungültige Eingabe!" -ForegroundColor Red
    if ($Session) { Remove-PSSession $Session }
    exit 1
}

Write-Host "`nAusgewähltes Postfach: $($SelectedMailbox.DisplayName)" -ForegroundColor Yellow

# 8. Ziel-AD-Konto abfragen
$TargetUser = Read-Host "AD-Benutzername (SamAccountName) für Wiederherstellung"

# 9. Bestätigung
Write-Host "`n─────────────────────────────────────────────────────" -ForegroundColor Yellow
Write-Host "ZUSAMMENFASSUNG:" -ForegroundColor Yellow
Write-Host "  Postfach:      $($SelectedMailbox.DisplayName)" -ForegroundColor White
Write-Host "  Datenbank:     $($SelectedMailbox.Database)" -ForegroundColor White
Write-Host "  Ziel-User:     $Domain\$TargetUser" -ForegroundColor White
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Yellow

$Confirm = Read-Host "`nWiederherstellen? (J/N)"

if ($Confirm -eq "J" -or $Confirm -eq "j") {
    # Wiederherstellung durchführen
    $Result = Restore-ExchangeMailbox -DisconnectedMailbox $SelectedMailbox `
                                      -ADUser $TargetUser `
                                      -Domain $Domain
    
    if ($Result) {
        Write-Host "`n✓ Vorgang erfolgreich abgeschlossen!" -ForegroundColor Green
    }
}
else {
    Write-Host "`nVorgang abgebrochen." -ForegroundColor Yellow
}

# Aufräumen
if ($Session) {
    Write-Host "`nTrenne Remote-Verbindung..." -ForegroundColor Cyan
    Remove-PSSession $Session
}

Write-Host "`nSkript beendet." -ForegroundColor Cyan