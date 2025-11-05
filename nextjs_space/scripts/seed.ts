
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: 'michael@mcgv.de' },
    update: {},
    create: {
      email: 'michael@mcgv.de',
      name: 'Michael',
    },
  });

  console.log('👤 User created:', user.name);

  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Code & Beats',
      tagline: 'Musik, Code & Games – vereint',
      heroTitle: 'Musik, Code & Games – vereint.',
      heroSubtitle: 'PowerShell by day. Synthwave by night. Gaming always.',
      aboutText: `Hey, ich bin Michael! 👋

Willkommen in meiner digitalen Welt, wo Code, Beats und Gaming aufeinandertreffen!

Als leidenschaftlicher PowerShell-Entwickler bringe ich täglich Ordnung in komplexe IT-Systeme. Wenn die Sonne untergeht, verwandle ich mich in einen Synthwave-Produzent und erschaffe atmosphärische Klangwelten. Und zwischendurch? Da findest du mich beim Gaming, wo ich neue Welten erkunde und epische Momente festhalte.

Diese Website ist mein digitales Zuhause – ein Ort, wo ich meine Projekte, Erfahrungen und Leidenschaften teile. Tauche ein und entdecke, was mich antreibt!`,
      githubUrl: 'https://github.com',
      youtubeUrl: 'https://youtube.com',
      twitchUrl: 'https://twitch.tv',
    },
  });

  // Create tracks
  const tracks = [
    {
      title: 'Life am Strand',
      description: 'Party-Track mit Ballermann-Vibes',
      duration: '4:28',
      category: 'PARTY' as const,
      audioUrl: '/audio/life-am-strand.mp3',
      coverImageUrl: '/images/covers/life-am-strand.svg',
      isNew: true,
      order: 1,
    },
    {
      title: '20 Jahre RDMC Oldenburg',
      description: 'Mallorca-inspirierter Party-Hit',
      duration: '5:43',
      category: 'PARTY' as const,
      audioUrl: '/audio/rdmc-oldenburg.mp3',
      coverImageUrl: '/images/covers/rdmc-oldenburg.svg',
      isNew: false,
      order: 2,
    },
    {
      title: 'Aus dem Schatten',
      description: 'Atmosphärischer Synthwave-Track',
      duration: '2:18',
      category: 'SYNTH' as const,
      audioUrl: '/audio/aus-dem-schatten.mp3',
      coverImageUrl: '/images/covers/aus-dem-schatten.svg',
      isNew: true,
      order: 3,
    },
  ];

  for (const track of tracks) {
    await prisma.track.create({
      data: track,
    });
  }

  console.log('🎵 Music tracks created');

  // Create PowerShell scripts
  const scripts = [
    {
      title: 'MailStore Analyse',
      description: 'Umfassendes PowerShell-Script zur Analyse von MailStore-Installationen und Performance-Monitoring.',
      category: 'ADMIN' as const,
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
      order: 1,
    },
    {
      title: 'WSUS Scan',
      description: 'Automatisiertes Script für WSUS-Server-Wartung, Update-Synchronisation und Client-Management.',
      category: 'SYSTEM' as const,
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
      order: 2,
    },
    {
      title: 'AD User Creation Tool v4.0',
      description: 'Erweiterte Benutzer-Erstellung in Active Directory mit CSV-Import und Template-Unterstützung.',
      category: 'ADMIN' as const,
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
      order: 3,
    },
  ];

  for (const script of scripts) {
    await prisma.script.create({
      data: script,
    });
  }

  console.log('⚡ PowerShell scripts created');

  // Create gaming content
  const gamingContent = [
    {
      title: 'Boss Guide: Neon Titan',
      description: 'Umfassender Guide zum schwierigsten Boss in Cyber Drift. Strategien, Timing und optimale Builds für einen erfolgreichen Kampf.',
      type: 'GUIDE' as const,
      content: `Der Neon Titan ist der Endboss der ersten Cyber Drift Kampagne. Mit diesen Strategien besiegst du ihn garantiert:

**Phase 1: Laser-Angriffe**
- Bleib in Bewegung und nutze die Cover-Punkte
- Timing ist entscheidend - warte auf die 2-Sekunden-Pause zwischen den Angriffen
- Empfohlene Waffen: Plasma Rifle oder Neon Blaster

**Phase 2: Shield Mode**
- Wechsle zu EMP-Granaten um das Schild zu durchbrechen
- Konzentriere Feuer auf die schwachen Punkte (rot markiert)
- Nutze den Dash-Move um den Bodenangriffen auszuweichen

**Phase 3: Berserker-Modus**
- Maximaler DPS ist gefragt
- Nutze alle verfügbaren Power-Ups
- Halte Abstand und nutze Hit-and-Run Taktiken`,
      thumbnailUrl: '/images/gaming/neon-titan.jpg',
      order: 1,
    },
    {
      title: 'Review: Cyber Drift',
      description: 'Ausführliche Review des neuesten Cyberpunk-Racing-Games. Gameplay, Grafik, Sound und Langzeitmotivation im Test.',
      type: 'REVIEW' as const,
      content: `**Cyber Drift** ist ein visuell beeindruckendes Racing-Game mit Cyberpunk-Ästhetik.

**Grafik: 9/10**
- Atemberaubende Neon-Beleuchtung
- Flüssige 60 FPS auch bei maximalen Einstellungen
- Detailreiche Fahrzeuge und Strecken

**Gameplay: 8/10**
- Präzise Steuerung mit Controller und Tastatur
- Verschiedene Fahrmodi (Arcade, Simulation)
- Umfangreiche Anpassungsoptionen für Fahrzeuge

**Sound: 10/10**
- Fantastischer Synthwave-Soundtrack
- Realistische Motor- und Umgebungsgeräusche
- Dolby Atmos Support

**Fazit: 8.5/10**
Ein Must-Have für Fans von Cyberpunk und Racing-Games. Kleine Abzüge für repetitive Mission-Struktur, aber insgesamt sehr empfehlenswert.`,
      thumbnailUrl: '/images/gaming/cyber-drift.jpg',
      order: 2,
    },
    {
      title: 'Clip: Perfect Run',
      description: 'Mein persönlicher Rekord-Run durch die schwierigste Strecke in Cyber Drift. Fehlerlose Fahrt mit maximaler Geschwindigkeit.',
      type: 'CLIP' as const,
      videoUrl: 'dQw4w9WgXcQ',
      thumbnailUrl: '/images/gaming/perfect-run.jpg',
      content: 'Ein perfekter Lauf durch die "Neon Highway" Strecke. Nach wochenlangem Training endlich geschafft - 3:42 Minuten ohne einen einzigen Fehler!',
      order: 3,
    },
  ];

  for (const content of gamingContent) {
    await prisma.gamingContent.create({
      data: content,
    });
  }

  console.log('🎮 Gaming content created');

  // Create blog posts
  const blogPosts = [
    {
      title: 'Neues PowerShell Module für MailStore',
      slug: 'neues-powershell-module-mailstore',
      excerpt: 'Ein neues PowerShell-Modul macht die Verwaltung von MailStore-Servern noch einfacher.',
      content: `# Neues PowerShell Module für MailStore

Ich habe ein neues PowerShell-Modul entwickelt, das die Verwaltung von MailStore-Servern erheblich vereinfacht.

## Features
- Automatisierte Backup-Routines
- Performance-Monitoring
- User-Management-Tools
- Report-Generierung

Das Modul ist ab sofort verfügbar und wird kontinuierlich weiterentwickelt.`,
      category: 'DEV' as const,
      authorId: user.id,
      featuredImageUrl: '/images/blog/powershell-mailstore.jpg',
      tags: ['PowerShell', 'MailStore', 'Automation'],
      published: true,
    },
    {
      title: 'Synthwave Producer Setup 2024',
      slug: 'synthwave-producer-setup-2024',
      excerpt: 'Mein komplettes Setup für Synthwave-Produktion: Hardware, Software und Workflow.',
      content: `# Mein Synthwave Producer Setup 2024

Hier ist mein komplettes Setup für die Synthwave-Produktion.

## Hardware
- Audio-Interface: Focusrite Scarlett 2i2
- Synthesizer: Novation Circuit Tracks
- Monitors: KRK RP5 G3

## Software
- DAW: Ableton Live 11 Suite
- Synthesizer: Serum, Massive X
- Effects: FabFilter Bundle

Dieses Setup ermöglicht es mir, die charakteristischen Synthwave-Sounds zu erzeugen.`,
      category: 'MUSIK' as const,
      authorId: user.id,
      featuredImageUrl: '/images/blog/synthwave-setup.jpg',
      tags: ['Synthwave', 'Music Production', 'Studio'],
      published: true,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  console.log('📝 Blog posts created');

  // Create CMS Sections
  const blogSection = await prisma.section.upsert({
    where: { slug: 'blog' },
    update: {},
    create: {
      title: 'Blog',
      slug: 'blog',
      icon: 'BookOpen',
      description: 'Neueste Updates und Artikel',
      isActive: true,
      showInNav: true,
      order: 9,
    },
  });

  const portfolioSection = await prisma.section.upsert({
    where: { slug: 'portfolio' },
    update: {},
    create: {
      title: 'Portfolio',
      slug: 'portfolio',
      icon: 'Briefcase',
      description: 'Meine Projekte und Arbeiten',
      isActive: true,
      showInNav: true,
      order: 10,
    },
  });

  const tutorialsSection = await prisma.section.upsert({
    where: { slug: 'tutorials' },
    update: {},
    create: {
      title: 'Tutorials',
      slug: 'tutorials',
      icon: 'BookOpen',
      description: 'Schritt-für-Schritt Anleitungen',
      isActive: true,
      showInNav: true,
      order: 11,
    },
  });

  console.log('📂 Sections created');

  // Create example pages
  await prisma.page.upsert({
    where: { slug: 'automation-projekt' },
    update: {},
    create: {
      title: 'Automation Projekt',
      slug: 'automation-projekt',
      excerpt: 'Vollautomatisiertes PowerShell-System für IT-Management',
      content: `# Automation Projekt

Ein umfassendes PowerShell-basiertes Automation-System für IT-Management und -Monitoring.

## Features
- Automatische Server-Überwachung
- Self-Healing Scripts
- Reporting Dashboard
- Integration mit Microsoft Teams

## Technologien
- PowerShell 7
- Azure Functions
- Microsoft Graph API
- SQL Server

Dieses Projekt hat die IT-Wartungszeit um 70% reduziert.`,
      sectionId: portfolioSection.id,
      featuredImageUrl: '/images/pages/automation.jpg',
      tags: ['PowerShell', 'Automation', 'Azure'],
      published: true,
      showInNav: true,
      order: 1,
    },
  });

  await prisma.page.upsert({
    where: { slug: 'synthwave-album' },
    update: {},
    create: {
      title: 'Synthwave Album',
      slug: 'synthwave-album',
      excerpt: 'Mein erstes vollständiges Synthwave-Album',
      content: `# Neon Dreams - Synthwave Album

Mein erstes vollständiges Album mit 12 Tracks im Synthwave-Genre.

## Album Details
- **Release:** März 2024
- **Genre:** Synthwave, Retrowave
- **Tracks:** 12
- **Länge:** 48 Minuten

## Streaming
Verfügbar auf allen großen Plattformen:
- Spotify
- Apple Music
- YouTube Music
- Bandcamp

Ein Projekt der Leidenschaft, das über 2 Jahre hinweg entstanden ist.`,
      sectionId: portfolioSection.id,
      featuredImageUrl: '/images/pages/neon-dreams.jpg',
      tags: ['Music', 'Synthwave', 'Album'],
      published: true,
      showInNav: true,
      order: 2,
    },
  });

  await prisma.page.upsert({
    where: { slug: 'powershell-grundlagen' },
    update: {},
    create: {
      title: 'PowerShell Grundlagen',
      slug: 'powershell-grundlagen',
      excerpt: 'Einführung in PowerShell für Anfänger',
      content: `# PowerShell Grundlagen

Eine umfassende Einführung in PowerShell für Einsteiger.

## Was ist PowerShell?
PowerShell ist eine mächtige Scripting-Sprache und Shell, die speziell für die System-Administration entwickelt wurde.

## Erste Schritte
\`\`\`powershell
# Deine erste Ausgabe
Write-Host "Hello, PowerShell!" -ForegroundColor Cyan

# Variablen
$name = "Michael"
Write-Host "Hallo, $name!"

# Loops
1..10 | ForEach-Object {
    Write-Host "Zahl: $_"
}
\`\`\`

## Wichtige Cmdlets
- \`Get-Command\` - Alle verfügbaren Befehle
- \`Get-Help\` - Hilfe zu Befehlen
- \`Get-Process\` - Laufende Prozesse
- \`Get-Service\` - Windows-Dienste

Mehr Tutorials folgen bald!`,
      sectionId: tutorialsSection.id,
      featuredImageUrl: '/images/pages/powershell-basics.jpg',
      tags: ['PowerShell', 'Tutorial', 'Basics'],
      published: true,
      showInNav: true,
      order: 1,
    },
  });

  console.log('📄 Pages created');

  // Create Privacy Settings
  await prisma.privacySettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      cookieBannerEnabled: true,
      cookieBannerText: 'Diese Website verwendet Cookies und ähnliche Technologien, um Ihnen die bestmögliche Nutzererfahrung zu bieten. Durch die weitere Nutzung stimmen Sie der Verwendung von Cookies zu.',
      privacyPolicyUrl: '/datenschutz',
      imprintUrl: '/impressum',
    },
  });

  console.log('🔒 Privacy settings created');

  // Create Legal Pages
  await prisma.legalPage.upsert({
    where: { type: 'IMPRESSUM' },
    update: {},
    create: {
      type: 'IMPRESSUM',
      title: 'Impressum',
      content: `# Impressum

## Angaben gemäß § 5 TMG

**Verantwortlich für den Inhalt:**
Michael [Nachname]
[Straße und Hausnummer]
[PLZ] [Ort]
Deutschland

**Kontakt:**
E-Mail: michael@mcgv.de
Telefon: [Telefonnummer]

## Haftungsausschluss

### Haftung für Inhalte
Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.

### Haftung für Links
Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.

### Urheberrecht
Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.`,
    },
  });

  await prisma.legalPage.upsert({
    where: { type: 'DATENSCHUTZ' },
    update: {},
    create: {
      type: 'DATENSCHUTZ',
      title: 'Datenschutzerklärung',
      content: `# Datenschutzerklärung

## 1. Datenschutz auf einen Blick

### Allgemeine Hinweise
Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.

### Datenerfassung auf dieser Website

**Wer ist verantwortlich für die Datenerfassung auf dieser Website?**
Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.

**Wie erfassen wir Ihre Daten?**
Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben.

Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).

## 2. Hosting

Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert.

## 3. Allgemeine Hinweise und Pflichtinformationen

### Datenschutz
Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.

### Cookies
Diese Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher zu machen.

Einige Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese löschen. Sie ermöglichen es uns, Ihren Browser beim nächsten Besuch wiederzuerkennen.

Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und einzeln über deren Annahme entscheiden können.

## 4. Kontaktformular

Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.

Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.

## 5. Ihre Rechte

Sie haben das Recht:
- gemäß Art. 15 DSGVO Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten zu verlangen
- gemäß Art. 16 DSGVO unverzüglich die Berichtigung unrichtiger oder Vervollständigung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen
- gemäß Art. 17 DSGVO die Löschung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen
- gemäß Art. 18 DSGVO die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen
- gemäß Art. 20 DSGVO Ihre personenbezogenen Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten
- gemäß Art. 77 DSGVO sich bei einer Aufsichtsbehörde zu beschweren

Stand: November 2024`,
    },
  });

  console.log('⚖️ Legal pages created');

  // Get or create blog section for blog posts
  const blogSectionForPages = await prisma.section.findUnique({
    where: { slug: 'blog' },
  });

  if (!blogSectionForPages) {
    throw new Error('Blog section not found. Please ensure sections are created first.');
  }

  // Create blog posts as pages
  await prisma.page.upsert({
    where: { slug: 'neues-powershell-module-mailstore' },
    update: {},
    create: {
      title: 'Neues PowerShell Module für MailStore',
      slug: 'neues-powershell-module-mailstore',
      excerpt: 'Ein neues PowerShell-Modul macht die Verwaltung von MailStore-Servern noch einfacher.',
      content: `# Neues PowerShell Module für MailStore

Ein neues PowerShell-Modul macht die Verwaltung von MailStore-Servern noch einfacher.

## Einleitung

Die Verwaltung von MailStore-Servern kann komplex sein. Mit diesem neuen PowerShell-Modul wird die Automatisierung deutlich vereinfacht.

## Features

- Automatische Backup-Verwaltung
- Benutzer-Management über PowerShell
- Integration in bestehende Skripte
- Erweiterte Logging-Funktionen

## Installation

\`\`\`powershell
Install-Module MailStoreHelper
\`\`\`

## Verwendung

\`\`\`powershell
# Verbindung zum MailStore Server
Connect-MailStore -Server "mailstore.local" -Credential $cred

# Backup erstellen
New-MailStoreBackup -Path "C:\\Backups"

# Benutzer auflisten
Get-MailStoreUsers | Format-Table
\`\`\`

## Fazit

Das Modul spart Zeit und reduziert Fehler bei der Server-Verwaltung erheblich.`,
      sectionId: blogSectionForPages.id,
      featuredImageUrl: '/images/blog/powershell-mailstore.jpg',
      tags: ['PowerShell', 'MailStore', 'Automation'],
      published: true,
      showInNav: true,
      order: 1,
    },
  });

  await prisma.page.upsert({
    where: { slug: 'synthwave-producer-setup-2024' },
    update: {},
    create: {
      title: 'Synthwave Producer Setup 2024',
      slug: 'synthwave-producer-setup-2024',
      excerpt: 'Mein komplettes Setup für Synthwave-Produktion: Hardware, Software und Workflow.',
      content: `# Synthwave Producer Setup 2024

Mein komplettes Setup für Synthwave-Produktion: Hardware, Software und Workflow.

## Hardware

- **DAW**: FL Studio 21
- **Synthesizer**: Serum, Sylenth1, Diva
- **Interface**: Focusrite Scarlett 4i4
- **MIDI Controller**: Arturia KeyLab Essential 61
- **Monitors**: KRK Rokit 5 G4
- **Kopfhörer**: Audio-Technica ATH-M50x

## Software & Plugins

Die wichtigsten Plugins für den authentischen Synthwave-Sound:

### Synthesizer
1. **Serum** - Für moderne, saubere Leads und Pads
2. **Diva** - Für vintage analog Sounds
3. **Sylenth1** - Klassischer Synthwave-Synth
4. **TAL-U-NO-LX** - Für Juno-Style Sounds

### Effects
- **RC-20** - Für Lo-Fi Character
- **Valhalla VintageVerb** - Der perfekte Hall
- **FabFilter Pro-Q 3** - Präzises EQing
- **OTT** - Für den typischen Sidechaining-Effekt

## Workflow

Mein typischer Produktions-Workflow:

1. **Inspiration finden** - 80er Jahre Filme und Musik
2. **Melodie & Akkorde skizzieren** - Meist am MIDI-Keyboard
3. **Drum Pattern erstellen** - Mit klassischen 80er Drum-Sounds
4. **Bass-Line entwickeln** - Wichtig für den Groove
5. **Layering & Sound Design** - Mehrere Synth-Layer kombinieren
6. **Mixing** - Sidechain-Compression ist key
7. **Mastering** - Warm und analog klingend

## Tipps für Anfänger

- Studiert 80er Jahre Produktionstechniken
- Weniger ist oft mehr - nicht zu viele Elemente
- Der Bass ist das Fundament
- Sidechain-Compression richtig einsetzen
- Referenz-Tracks nutzen

## Fazit

Mit diesem Setup lassen sich professionelle Synthwave-Tracks produzieren. Das wichtigste ist aber immer noch: Übung und Kreativität!`,
      sectionId: blogSectionForPages.id,
      featuredImageUrl: '/images/blog/synthwave-setup.jpg',
      tags: ['Synthwave', 'Music Production', 'Studio'],
      published: true,
      showInNav: true,
      order: 2,
    },
  });

  await prisma.page.upsert({
    where: { slug: 'top-5-cyberpunk-games-2024' },
    update: {},
    create: {
      title: 'Top 5 Cyberpunk Games 2024',
      slug: 'top-5-cyberpunk-games-2024',
      excerpt: 'Die besten Cyberpunk-Spiele des Jahres im Review - von Indie bis AAA.',
      content: `# Top 5 Cyberpunk Games 2024

Die besten Cyberpunk-Spiele des Jahres im Review - von Indie bis AAA.

## 1. Cyberpunk 2077: Phantom Liberty

Die Erweiterung bringt das Spiel auf ein neues Level. Night City war noch nie so lebendig.

### Highlights
- Neue Story-Inhalte rund um Spionage und Verrat
- Überarbeitete Mechaniken und Skill-System
- Verbesserte Performance auf allen Plattformen
- Dogtown - Ein komplett neuer Stadtteil

### Bewertung
★★★★★ 5/5 - Ein Muss für alle Fans

## 2. Citizen Sleeper

Ein Indie-Gem mit unglaublicher Atmosphäre und packender Story.

### Was macht es besonders?
- Würfel-basiertes Gameplay
- Tiefgründige Charaktere
- Starke narrative Erfahrung
- Wunderschöner Pixel-Art-Stil

### Bewertung
★★★★☆ 4/5

## 3. Cloudpunk

Die Taxi-Simulation in einer Cyberpunk-Stadt ist entspannend und atmosphärisch.

### Features
- Wunderschöne Voxel-Grafik
- Entspanntes Gameplay
- Interessante NPCs und Geschichten
- Perfekt zum Entspannen

### Bewertung
★★★★☆ 4/5

## 4. Ghostrunner 2

Rasante Action im Cyberpunk-Setting mit präzisem Gameplay.

### Was ist neu?
- Mehr Bewegungsoptionen
- Motorrad-Sequenzen
- Größere Levels
- Verbessertes Kampfsystem

### Bewertung
★★★★☆ 4/5

## 5. System Shock Remake

Der Klassiker in neuem Gewand - ein Muss für Genre-Fans.

### Verbesserungen
- Moderne Grafik
- Überarbeitete Controls
- Beibehaltung des Original-Feelings
- Level-Design bleibt intakt

### Bewertung
★★★★★ 5/5

## Fazit

2024 war ein starkes Jahr für Cyberpunk-Games. Von AAA-Blockbustern bis zu atmosphärischen Indie-Titeln ist für jeden Geschmack etwas dabei. Besonders beeindruckend ist, wie verschiedene Studios das Genre interpretieren - von Action bis Storytelling.

## Honorable Mentions

- **Stray** (wenn ihr es noch nicht gespielt habt)
- **The Ascent** - Für Koop-Fans
- **Ruiner** - Für Twin-Stick-Shooter-Fans`,
      sectionId: blogSectionForPages.id,
      featuredImageUrl: '/images/blog/cyberpunk-games.jpg',
      tags: ['Gaming', 'Cyberpunk', 'Review'],
      published: true,
      showInNav: true,
      order: 3,
    },
  });

  console.log('📝 Blog posts created');

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
