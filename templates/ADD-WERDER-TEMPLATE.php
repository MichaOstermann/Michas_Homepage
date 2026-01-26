<?php
/**
 * AUTOMATISCHES WERDER-TEMPLATE INSTALLATIONS-SCRIPT
 * Fügt das Werder Bremen Template zur templates.json hinzu
 */

echo "<!DOCTYPE html>
<html lang='de'>
<head>
    <meta charset='UTF-8'>
    <title>Werder Template Installation</title>
    <style>
        body { font-family: Arial; background: #0B0F16; color: #fff; padding: 2rem; }
        .container { max-width: 800px; margin: 0 auto; background: rgba(29, 154, 80, 0.1); padding: 2rem; border-radius: 12px; border: 2px solid #1D9A50; }
        h1 { color: #1D9A50; }
        .success { background: #e8f5e9; color: #2e7d32; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
        .error { background: #ffebee; color: #c62828; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
        .info { background: #e3f2fd; color: #1565c0; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
        .btn { background: linear-gradient(135deg, #1D9A50 0%, #2ECC71 100%); color: #fff; padding: 1rem 2rem; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 700; }
        .btn:hover { transform: translateY(-2px); }
        pre { background: #000; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    </style>
</head>
<body>
<div class='container'>
<h1>⚽ Werder Bremen Template - Installation</h1>";

$templates_file = __DIR__ . '/templates.json';

if (!file_exists($templates_file)) {
    echo "<div class='error'>❌ <strong>Fehler:</strong> templates.json nicht gefunden!<br>Pfad: " . $templates_file . "</div>";
    exit;
}

// Aktuelle templates.json laden
$current_json = file_get_contents($templates_file);
$data = json_decode($current_json, true);

if (!$data || !isset($data['templates'])) {
    echo "<div class='error'>❌ <strong>Fehler:</strong> templates.json ist ungültig!</div>";
    exit;
}

echo "<div class='info'>📋 <strong>Aktuelle Templates auf dem Server:</strong><br>";
foreach ($data['templates'] as $tpl) {
    echo "• " . htmlspecialchars($tpl['name']) . "<br>";
}
echo "</div>";

// Prüfe ob Werder schon existiert
$werder_exists = false;
foreach ($data['templates'] as $tpl) {
    if ($tpl['id'] === 'werder-bremen') {
        $werder_exists = true;
        break;
    }
}

if ($werder_exists) {
    echo "<div class='error'>⚠️ <strong>Werder Bremen Template bereits vorhanden!</strong><br>Keine Aktion erforderlich.</div>";
    echo "<p><a href='index.html' style='color: #1D9A50;'>→ Zur Template-Übersicht</a></p>";
    exit;
}

// Werder Template hinzufügen
if (isset($_POST['install'])) {
    $werder_template = [
        'id' => 'werder-bremen',
        'name' => 'Werder Bremen Fan-Seite',
        'category' => 'sports',
        'description' => 'Komplettes Fußball-Template mit CMS-Backend! Verwalte Spielpläne, Foto-Galerie, Videos und mehr. Multi-User-System mit Admin-Freigabe. Perfekt für Sportvereine!',
        'previewImage' => 'demos/werder/thumb.svg',
        'demoUrl' => 'demos/werder/index.html',
        'downloadUrl' => '#',
        'tags' => ['Fußball', 'Werder Bremen', 'CMS', 'Sport', 'Multi-User'],
        'features' => ['Live CMS Backend', 'Spielplan-Verwaltung', 'Foto-Galerie', 'Video-Upload', 'Multi-User-System', 'E-Mail-Freigabe'],
        'rating' => 5.0,
        'ratingCount' => 0,
        'downloads' => 0,
        'lastUpdated' => date('Y-m-d'),
        'badge' => 'NEW'
    ];
    
    // Hinzufügen
    $data['templates'][] = $werder_template;
    
    // Backup erstellen
    $backup_file = $templates_file . '.backup-' . date('Ymd-His');
    copy($templates_file, $backup_file);
    
    // Neue JSON schreiben
    $new_json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if (file_put_contents($templates_file, $new_json)) {
        echo "<div class='success'>";
        echo "✅ <strong>ERFOLGREICH INSTALLIERT!</strong><br><br>";
        echo "📦 <strong>Werder Bremen Template</strong> wurde hinzugefügt!<br>";
        echo "💾 Backup erstellt: <code>" . basename($backup_file) . "</code><br><br>";
        echo "<strong>Neue Template-Liste:</strong><br>";
        foreach ($data['templates'] as $tpl) {
            $badge = $tpl['id'] === 'werder-bremen' ? ' 🆕' : '';
            echo "• " . htmlspecialchars($tpl['name']) . $badge . "<br>";
        }
        echo "</div>";
        
        echo "<p><strong>🎉 Fertig!</strong></p>";
        echo "<p><a href='index.html' style='color: #1D9A50; font-weight: 700; font-size: 1.2rem;'>→ Zur Template-Übersicht (mit Werder Bremen!)</a></p>";
        
        // Script löschen (optional)
        echo "<div class='info'>";
        echo "💡 <strong>Tipp:</strong> Du kannst dieses Script jetzt löschen:<br>";
        echo "<code>" . basename(__FILE__) . "</code>";
        echo "</div>";
    } else {
        echo "<div class='error'>❌ <strong>Fehler beim Schreiben!</strong><br>Keine Schreibrechte?</div>";
    }
} else {
    // Installations-Formular
    echo "<form method='post'>";
    echo "<div class='info'>";
    echo "<strong>⚽ Werder Bremen Template wird hinzugefügt:</strong><br><br>";
    echo "• <strong>Name:</strong> Werder Bremen Fan-Seite<br>";
    echo "• <strong>Kategorie:</strong> Sports<br>";
    echo "• <strong>Features:</strong> Live CMS Backend, Spielplan, Galerie, Videos<br>";
    echo "• <strong>Multi-User-System</strong> mit E-Mail-Freigabe<br><br>";
    echo "<strong>📋 Was passiert:</strong><br>";
    echo "1. Backup der aktuellen templates.json wird erstellt<br>";
    echo "2. Werder Bremen Template wird hinzugefügt<br>";
    echo "3. templates.json wird aktualisiert<br>";
    echo "4. Template erscheint auf der Übersichtsseite<br>";
    echo "</div>";
    echo "<p style='text-align: center;'>";
    echo "<button type='submit' name='install' class='btn'>✅ JETZT INSTALLIEREN</button>";
    echo "</p>";
    echo "</form>";
}

echo "</div></body></html>";
?>



