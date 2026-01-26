<?php
require_once 'security.php';

header('Content-Type: application/json');
setSecurityHeaders();
initSecureSession();
requireLogin();

$dataFile = '../data/spielplan.json';

if (!file_exists('../data')) {
    mkdir('../data', 0755, true);
}

// GET
if ($_SERVER['REQUEST_METHOD'] === 'GET' || isset($_GET['action']) && $_GET['action'] === 'get') {
    if (file_exists($dataFile)) {
        $data = json_decode(file_get_contents($dataFile), true);
        echo json_encode($data);
    } else {
        $defaultData = [
            [
                'date' => '2025-11-23',
                'teams' => 'SV Werder Bremen vs FC Bayern München',
                'time' => '15:30',
                'location' => 'Weserstadion'
            ],
            [
                'date' => '2025-11-30',
                'teams' => 'Borussia Dortmund vs SV Werder Bremen',
                'time' => '18:30',
                'location' => 'Signal Iduna Park'
            ],
            [
                'date' => '2025-12-07',
                'teams' => 'SV Werder Bremen vs RB Leipzig',
                'time' => '15:30',
                'location' => 'Weserstadion'
            ]
        ];
        echo json_encode($defaultData);
    }
}

// POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['action']) && $_GET['action'] === 'save') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Spielplan gespeichert']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Fehler beim Speichern']);
    }
}
