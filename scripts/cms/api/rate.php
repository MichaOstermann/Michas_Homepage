<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$scriptId = $input['script_id'] ?? null;
$rating = $input['rating'] ?? null;

if (!$scriptId || !$rating || $rating < 1 || $rating > 5) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}

// Load scripts
$jsonFile = '../data/scripts.json';
if (!file_exists($jsonFile)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Scripts not found']);
    exit;
}

$scripts = json_decode(file_get_contents($jsonFile), true);
$found = false;

foreach ($scripts as &$script) {
    if ($script['id'] == $scriptId) {
        $found = true;
        
        // Calculate new rating
        $currentRating = $script['rating'] ?? 0;
        $currentCount = $script['rating_count'] ?? 0;
        
        $totalRating = ($currentRating * $currentCount) + $rating;
        $newCount = $currentCount + 1;
        $newRating = $totalRating / $newCount;
        
        $script['rating'] = round($newRating, 2);
        $script['rating_count'] = $newCount;
        
        // Save back
        file_put_contents($jsonFile, json_encode($scripts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        echo json_encode([
            'success' => true,
            'new_rating' => $script['rating'],
            'rating_count' => $script['rating_count']
        ]);
        break;
    }
}

if (!$found) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Script not found']);
}
