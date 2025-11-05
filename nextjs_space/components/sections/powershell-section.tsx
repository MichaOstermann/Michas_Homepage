
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Terminal, Download, Copy, Filter, CheckCircle, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { CodeBlock } from '@/components/ui/code-block';
import { toast } from '@/hooks/use-toast';

// Mock data basierend auf der technischen Analyse
const scripts = [
  {
    id: 1,
    title: 'MailStore Analyse',
    description: 'Umfassendes PowerShell-Script zur Analyse von MailStore-Installationen und Performance-Monitoring.',
    category: 'ADMIN',
    version: '2.1',
    isVerified: true,
    scriptUrl: '/scripts/mailstore-analyse.ps1',
    codeSnippet: `# MailStore Analyse Script
function Get-MailStoreInfo {
    param(
        [Parameter(Mandatory=$true)]
        [string]$MailStorePath
    )
    
    Write-Host "Analyzing MailStore installation..." -ForegroundColor Cyan
    
    # Check MailStore service status
    $service = Get-Service -Name "MailStore*" -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "Service Status: $($service.Status)" -ForegroundColor Green
    }
    
    # Get database info
    $dbPath = Join-Path $MailStorePath "Database"
    if (Test-Path $dbPath) {
        $dbSize = (Get-ChildItem $dbPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "Database Size: $([math]::Round($dbSize, 2)) MB" -ForegroundColor Yellow
    }
}`,
    createdAt: '2024-10-15',
  },
  {
    id: 2,
    title: 'WSUS Scan',
    description: 'Automatisiertes Script für WSUS-Server-Wartung, Update-Synchronisation und Client-Management.',
    category: 'SYSTEM',
    version: '3.4',
    isVerified: true,
    scriptUrl: '/scripts/wsus-scan.ps1',
    codeSnippet: `# WSUS Maintenance Script
function Start-WSUSMaintenance {
    Write-Host "Starting WSUS maintenance tasks..." -ForegroundColor Cyan
    
    # Import WSUS module
    Import-Module UpdateServices -ErrorAction SilentlyContinue
    
    # Get WSUS server
    $wsusServer = Get-WsusServer
    if ($wsusServer) {
        Write-Host "Connected to WSUS Server: $($wsusServer.Name)" -ForegroundColor Green
        
        # Cleanup obsolete updates
        $cleanupManager = $wsusServer.GetCleanupManager()
        $cleanupScope = New-Object Microsoft.UpdateServices.Administration.CleanupScope
        $cleanupScope.CleanupObsoleteUpdates = $true
        
        Write-Host "Cleaning up obsolete updates..." -ForegroundColor Yellow
        $cleanupManager.PerformCleanup($cleanupScope)
    }
}`,
    createdAt: '2024-11-01',
  },
  {
    id: 3,
    title: 'AD User Creation Tool v4.0',
    description: 'Erweiterte Benutzer-Erstellung in Active Directory mit CSV-Import und Template-Unterstützung.',
    category: 'ADMIN',
    version: '4.0',
    isVerified: true,
    scriptUrl: '/scripts/ad-user-creation.ps1',
    codeSnippet: `# AD User Creation Tool v4.0
function New-ADUserBulk {
    param(
        [Parameter(Mandatory=$true)]
        [string]$CSVPath,
        [string]$OU = "CN=Users,DC=domain,DC=local"
    )
    
    Write-Host "Starting bulk user creation from CSV..." -ForegroundColor Cyan
    
    # Import CSV data
    $users = Import-Csv $CSVPath
    
    foreach ($user in $users) {
        try {
            $userParams = @{
                Name = "$($user.FirstName) $($user.LastName)"
                GivenName = $user.FirstName
                Surname = $user.LastName
                SamAccountName = $user.Username
                UserPrincipalName = "$($user.Username)@domain.local"
                Path = $OU
                AccountPassword = (ConvertTo-SecureString $user.Password -AsPlainText -Force)
                Enabled = $true
            }
            
            New-ADUser @userParams
            Write-Host "Created user: $($user.Username)" -ForegroundColor Green
            
        } catch {
            Write-Error "Failed to create user $($user.Username): $($_.Exception.Message)"
        }
    }
}`,
    createdAt: '2024-10-28',
  },
];

const categories = [
  { id: 'ALL', label: 'Alle', count: scripts.length },
  { id: 'SYSTEM', label: 'System', count: scripts.filter(s => s.category === 'SYSTEM').length },
  { id: 'ADMIN', label: 'Admin', count: scripts.filter(s => s.category === 'ADMIN').length },
  { id: 'NETZWERK', label: 'Netzwerk', count: scripts.filter(s => s.category === 'NETZWERK').length },
];

export function PowerShellSection() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredScripts = selectedCategory === 'ALL' 
    ? scripts 
    : scripts.filter(script => script.category === selectedCategory);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Code kopiert!",
        description: "Der Code wurde in die Zwischenablage kopiert.",
      });
    } catch (err) {
      toast({
        title: "Fehler",
        description: "Code konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (scriptUrl: string, filename: string) => {
    // In a real app, this would download the actual file
    toast({
      title: "Download gestartet",
      description: `${filename} wird heruntergeladen...`,
    });
  };

  return (
    <section id="powershell" className="py-20 px-4 sm:px-6 lg:px-8 bg-accent/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Terminal className="w-8 h-8 text-primary mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              PowerShell
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bewährte PowerShell-Scripts für System-Administration, Wartung und Automatisierung. 
            Alle Scripts sind getestet und dokumentiert.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className={`${
                selectedCategory === category.id
                  ? 'cyber-glow'
                  : 'glass-morphism hover:bg-accent/50'
              } transition-all duration-300`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {category.label}
              {category.count > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              )}
            </Button>
          ))}
        </motion.div>

        {/* Scripts Grid */}
        <div className="space-y-8">
          {filteredScripts.map((script, index) => (
            <motion.div
              key={script.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="glass-morphism hover:cyber-glow transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Script Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-semibold text-foreground">
                          {script.title}
                        </h3>
                        {script.isVerified && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verifiziert
                          </Badge>
                        )}
                        <Badge variant="outline">
                          v{script.version}
                        </Badge>
                        <Badge variant="outline">
                          {script.category}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {script.description}
                      </p>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => handleCopyCode(script.codeSnippet)}
                          className="cyber-glow hover:cyber-glow-secondary transition-all duration-300"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Code kopieren
                        </Button>
                        <Button
                          onClick={() => handleDownload(script.scriptUrl, `${script.title}.ps1`)}
                          variant="outline"
                          className="glass-morphism hover:bg-accent/50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          .ps1 Download
                        </Button>
                      </div>
                    </div>

                    {/* Code Preview */}
                    <div className="flex-1">
                      <CodeBlock
                        code={script.codeSnippet}
                        language="powershell"
                        showLineNumbers={true}
                        className="max-h-64 overflow-y-auto"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="glass-morphism border-primary/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Verwendungshinweise
                </h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  • Alle Scripts sind mit PowerShell 5.1+ kompatibel
                </p>
                <p>
                  • Vor der Verwendung in Produktionsumgebungen immer testen
                </p>
                <p>
                  • Administratorrechte können erforderlich sein
                </p>
                <p>
                  • Dokumentation ist in jedem Script enthalten
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
