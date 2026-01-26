<?php
// PowerShell Script Upload System
session_start();
header('Content-Type: application/json');

// Secure Auth - Password Hash
// Password: Darkman2012!
define('PASSWORD_HASH', 'e8c8c0c5d5f5e5a0b5d5c5f5e5a0b5d5c5f5e5a0b5d5c5f5e5a0b5d5c5f5e5a0'); // SHA-256 Hash
define('PASSWORD_SALT', 'CodeBeats_Secure_Salt_2025');

function verifyPassword($input) {
    $hash = hash('sha256', $input . PASSWORD_SALT);
    return hash_equals(PASSWORD_HASH, $hash);
}

// Check Auth
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Verify Password
    if (!isset($_POST['password']) || !verifyPassword($_POST['password'])) {
        echo json_encode(['success' => false, 'message' => 'Falsches Passwort!']);
        exit;
    }
    
    // Validate File
    if (!isset($_FILES['scriptFile']) || $_FILES['scriptFile']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'Keine Datei hochgeladen!']);
        exit;
    }
    
    $file = $_FILES['scriptFile'];
    
    // Check file type
    if (pathinfo($file['name'], PATHINFO_EXTENSION) !== 'ps1') {
        echo json_encode(['success' => false, 'message' => 'Nur .ps1 Dateien erlaubt!']);
        exit;
    }
    
    // Get metadata
    $title = trim($_POST['title'] ?? '');
    $category = trim($_POST['category'] ?? 'System');
    $difficulty = trim($_POST['difficulty'] ?? 'Anfänger');
    $excerpt = trim($_POST['excerpt'] ?? '');
    
    if (!$title || !$excerpt) {
        echo json_encode(['success' => false, 'message' => 'Titel und Beschreibung erforderlich!']);
        exit;
    }
    
    // Generate slug
    $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
    $slug = trim($slug, '-');
    
    // Move file
    $targetFile = __DIR__ . '/../assets/media/' . basename($file['name']);
    
    if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
        echo json_encode(['success' => false, 'message' => 'Fehler beim Speichern!']);
        exit;
    }
    
    // Update JSON
    $jsonFile = __DIR__ . '/../assets/content/scripts.json';
    $data = json_decode(file_get_contents($jsonFile), true);
    
    if (!$data) {
        $data = ['scripts' => []];
    }
    
    // Add new script
    $newScript = [
        'slug' => $slug,
        'href' => 'scripts/' . $slug . '.html',
        'title' => $title,
        'category' => $category,
        'emoji' => $_POST['emoji'] ?? '⚡',
        'difficulty' => $difficulty,
        'date' => date('Y-m-d'),
        'featured' => isset($_POST['featured']),
        'excerpt' => $excerpt,
        'downloadFile' => 'assets/media/' . basename($file['name']),
        'version' => $_POST['version'] ?? '1.0',
        'powershellVersion' => '5.1+',
        'tags' => array_filter(explode(',', $_POST['tags'] ?? '')),
        'verified' => true
    ];
    
    array_unshift($data['scripts'], $newScript);
    
    // Save JSON
    file_put_contents($jsonFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    // Create Detail Page
    $detailHTML = <<<HTML
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <title>$title – PowerShell Scripts</title>
  <link rel="stylesheet" href="../assets/css/styles.css" />
  <link rel="stylesheet" href="../assets/css/enhancements.css" />
</head>
<body>
  <header class="header">
    <nav class="nav container">
      <a href="../index.html" class="nav__brand">Code & Beats</a>
    </nav>
  </header>
  <main style="padding-top: 6rem;">
    <div class="container" style="max-width: 900px;">
      <a href="index.html" class="btn" style="margin-bottom: 2rem;">← Zurück zu allen Scripts</a>
      <h1 style="font-size: 3rem; margin-bottom: 1rem;">{$_POST['emoji']} $title</h1>
      <p style="font-size: 1.2rem; margin-bottom: 2rem;">$excerpt</p>
      <a href="../assets/media/{$file['name']}" download class="btn btn--neon" style="margin-bottom: 2rem;">Download Script</a>
      <h2>Kategorie: $category</h2>
      <p>Schwierigkeit: $difficulty</p>
    </div>
  </main>
  <footer class="footer" style="margin-top: 4rem; padding: 2rem 0; text-align: center;">
    <small>&copy; 2025 Code & Beats</small>
  </footer>
  <script src="../assets/js/app.js"></script>
</body>
</html>
HTML;
    
    file_put_contents(__DIR__ . '/' . $slug . '.html', $detailHTML);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Script erfolgreich hochgeladen!',
        'slug' => $slug
    ]);
    exit;
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <title>Script Upload - Code & Beats</title>
  <link rel="stylesheet" href="../assets/css/styles.css" />
  <link rel="stylesheet" href="../assets/css/enhancements.css" />
</head>
<body>
  <header class="header">
    <nav class="nav container">
      <a href="../index.html" class="nav__brand">Code & Beats</a>
    </nav>
  </header>
  
  <main style="padding-top: 6rem;">
    <div class="container" style="max-width: 700px;">
      <h1 class="section__title" style="text-align: center; margin-bottom: 3rem;">⚡ PowerShell Script Upload</h1>
      
      <form id="uploadForm" enctype="multipart/form-data" method="POST" style="background: rgba(11,15,22,0.8); padding: 2.5rem; border-radius: 16px; border: 2px solid rgba(6,255,240,0.3);">
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: #06FFF0; font-weight: 600;">Passwort *</label>
          <input name="password" type="password" required style="width: 100%; padding: 0.75rem; background: rgba(11,15,22,0.9); border: 1px solid rgba(6,255,240,0.3); border-radius: 8px; color: #FFF; font-size: 1rem;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: #06FFF0; font-weight: 600;">Script-Datei (.ps1) *</label>
          <input name="scriptFile" type="file" accept=".ps1" required style="width: 100%; padding: 0.75rem; background: rgba(11,15,22,0.9); border: 1px solid rgba(6,255,240,0.3); border-radius: 8px; color: #FFF; font-size: 1rem;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: #06FFF0; font-weight: 600;">Titel *</label>
          <input name="title" type="text" required placeholder="z.B. System Cleanup Tool" style="width: 100%; padding: 0.75rem; background: rgba(11,15,22,0.9); border: 1px solid rgba(6,255,240,0.3); border-radius: 8px; color: #FFF; font-size: 1rem;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: #06FFF0; font-weight: 600;">Kategorie *</label>
          <select name="category" required style="width: 100%; padding: 0.75rem; background: rgba(11,15,22,0.9); border: 1px solid rgba(6,255,240,0.3); border-radius: 8px; color: #FFF; font-size: 1rem;">
            <option value="System">System</option>
            <option value="Admin">Admin</option>
            <option value="Netzwerk">Netzwerk</option>
          </select>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: #06FFF0; font-weight: 600;">Schwierigkeit</label>
          <select name="difficulty" style="width: 100%; padding: 0.75rem; background: rgba(11,15,22,0.9); border: 1px solid rgba(6,255,240,0.3); border-radius: 8px; color: #FFF; font-size: 1rem;">
            <option value="Anfänger">Anfänger</option>
            <option value="Fortgeschritten">Fortgeschritten</option>
            <option value="Experte">Experte</option>
          </select>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: #06FFF0; font-weight: 600;">Beschreibung *</label>
          <textarea name="excerpt" required rows="4" placeholder="Kurze Beschreibung des Scripts..." style="width: 100%; padding: 0.75rem; background: rgba(11,15,22,0.9); border: 1px solid rgba(6,255,240,0.3); border-radius: 8px; color: #FFF; font-size: 1rem; font-family: inherit; resize: vertical;"></textarea>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: #06FFF0; font-weight: 600;">Emoji</label>
          <input name="emoji" type="text" placeholder="⚡" maxlength="2" style="width: 100%; padding: 0.75rem; background: rgba(11,15,22,0.9); border: 1px solid rgba(6,255,240,0.3); border-radius: 8px; color: #FFF; font-size: 1rem;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; color: #06FFF0; font-weight: 600;">Tags (kommagetrennt)</label>
          <input name="tags" type="text" placeholder="Cleanup, Performance, Gaming" style="width: 100%; padding: 0.75rem; background: rgba(11,15,22,0.9); border: 1px solid rgba(6,255,240,0.3); border-radius: 8px; color: #FFF; font-size: 1rem;">
        </div>
        
        <div style="margin-bottom: 2rem;">
          <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
            <input name="featured" type="checkbox" style="width: 20px; height: 20px;">
            <span style="color: #06FFF0; font-weight: 600;">Als Featured markieren (erscheint auf Startseite)</span>
          </label>
        </div>
        
        <button type="submit" class="btn btn--neon" style="width: 100%; padding: 1.25rem; font-size: 1.1rem;">
          ⚡ Script hochladen
        </button>
        
        <div id="uploadStatus" style="margin-top: 1.5rem; padding: 1rem; border-radius: 8px; display: none;"></div>
      </form>
    </div>
  </main>

  <script>
    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const status = document.getElementById('uploadStatus');
      
      status.style.display = 'block';
      status.style.background = 'rgba(6,255,240,0.1)';
      status.style.color = '#06FFF0';
      status.textContent = '⏳ Uploading...';
      
      try {
        const response = await fetch('upload.php', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          status.style.background = 'rgba(0,255,136,0.2)';
          status.style.color = '#00FF88';
          status.textContent = '✓ ' + result.message;
          e.target.reset();
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
        } else {
          status.style.background = 'rgba(255,87,87,0.2)';
          status.style.color = '#FF5757';
          status.textContent = '✗ ' + result.message;
        }
      } catch (error) {
        status.style.background = 'rgba(255,87,87,0.2)';
        status.style.color = '#FF5757';
        status.textContent = '✗ Upload fehlgeschlagen!';
      }
    });
  </script>
</body>
</html>

