#Requires -Version 5.1

<#
.SYNOPSIS
    Outlook Spam Killer - Automatische Werbe-Mail Vernichtung
.DESCRIPTION
    Durchsucht Outlook und löscht Spam basierend auf Keywords
.EXAMPLE
    .\Outlook-Spam-Killer.ps1
.EXAMPLE
    .\Outlook-Spam-Killer.ps1 -AutoDelete -CustomKeywords 'Sale','Werbung'
#>

[CmdletBinding()]
param(
    [switch]$AutoDelete,
    [string[]]$CustomKeywords = @()
)

$Script:DeletedCount = 0
$SpamKeywords = @(
    "Angebot des Tages", "Jetzt kaufen", "50% Rabatt", "Gratisversand",
    "Casino", "Bitcoin", "Kredit", "Newsletter", "Dringend"
)

if ($CustomKeywords) {
    $SpamKeywords += $CustomKeywords
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host "$(Get-Date -Format 'HH:mm:ss') " -NoNewline -ForegroundColor Gray
    Write-Host $Message -ForegroundColor $Color
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║   📧 OUTLOOK SPAM KILLER v1.0 🗑️                     ║" -ForegroundColor Red
Write-Host "║   Code & Beats - Werbe-Mail Vernichtung              ║" -ForegroundColor Red
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""

Write-ColorOutput "🔌 Verbinde mit Outlook..." "Cyan"

try {
    $outlook = New-Object -ComObject Outlook.Application
    $namespace = $outlook.GetNamespace("MAPI")
    $inbox = $namespace.GetDefaultFolder(6)
    
    Write-ColorOutput "✓ Verbunden mit Outlook" "Green"
    Write-ColorOutput "🔍 Durchsuche $($inbox.Items.Count) E-Mails..." "Cyan"
    
    $spamMails = @()
    
    for ($i = $inbox.Items.Count; $i -ge 1; $i--) {
        $mail = $inbox.Items.Item($i)
        $isSpam = $false
        
        foreach ($keyword in $SpamKeywords) {
            if ($mail.Subject -like "*$keyword*") {
                $isSpam = $true
                $spamMails += @{
                    Subject = $mail.Subject
                    Sender = $mail.SenderEmailAddress
                    Mail = $mail
                }
                break
            }
        }
    }
    
    if ($spamMails.Count -eq 0) {
        Write-ColorOutput "✓ Keine Spam-Mails gefunden" "Green"
        return
    }
    
    Write-ColorOutput "⚠ $($spamMails.Count) Spam-Mails gefunden" "Yellow"
    
    if (-not $AutoDelete) {
        Write-Host "`nVorschau (erste 5):" -ForegroundColor Yellow
        $spamMails[0..4] | ForEach-Object {
            Write-Host "  📧 $($_.Subject)" -ForegroundColor Gray
        }
        
        $response = Read-Host "`nLöschen? (J/N)"
        if ($response -ne "J") {
            Write-ColorOutput "⊘ Abgebrochen" "Yellow"
            return
        }
    }
    
    Write-ColorOutput "🗑️ Lösche $($spamMails.Count) Spam-Mails..." "Red"
    
    foreach ($spam in $spamMails) {
        try {
            $spam.Mail.Delete()
            $Script:DeletedCount++
        }
        catch {
            Write-ColorOutput "✗ Fehler: $($spam.Subject)" "Red"
        }
    }
    
    Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                 ✅ FERTIG! ✅                        ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Green
    
    Write-Host "`n📊 ZUSAMMENFASSUNG:" -ForegroundColor Cyan
    Write-Host "  • Gelöschte Mails: $Script:DeletedCount" -ForegroundColor White
    
    Write-Host "`n✨ Dein Outlook ist jetzt sauber! ✨`n" -ForegroundColor Green
}
catch {
    Write-ColorOutput "✗ Fehler: Outlook konnte nicht geöffnet werden" "Red"
}
finally {
    if ($outlook) {
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($outlook) | Out-Null
    }
}

pause
