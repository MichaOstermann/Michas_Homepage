<?php
require_once 'security.php';

header('Content-Type: application/json');
setSecurityHeaders();
initSecureSession();
requireLogin();

$dataFile = '../data/community.json';

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
            ['name' => 'Thomas M.', 'since' => 'Fan seit 1995', 'image' => ''],
            ['name' => 'Sarah K.', 'since' => 'Fan seit 2010', 'image' => ''],
            ['name' => 'Markus B.', 'since' => 'Fan seit 1987', 'image' => ''],
            ['name' => 'Julia S.', 'since' => 'Fan seit 2018', 'image' => '']
        ];
        echo json_encode($defaultData);
    }
}

// POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getJsonInput();
    $data = sanitizeInput($data);
    
    if (file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Community gespeichert']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Fehler beim Speichern']);
    }
}

