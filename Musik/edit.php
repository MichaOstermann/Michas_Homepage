<?php
// Song bearbeiten (passwortgeschützt)
session_start();

// Auth-Check
if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
	header('Location: manage.php');
	exit;
}

$baseDir = __DIR__;
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
$tracksJson = $baseDir . DIRECTORY_SEPARATOR . 'tracks.json';

function h($s){ return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

function slugify_beta($str){
	if (function_exists('iconv')) {
		$tmp = @iconv('UTF-8','ASCII//TRANSLIT//IGNORE',$str);
		if ($tmp !== false) $str = $tmp;
	}
	$s = preg_replace('~[^a-zA-Z0-9]+~','-',(string)$str);
	$s = strtolower(trim($s,'-'));
	return $s !== '' ? $s : 'n-a';
}

// GET: Song-Daten laden
$songId = isset($_GET['id']) ? trim($_GET['id']) : '';
$category = isset($_GET['cat']) ? trim($_GET['cat']) : '';

if ($songId === '' || $category === '') {
	die('Fehler: Song-ID oder Kategorie fehlt');
}

$categoryJsonPath = $dataDir . DIRECTORY_SEPARATOR . $category . '.json';
if (!file_exists($categoryJsonPath)) {
	die('Fehler: Kategorie-JSON nicht gefunden');
}

$catData = json_decode(@file_get_contents($categoryJsonPath), true);
if (!is_array($catData) || !isset($catData['tracks'])) {
	die('Fehler: Ungültige JSON');
}

$songData = null;
foreach ($catData['tracks'] as $track) {
	if (isset($track['id']) && $track['id'] === $songId) {
		$songData = $track;
		break;
	}
}

if (!$songData) {
	die('Fehler: Song nicht gefunden');
}

// POST: Änderungen speichern
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	if (!isset($_POST['csrf']) || !isset($_SESSION['csrf_manage']) || !hash_equals($_SESSION['csrf_manage'], $_POST['csrf'])) {
		die('Fehler: Ungültiges CSRF-Token');
	}

	$newTitle = trim((string)($_POST['title'] ?? ''));
	$newDesc = trim((string)($_POST['description'] ?? ''));
	$newCategory = trim((string)($_POST['category'] ?? ''));

	if ($newTitle === '') {
		die('Fehler: Titel darf nicht leer sein');
	}

	$allowedCategories = ['party', 'rapp', 'love', 'gemischt', 'traurig'];
	if (!in_array($newCategory, $allowedCategories, true)) {
		die('Fehler: Ungültige Kategorie');
	}

	$regenerateCover = isset($_POST['regenerate_cover']);

	// Update in beiden JSONs
	$updated = false;

	// 1. Alte Kategorie-JSON
	foreach ($catData['tracks'] as $idx => $track) {
		if (isset($track['id']) && $track['id'] === $songId) {
			$catData['tracks'][$idx]['title'] = $newTitle;
			$catData['tracks'][$idx]['description'] = $newDesc;
			
			// Kategorie geändert? Dann aus dieser Liste entfernen
			if ($newCategory !== $category) {
				unset($catData['tracks'][$idx]);
				$catData['tracks'] = array_values($catData['tracks']);
			} else {
				$catData['tracks'][$idx]['category'] = $newCategory;
			}
			$updated = true;
			break;
		}
	}
	@file_put_contents($categoryJsonPath, json_encode($catData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

	// 2. Haupt-JSON
	if (file_exists($tracksJson)) {
		$mainData = json_decode(@file_get_contents($tracksJson), true);
		if (is_array($mainData) && isset($mainData['tracks'])) {
			foreach ($mainData['tracks'] as $idx => $track) {
				if (isset($track['id']) && $track['id'] === $songId) {
					$mainData['tracks'][$idx]['title'] = $newTitle;
					$mainData['tracks'][$idx]['description'] = $newDesc;
					$mainData['tracks'][$idx]['category'] = $newCategory;
					break;
				}
			}
			@file_put_contents($tracksJson, json_encode($mainData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
		}
	}

	// 3. Wenn Kategorie geändert: In neue Kategorie-JSON einfügen
	if ($newCategory !== $category) {
		$newCatJsonPath = $dataDir . DIRECTORY_SEPARATOR . $newCategory . '.json';
		$newCatData = ['tracks' => []];
		if (file_exists($newCatJsonPath)) {
			$newCatData = json_decode(@file_get_contents($newCatJsonPath), true);
			if (!is_array($newCatData) || !isset($newCatData['tracks'])) {
				$newCatData = ['tracks' => []];
			}
		}
		$songData['title'] = $newTitle;
		$songData['description'] = $newDesc;
		$songData['category'] = $newCategory;
		$newCatData['tracks'][] = $songData;
		@file_put_contents($newCatJsonPath, json_encode($newCatData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
	}

	// 4. Cover neu generieren falls gewünscht
	if ($regenerateCover) {
		header('Location: manage.php?regenerateCover=' . urlencode($songId));
		exit;
	}

	header('Location: manage.php?updated=1');
	exit;
}

$csrfToken = $_SESSION['csrf_manage'] ?? '';
?>
<!DOCTYPE html>
<html lang="de">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Song bearbeiten – Musik Beta</title>
	<link rel="icon" type="image/svg+xml" href="../assets/media/favicon.svg" />
	<link rel="stylesheet" href="../assets/css/styles.css" />
	<style>
		body { background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%); }
		.edit-container {
			max-width: 800px;
			margin: 6rem auto 2rem;
			padding: 2rem;
		}
		.edit-card {
			background: linear-gradient(135deg, rgba(11,15,22,0.9) 0%, rgba(20,20,30,0.9) 100%);
			border: 2px solid rgba(6,255,240,0.3);
			border-radius: 16px;
			padding: 2.5rem;
		}
		.edit-card h1 {
			font-size: 2rem;
			margin-bottom: 0.5rem;
			background: linear-gradient(135deg, #06FFF0 0%, #8B5CF6 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}
		.form__label {
			display: block;
			margin-bottom: 1.5rem;
		}
		.form__label-text {
			display: block;
			font-weight: 600;
			margin-bottom: 0.5rem;
			color: #06FFF0;
		}
		.form__input, .form__textarea {
			width: 100%;
			padding: 0.85rem;
			background: rgba(11,15,22,0.8);
			border: 2px solid rgba(6,255,240,0.3);
			border-radius: 10px;
			color: #fff;
			font-size: 1rem;
		}
		.form__input:focus, .form__textarea:focus {
			outline: none;
			border-color: #06FFF0;
			box-shadow: 0 0 15px rgba(6,255,240,0.5);
		}
		.form__textarea {
			resize: vertical;
			min-height: 120px;
			font-family: inherit;
		}
		.form-actions {
			display: flex;
			gap: 1rem;
			margin-top: 2rem;
			flex-wrap: wrap;
		}
		.checkbox-label {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			margin: 1rem 0;
			cursor: pointer;
		}
		.checkbox-label input {
			width: 20px;
			height: 20px;
		}
	</style>
</head>
<body>
	<header class="header">
		<nav class="nav container">
			<a class="nav__logo" href="./manage.php">← Zurück zur Verwaltung</a>
		</nav>
	</header>
	<main class="main">
		<div class="edit-container">
			<div class="edit-card">
				<h1>✏️ Song bearbeiten</h1>
				<p class="txt-dim" style="margin-bottom: 2rem;">Bearbeite die Song-Informationen</p>

				<form method="post">
					<input type="hidden" name="csrf" value="<?= h($csrfToken) ?>">

					<label class="form__label">
						<span class="form__label-text">Titel *</span>
						<input class="form__input" type="text" name="title" required value="<?= h($songData['title'] ?? '') ?>" autocomplete="off">
					</label>

					<label class="form__label">
						<span class="form__label-text">Kategorie *</span>
						<select class="form__input" name="category" required>
							<option value="party" <?= ($category === 'party') ? 'selected' : '' ?>>🎉 Party Lieder</option>
							<option value="rapp" <?= ($category === 'rapp') ? 'selected' : '' ?>>🎤 Rapp Songs</option>
							<option value="love" <?= ($category === 'love') ? 'selected' : '' ?>>❤️ Love</option>
							<option value="gemischt" <?= ($category === 'gemischt') ? 'selected' : '' ?>>🔀 Gemischt</option>
							<option value="traurig" <?= ($category === 'traurig') ? 'selected' : '' ?>>😢 Traurig</option>
						</select>
					</label>

					<label class="form__label">
						<span class="form__label-text">Beschreibung (optional)</span>
						<textarea class="form__textarea" name="description"><?= h($songData['description'] ?? '') ?></textarea>
					</label>

					<label class="checkbox-label">
						<input type="checkbox" name="regenerate_cover" value="1">
						<span class="txt-dim">🎨 Cover nach Speichern neu generieren</span>
					</label>

					<div class="form-actions">
						<button class="btn btn--neon" type="submit">✓ Speichern</button>
						<a class="btn btn--glass" href="./manage.php">Abbrechen</a>
					</div>
				</form>
			</div>
		</div>
	</main>
</body>
</html>

