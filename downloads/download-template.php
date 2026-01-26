<?php
// === Download-Seite für Templates mit Token-Überprüfung ===
// Beispiel: https://deine-seite.de/downloads/download-template.php?token=ABC123

// --- Einstellungen ---
$templateFile = 'template-xyz.zip'; // Pfad zur Template-Datei
$validTokens = [
    'ABC123', // Beispiel-Token
    // Hier weitere gültige Tokens eintragen
];
$token = isset($_GET['token']) ? $_GET['token'] : '';

// --- Token prüfen ---
if (!in_array($token, $validTokens)) {
    echo '<h2>Download nicht möglich</h2>';
    echo '<p>Der Link ist ungültig oder abgelaufen.</p>';
    exit;
}

// --- Datei zum Download anbieten ---
if (file_exists($templateFile)) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="' . basename($templateFile) . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($templateFile));
    readfile($templateFile);
    exit;
} else {
    echo '<h2>Datei nicht gefunden</h2>';
    echo '<p>Bitte kontaktiere den Support.</p>';
    exit;
}
?>
