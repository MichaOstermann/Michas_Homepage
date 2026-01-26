<?php
// Kommentare API für Musik Live
header('Content-Type: application/json; charset=utf-8');

$baseDir = __DIR__;
$commentsDir = $baseDir . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'comments';

if (!is_dir($commentsDir)) {
    if (!@mkdir($commentsDir, 0775, true) && !is_dir($commentsDir)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Kommentare-Verzeichnis konnte nicht erstellt werden.'
        ]);
        exit;
    }
}

function respond(array $payload, int $status = 200): void {
    if (http_response_code() === 200) {
        http_response_code($status);
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sanitize_song_id(string $songId): string {
    $clean = preg_replace('/[^a-zA-Z0-9_-]/', '', $songId);
    return substr((string)$clean, 0, 120);
}

function sanitize_text(string $value, int $maxLength = 1000): string {
    $value = trim($value);
    if ($value === '') return '';
    $value = preg_replace("/\s+/u", ' ', $value);
    return mb_substr($value, 0, $maxLength, 'UTF-8');
}

function normalize_comment_array(?array $data): array {
    if (!is_array($data)) return ['pending' => [], 'approved' => []];
    return [
        'pending' => array_values(is_array($data['pending'] ?? []) ? $data['pending'] : []),
        'approved' => array_values(is_array($data['approved'] ?? []) ? $data['approved'] : [])
    ];
}

function load_comments(string $filePath): array {
    if (!file_exists($filePath)) {
        return ['pending' => [], 'approved' => []];
    }
    $raw = @file_get_contents($filePath);
    if ($raw === false) {
        return ['pending' => [], 'approved' => []];
    }
    $decoded = json_decode($raw, true);
    return normalize_comment_array($decoded);
}

function save_comments(string $filePath, array $data): bool {
    $normalized = normalize_comment_array($data);
    $json = json_encode($normalized, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) return false;
    return @file_put_contents($filePath, $json, LOCK_EX) !== false;
}

$songId = '';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $songId = isset($_GET['song']) ? sanitize_song_id((string)$_GET['song']) : '';
    if ($songId === '') {
        respond(['success' => true, 'comments' => []]);
    }
    $filePath = $commentsDir . DIRECTORY_SEPARATOR . $songId . '.json';
    $data = load_comments($filePath);
    $approved = array_map(function(array $comment) {
        return [
            'id' => $comment['id'] ?? '',
            'name' => $comment['name'] ?? 'Anonym',
            'message' => $comment['message'] ?? '',
            'createdAt' => $comment['createdAt'] ?? null
        ];
    }, $data['approved']);

    respond([
        'success' => true,
        'comments' => $approved
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond([
        'success' => false,
        'error' => 'Methode nicht erlaubt.'
    ], 405);
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
if (!is_array($payload)) {
    respond(['success' => false, 'error' => 'Ungültige Daten.'], 400);
}

$songId = sanitize_song_id((string)($payload['songId'] ?? ''));
$name = sanitize_text((string)($payload['name'] ?? ''), 80);
$message = trim((string)($payload['message'] ?? ''));
$message = preg_replace("/^\s+|\s+$/u", '', $message);
$message = mb_substr($message, 0, 1500, 'UTF-8');

if ($songId === '' || $name === '' || mb_strlen($message, 'UTF-8') < 5) {
    respond(['success' => false, 'error' => 'Bitte gültigen Namen und Kommentar angeben.'], 400);
}

$filePath = $commentsDir . DIRECTORY_SEPARATOR . $songId . '.json';
$data = load_comments($filePath);

$commentId = bin2hex(random_bytes(8));
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$pendingComment = [
    'id' => $commentId,
    'name' => $name,
    'message' => trim($message),
    'createdAt' => gmdate('c'),
    'ipHash' => substr(hash('sha256', $ip), 0, 24),
    'status' => 'pending'
];

$data['pending'][] = $pendingComment;

if (!save_comments($filePath, $data)) {
    respond(['success' => false, 'error' => 'Kommentar konnte nicht gespeichert werden.'], 500);
}

respond([
    'success' => true,
    'message' => 'Kommentar wurde gespeichert und wartet auf Freigabe.'
]);

