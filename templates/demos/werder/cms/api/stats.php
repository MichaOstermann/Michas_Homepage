<?php
// ═════════════════════════════════════════════════════════════
// STATS API - SECURE
// © 2025 Michael Ostermann
// ═════════════════════════════════════════════════════════════

require_once 'security.php';

header('Content-Type: application/json');
setSecurityHeaders();
initSecureSession();
requireLogin();

$dataFile = '../data/stats.json';

// Erstelle data-Ordner wenn nicht existiert
if (!file_exists('../data')) {
    mkdir('../data', 0755, true);
}

// GET: Daten laden
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dataFile)) {
        $data = json_decode(file_get_contents($dataFile), true);
        echo json_encode($data);
    } else {
        // Default-Daten
        $defaultData = [
            ['number' => 250, 'label' => 'Aktive Mitglieder'],
            ['number' => 1200, 'label' => 'Hochgeladene Fotos'],
            ['number' => 85, 'label' => 'Fan-Stories'],
            ['number' => 42, 'label' => 'Community-Events']
        ];
        echo json_encode($defaultData);
    }
}

// POST: Daten speichern
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    $data = sanitizeInput($data);
    
    if (file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Stats gespeichert']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Fehler beim Speichern']);
    }
}
