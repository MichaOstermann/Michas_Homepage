---
title: "System Cleanup Script"
description: "Automatisches Bereinigen von temporären Dateien und Caches"
category: "System"
author: "Code & Beats"
updated: 2025-11-07T12:00:00.000Z
requirements: "Windows PowerShell 5.1+, Admin-Rechte"
code: |
  # System Cleanup Script
  # Entfernt temporäre Dateien und leert verschiedene Caches
  
  Write-Host "Starting System Cleanup..." -ForegroundColor Cyan
  
  # Temp-Ordner bereinigen
  Remove-Item -Path $env:TEMP\* -Recurse -Force -ErrorAction SilentlyContinue
  
  # Windows Temp bereinigen
  Remove-Item -Path C:\Windows\Temp\* -Recurse -Force -ErrorAction SilentlyContinue
  
  # Browser Cache (Chrome)
  $chromePath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache"
  if (Test-Path $chromePath) {
      Remove-Item -Path "$chromePath\*" -Recurse -Force -ErrorAction SilentlyContinue
  }
  
  Write-Host "Cleanup completed!" -ForegroundColor Green
---
