<?php
require_once 'security.php';

header('Content-Type: application/json');
setSecurityHeaders();
initSecureSession();
requireLogin();

$dataFile = '../data/galerie.json';

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
                'url' => 'https://via.placeholder.com/400x300/1D9A50/FFFFFF?text=Fan+Foto+1',
                'title' => 'Public Viewing 2024'
            ],
            [
                'url' => 'https://via.placeholder.com/400x300/1D9A50/FFFFFF?text=Fan+Foto+2',
                'title' => 'Weserstadion Besuch'
            ],
            [
                'url' => 'https://via.placeholder.com/400x300/1D9A50/FFFFFF?text=Fan+Foto+3',
                'title' => 'Fanclub Treffen'
            ],
            [
                'url' => 'https://via.placeholder.com/400x300/1D9A50/FFFFFF?text=Fan+Foto+4',
                'title' => 'Auswärtsspiel Hamburg'
            ],
            [
                'url' => 'https://via.placeholder.com/400x300/1D9A50/FFFFFF?text=Fan+Foto+5',
                'title' => 'Fanmarsch'
            ],
            [
                'url' => 'https://via.placeholder.com/400x300/1D9A50/FFFFFF?text=Fan+Foto+6',
                'title' => 'Derby Sieg'
            ]
        ];
        echo json_encode($defaultData);
    }
}

// POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['action']) && $_GET['action'] === 'save') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Galerie gespeichert']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Fehler beim Speichern']);
    }
}
