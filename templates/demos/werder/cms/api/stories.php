<?php
require_once 'security.php';

header('Content-Type: application/json');
setSecurityHeaders();
initSecureSession();
requireLogin();

$dataFile = '../data/stories.json';

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
            [
                'title' => 'Mein erstes Spiel im Weserstadion',
                'content' => 'Als 7-Jähriger das erste Mal live dabei – ein Moment, den ich nie vergessen werde. Die Atmosphäre war unbeschreiblich...',
                'badge' => 'Story'
            ],
            [
                'title' => 'Auswärtssieg in München!',
                'content' => '15 Stunden Busfahrt, aber es hat sich gelohnt! Der Sieg in der Allianz Arena war legendär...',
                'badge' => 'Reise'
            ],
            [
                'title' => 'Fan-Stammtisch seit 20 Jahren',
                'content' => 'Jeden Freitag treffen wir uns – durch dick und dünn. Werder verbindet Generationen...',
                'badge' => 'Community'
            ]
        ];
        echo json_encode($defaultData);
    }
}

// POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Stories gespeichert']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Fehler beim Speichern']);
    }
}

