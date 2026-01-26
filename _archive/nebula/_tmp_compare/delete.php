<?php
// Song löschen (Beta)
session_start();
header('Content-Type: application/json; charset=UTF-8');

$baseDir = __DIR__;
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
$tracksJson = $baseDir . DIRECTORY_SEPARATOR . 'tracks.json';
$assetsMediaDir = realpath($baseDir . '/../assets/media');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(405);
	echo json_encode(['success' => false, 'error' => 'Method not allowed']);
	exit;
}

// CSRF (check both manage and upload tokens)
$validToken = false;
if (!empty($_POST['csrf'])) {
	if (!empty($_SESSION['csrf_manage']) && hash_equals($_SESSION['csrf_manage'], $_POST['csrf'])) {
		$validToken = true;
	} elseif (!empty($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $_POST['csrf'])) {
		$validToken = true;
	}
}
if (!$validToken) {
	http_response_code(400);
	echo json_encode(['success' => false, 'error' => 'Invalid CSRF token']);
	exit;
}

$songId = trim((string)($_POST['songId'] ?? ''));
$category = trim((string)($_POST['category'] ?? ''));

if ($songId === '' || $category === '') {
	http_response_code(400);
	echo json_encode(['success' => false, 'error' => 'Missing songId or category']);
	exit;
}

$allowedCategories = ['party', 'rapp', 'love', 'gemischt'];
if (!in_array($category, $allowedCategories, true)) {
	http_response_code(400);
	echo json_encode(['success' => false, 'error' => 'Invalid category']);
	exit;
}

function remove_track_from_json($jsonPath, $songId) {
	if (!file_exists($jsonPath)) return false;
	$data = json_decode(@file_get_contents($jsonPath), true);
	if (!is_array($data) || !isset($data['tracks']) || !is_array($data['tracks'])) {
		return false;
	}
	$originalCount = count($data['tracks']);
	$data['tracks'] = array_values(array_filter($data['tracks'], function($t) use ($songId) {
		return isset($t['id']) && $t['id'] !== $songId;
	}));
	if (count($data['tracks']) === $originalCount) {
		return false; // Song nicht gefunden
	}
	return @file_put_contents($jsonPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) !== false;
}

// 1. Kategorie-JSON aktualisieren
$categoryJsonPath = $dataDir . DIRECTORY_SEPARATOR . $category . '.json';
$catRemoved = remove_track_from_json($categoryJsonPath, $songId);

// 2. Haupt-JSON aktualisieren
$mainRemoved = remove_track_from_json($tracksJson, $songId);

if (!$catRemoved && !$mainRemoved) {
	http_response_code(404);
	echo json_encode(['success' => false, 'error' => 'Song nicht gefunden']);
	exit;
}

// 3. Optional: MP3-Datei löschen (falls vorhanden)
// Hinweis: Aus Sicherheitsgründen löschen wir die Datei NICHT automatisch,
// da mehrere Tracks dieselbe Datei referenzieren könnten.
// Du kannst manuell aufräumen oder einen Admin-Bereich dafür bauen.

echo json_encode(['success' => true, 'message' => 'Song erfolgreich gelöscht']);
exit;

