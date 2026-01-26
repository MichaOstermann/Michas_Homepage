<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Datei für Bewertungen
$ratingsFile = __DIR__ . '/template-ratings.json';

// Logging-Funktion
function logRating($message) {
    $logFile = __DIR__ . '/template-ratings-log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    @file_put_contents($logFile, "[$timestamp] IP: $ip - $message\n", FILE_APPEND | LOCK_EX);
}

// Ratings laden oder initialisieren
function loadRatings() {
    global $ratingsFile;
    if (!file_exists($ratingsFile)) {
        $initialData = [
            'terminator-t800' => [
                'totalStars' => 60,
                'totalVotes' => 12,
                'average' => 5.0
            ],
            'hogwarts-magic' => [
                'totalStars' => 40,
                'totalVotes' => 8,
                'average' => 5.0
            ]
        ];
        file_put_contents($ratingsFile, json_encode($initialData, JSON_PRETTY_PRINT));
        return $initialData;
    }
    
    $content = file_get_contents($ratingsFile);
    return json_decode($content, true) ?: [];
}

// Ratings speichern
function saveRatings($ratings) {
    global $ratingsFile;
    return file_put_contents($ratingsFile, json_encode($ratings, JSON_PRETTY_PRINT));
}

// GET - Ratings abrufen
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $ratings = loadRatings();
    
    logRating("GET request - Ratings abgerufen");
    
    echo json_encode([
        'success' => true,
        'ratings' => $ratings
    ]);
    exit;
}

// POST - Bewertung abgeben
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['templateId']) || !isset($data['stars'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Fehlende Daten (templateId oder stars)'
        ]);
        logRating("POST failed - Missing data");
        exit;
    }
    
    $templateId = $data['templateId'];
    $stars = intval($data['stars']);
    
    // Validierung
    if ($stars < 1 || $stars > 5) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Sterne müssen zwischen 1 und 5 liegen'
        ]);
        logRating("POST failed - Invalid stars: $stars");
        exit;
    }
    
    // Ratings laden
    $ratings = loadRatings();
    
    // Template initialisieren falls noch nicht vorhanden
    if (!isset($ratings[$templateId])) {
        $ratings[$templateId] = [
            'totalStars' => 0,
            'totalVotes' => 0,
            'average' => 0
        ];
    }
    
    // Neue Bewertung hinzufügen
    $ratings[$templateId]['totalStars'] += $stars;
    $ratings[$templateId]['totalVotes'] += 1;
    $ratings[$templateId]['average'] = round($ratings[$templateId]['totalStars'] / $ratings[$templateId]['totalVotes'], 1);
    
    // Speichern
    if (saveRatings($ratings)) {
        logRating("POST success - Template: $templateId, Stars: $stars, New Average: {$ratings[$templateId]['average']}");
        
        echo json_encode([
            'success' => true,
            'message' => 'Bewertung gespeichert',
            'rating' => $ratings[$templateId]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Fehler beim Speichern'
        ]);
        logRating("POST failed - Save error for template: $templateId");
    }
    exit;
}

// Andere Methoden nicht erlaubt
http_response_code(405);
echo json_encode([
    'success' => false,
    'message' => 'Methode nicht erlaubt'
]);
