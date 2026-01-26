<?php
// Upload mit Kategorie-basierter Ordnerstruktur
session_start();
header('X-Frame-Options: SAMEORIGIN');

$baseDir = __DIR__;
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
$tracksJson = $baseDir . DIRECTORY_SEPARATOR . 'tracks.json';

if (!is_dir($dataDir)) {
	@mkdir($dataDir, 0775, true);
}

function h($s){ return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

function sanitize_filename_beta($name){
	$name = (string)$name;
	$name = preg_replace('~[^\w\-. ]+~u', '_', $name);
	$name = preg_replace('~\s+~', '_', $name);
	$name = trim($name, '._-');
	return $name !== '' ? $name : 'file';
}

function slugify_beta($str){
	if (function_exists('iconv')) {
		$tmp = @iconv('UTF-8','ASCII//TRANSLIT//IGNORE',$str);
		if ($tmp !== false) $str = $tmp;
	}
	$s = preg_replace('~[^a-zA-Z0-9]+~','-',(string)$str);
	$s = strtolower(trim($s,'-'));
	return $s !== '' ? $s : 'n-a';
}

function ensure_json_base($path){
	if (!file_exists($path)) {
		@file_put_contents($path, json_encode(['tracks'=>[]], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
	}
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	if (empty($_POST['csrf']) || empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $_POST['csrf'])) {
		http_response_code(400);
		echo 'Ungültiges Formular.';
		exit;
	}
	$title = trim((string)($_POST['title'] ?? ''));
	$category = trim((string)($_POST['category'] ?? 'gemischt'));
	$description = trim((string)($_POST['description'] ?? ''));
	if ($title === '') $title = 'Unbenannter Track';
	
	$allowedCategories = ['party', 'rapp', 'love', 'gemischt', 'traurig'];
	if (!in_array($category, $allowedCategories, true)) $category = 'gemischt';

	if (empty($_FILES['audio']) || $_FILES['audio']['error'] !== UPLOAD_ERR_OK) {
		http_response_code(400);
		echo 'Upload fehlgeschlagen.';
		exit;
	}
	$tmp = $_FILES['audio']['tmp_name'];
	$origName = sanitize_filename_beta($_FILES['audio']['name']);
	$ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
	if ($ext !== 'mp3') {
		http_response_code(400);
		echo 'Nur MP3 erlaubt.';
		exit;
	}

	// Kategorie-Ordner erstellen
	$categoryAudioDir = $baseDir . DIRECTORY_SEPARATOR . 'audio' . DIRECTORY_SEPARATOR . $category;
	if (!is_dir($categoryAudioDir)) {
		@mkdir($categoryAudioDir, 0775, true);
	}

	$destName = $origName;
	$destPath = $categoryAudioDir . DIRECTORY_SEPARATOR . $destName;
	$counter = 1;
	while (file_exists($destPath)) {
		$base = pathinfo($origName, PATHINFO_FILENAME);
		$destName = $base . '_' . $counter . '.mp3';
		$destPath = $categoryAudioDir . DIRECTORY_SEPARATOR . $destName;
		$counter++;
	}
	if (!@move_uploaded_file($tmp, $destPath)) {
		http_response_code(500);
		echo 'Konnte Datei nicht verschieben.';
		exit;
	}

	// Prüfe ob Song bereits existiert (nach Titel oder Dateiname)
	$allTracksData = json_decode(@file_get_contents($tracksJson), true);
	if (is_array($allTracksData) && isset($allTracksData['tracks']) && is_array($allTracksData['tracks'])) {
		foreach ($allTracksData['tracks'] as $existing) {
			// Prüfe Titel (case-insensitive)
			if (isset($existing['title']) && strtolower(trim($existing['title'])) === strtolower($title)) {
				http_response_code(400);
				echo 'Song mit diesem Titel existiert bereits: "' . h($existing['title']) . '" in Kategorie ' . h($existing['category'] ?? 'unbekannt');
				exit;
			}
			// Prüfe Dateiname
			if (isset($existing['audio']) && strtolower(trim($existing['audio'])) === strtolower($destName)) {
				http_response_code(400);
				echo 'Datei mit diesem Namen existiert bereits: "' . h($existing['audio']) . '"';
				exit;
			}
		}
	}

	$id = slugify_beta($title) . '-' . substr(md5(uniqid('', true)), 0, 6);
	$trackEntry = [
		'id' => $id,
		'title' => $title,
		'category' => $category,
		'description' => $description,
		'cover' => 'covers/' . $id . '.svg',
		'coverGenerated' => true,
		'audio' => $destName,
		'folder' => 'Musik/audio/' . $category,
		'isNew' => true
	];

	// 1. Kategorie-JSON aktualisieren
	$categoryJsonPath = $dataDir . DIRECTORY_SEPARATOR . $category . '.json';
	ensure_json_base($categoryJsonPath);
	$catData = json_decode(@file_get_contents($categoryJsonPath), true);
	if (!is_array($catData) || !isset($catData['tracks']) || !is_array($catData['tracks'])) {
		$catData = ['tracks'=>[]];
	}
	$catData['tracks'][] = $trackEntry;
	@file_put_contents($categoryJsonPath, json_encode($catData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

	// 2. Haupt-JSON aktualisieren
	ensure_json_base($tracksJson);
	$mainData = json_decode(@file_get_contents($tracksJson), true);
	if (!is_array($mainData) || !isset($mainData['tracks']) || !is_array($mainData['tracks'])) {
		$mainData = ['tracks'=>[]];
	}
	$mainData['tracks'][] = $trackEntry;
	@file_put_contents($tracksJson, json_encode($mainData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);

	// Redirect zur Musik-Seite mit Erfolgsmeldung
	header('Location: ./index.html?uploaded=' . urlencode($id) . '&category=' . urlencode($category));
	exit;
}

$csrfToken = bin2hex(random_bytes(16));
$_SESSION['csrf'] = $csrfToken;
?>
<!DOCTYPE html>
<html lang="de">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Song hochladen (Beta) – Code & Beats</title>
	<link rel="icon" type="image/svg+xml" href="../assets/media/favicon.svg" />
	<link rel="stylesheet" href="../assets/css/styles.css" />
	<style>
		body {
			background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%);
		}
		.upload-container {
			max-width: 800px;
			margin: 0 auto;
			padding: 2rem;
		}
		.upload-card {
			background: linear-gradient(135deg, rgba(11,15,22,0.9) 0%, rgba(20,20,30,0.9) 100%);
			border: 2px solid rgba(6,255,240,0.3);
			border-radius: 16px;
			padding: 2.5rem;
			backdrop-filter: blur(10px);
		}
		.upload-card h1 {
			font-size: 2rem;
			margin-bottom: 0.5rem;
			background: linear-gradient(135deg, #06FFF0 0%, #8B5CF6 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}
		.upload-card p {
			margin-bottom: 2rem;
			opacity: 0.8;
		}
		.form-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
			gap: 1.5rem;
			margin-bottom: 1.5rem;
		}
		.form__label {
			display: block;
		}
		.form__label-text {
			display: block;
			font-weight: 600;
			margin-bottom: 0.5rem;
			color: #06FFF0;
			font-size: 0.95rem;
		}
		.form__input,
		.form__textarea {
			width: 100%;
			padding: 0.85rem;
			background: rgba(11,15,22,0.8);
			border: 2px solid rgba(6,255,240,0.3);
			border-radius: 10px;
			color: #fff;
			font-size: 1rem;
			transition: all 0.3s ease;
		}
		.form__input:focus,
		.form__textarea:focus {
			outline: none;
			border-color: #06FFF0;
			box-shadow: 0 0 15px rgba(6,255,240,0.5);
		}
		.form__textarea {
			resize: vertical;
			min-height: 120px;
			font-family: inherit;
			line-height: 1.6;
		}
		.form__help {
			display: block;
			margin-top: 0.4rem;
			font-size: 0.85rem;
			opacity: 0.65;
			font-style: italic;
		}
		.form-actions {
			display: flex;
			gap: 1rem;
			margin-top: 2rem;
			flex-wrap: wrap;
		}
		.btn {
			padding: 0.85rem 2rem;
			border-radius: 12px;
			font-weight: 700;
			text-decoration: none;
			display: inline-block;
			transition: all 0.3s ease;
			border: none;
			cursor: pointer;
			font-size: 1rem;
		}
		.btn--neon {
			background: linear-gradient(135deg, #06FFF0 0%, #8B5CF6 100%);
			color: #000;
			box-shadow: 0 0 20px rgba(6,255,240,0.4);
		}
		.btn--neon:hover {
			box-shadow: 0 0 30px rgba(6,255,240,0.6);
			transform: translateY(-2px);
		}
		.btn--glass {
			background: rgba(11,15,22,0.6);
			color: #06FFF0;
			border: 2px solid rgba(6,255,240,0.3);
		}
		.btn--glass:hover {
			border-color: #06FFF0;
			background: rgba(6,255,240,0.1);
		}
	</style>
</head>
<body>
	<header class="header">
		<nav class="nav container">
			<a class="nav__logo" href="./index.html">← Zurück zur Musik</a>
		</nav>
	</header>
	<main class="main" style="padding-top: 6rem;">
		<div class="upload-container">
			<div class="upload-card">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
					<h1 style="margin: 0;">🎵 Neuen Song hochladen</h1>
					<a href="./manage.php" class="btn btn--glass" style="font-size: 0.9rem;">🗑️ Songs verwalten</a>
				</div>
				<p class="txt-dim" style="margin-bottom: 2rem;">Lade einen neuen MP3-Track hoch und wähle die Kategorie.</p>
				
				<form method="post" enctype="multipart/form-data">
					<input type="hidden" name="csrf" value="<?= h($csrfToken) ?>">
					
					<div class="form-grid">
						<label class="form__label">
							<span class="form__label-text">Titel *</span>
							<input class="form__input" type="text" name="title" required placeholder="z.B. Mein neuer Hit" autocomplete="off">
							<small class="form__help">Der Titel erscheint auf der Musik-Karte</small>
						</label>

						<label class="form__label">
							<span class="form__label-text">Kategorie *</span>
							<select class="form__input" name="category" required>
								<option value="party">🎉 Party Lieder</option>
								<option value="rapp">🎤 Rapp Songs</option>
								<option value="love">❤️ Love</option>
								<option value="traurig">😢 Traurig</option>
								<option value="gemischt" selected>🔀 Gemischt</option>
							</select>
							<small class="form__help">Song wird automatisch in dieser Kategorie einsortiert</small>
						</label>
					</div>

					<label class="form__label">
						<span class="form__label-text">Beschreibung (optional)</span>
						<textarea class="form__textarea" name="description" placeholder="Kurze Beschreibung des Songs..."></textarea>
						<small class="form__help">Erscheint als Info-Text auf der Musik-Karte</small>
					</label>

					<label class="form__label">
						<span class="form__label-text">MP3 Datei *</span>
						<input class="form__input" type="file" name="audio" accept=".mp3,audio/mpeg" required>
						<small class="form__help">Nur MP3-Dateien • Wird automatisch in Kategorie-Ordner gespeichert</small>
					</label>

					<div class="form-actions">
						<button class="btn btn--neon" type="submit">✓ Hochladen</button>
						<a class="btn btn--glass" href="./index.html">Abbrechen</a>
					</div>
				</form>
			</div>
		</div>
	</main>
</body>
</html>

