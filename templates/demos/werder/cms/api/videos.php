<?php
require_once 'security.php';

header('Content-Type: application/json');
setSecurityHeaders();
initSecureSession();
requireLogin();

$dataFile = '../data/videos.json';

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
                'url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'title' => 'Highlights letzte Spiel',
                'thumbnail' => 'https://via.placeholder.com/400x225/1D9A50/FFFFFF?text=Video+1'
            ],
            [
                'url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'title' => 'Training der Woche',
                'thumbnail' => 'https://via.placeholder.com/400x225/1D9A50/FFFFFF?text=Video+2'
            ],
            [
                'url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'title' => 'Interview Trainer',
                'thumbnail' => 'https://via.placeholder.com/400x225/1D9A50/FFFFFF?text=Video+3'
            ]
        ];
        echo json_encode($defaultData);
    }
}

// POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' || isset($_GET['action']) && $_GET['action'] === 'save') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Videos gespeichert']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Fehler beim Speichern']);
    }
}
