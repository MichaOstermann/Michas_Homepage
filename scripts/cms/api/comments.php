<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Load scripts
$jsonFile = '../data/scripts.json';
if (!file_exists($jsonFile)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Scripts not found']);
    exit;
}

$scripts = json_decode(file_get_contents($jsonFile), true);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get comments for a specific script
    $scriptId = $_GET['script_id'] ?? null;
    
    if (!$scriptId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing script_id']);
        exit;
    }
    
    foreach ($scripts as $script) {
        if ($script['id'] == $scriptId) {
            $comments = $script['comments'] ?? [];
            echo json_encode(['success' => true, 'comments' => $comments]);
            exit;
        }
    }
    
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Script not found']);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add a new comment
    $input = json_decode(file_get_contents('php://input'), true);
    $scriptId = $input['script_id'] ?? null;
    $author = trim($input['author'] ?? '');
    $text = trim($input['text'] ?? '');
    
    if (!$scriptId || empty($author) || empty($text)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        exit;
    }
    
    // Simple validation
    if (strlen($author) > 50 || strlen($text) > 500) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Text too long']);
        exit;
    }
    
    $found = false;
    foreach ($scripts as &$script) {
        if ($script['id'] == $scriptId) {
            $found = true;
            
            if (!isset($script['comments'])) {
                $script['comments'] = [];
            }
            
            $newComment = [
                'id' => uniqid(),
                'author' => htmlspecialchars($author, ENT_QUOTES, 'UTF-8'),
                'text' => htmlspecialchars($text, ENT_QUOTES, 'UTF-8'),
                'date' => date('Y-m-d H:i:s'),
                'is_admin' => ($input['is_admin'] ?? false) ? true : false,
                'reply_to' => $input['reply_to'] ?? null
            ];
            
            $script['comments'][] = $newComment;
            
            // Save back
            file_put_contents($jsonFile, json_encode($scripts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            
            echo json_encode(['success' => true, 'comment' => $newComment]);
            exit;
        }
    }
    
    if (!$found) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Script not found']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
