<?php
require_once 'security.php';

header('Content-Type: application/json');
setSecurityHeaders();
initSecureSession();
requireLogin();

$dataFile = '../data/events.json';

if (!file_exists('../data')) {
    mkdir('../data', 0755, true);
}

// GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dataFile)) {
        $data = json_decode(file_get_contents($dataFile), true);
        echo json_encode($data);
    } else {
        $defaultData = [
            'title' => 'Public Viewing',
            'date' => '2025-11-23',
            'time' => '15:00',
            'location' => 'Fan-Stammtisch "Zur Raute"',
            'description' => 'Zusammen Anfeuern!'
        ];
        echo json_encode($defaultData);
    }
}

// POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    $data = sanitizeInput($data);
    
    if (file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Event gespeichert']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Fehler beim Speichern']);
    }
}

