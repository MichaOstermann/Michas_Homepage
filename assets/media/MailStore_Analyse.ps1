Write-Output "MailStore Analyse – Beispiel"
Get-ChildItem -Recurse "C:\MailStore" | Sort-Object Length -Descending | Select-Object -First 10



