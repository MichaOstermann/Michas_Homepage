<?php
// Rating-Verwaltung (Admin)
session_start();

// Passwortkonfiguration laden
$configFile = __DIR__ . '/config/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo 'Konfigurationsdatei fehlt: config/config.php';
    exit;
}
require_once $configFile;

if (!isset($manage_password_hash, $manage_password_salt)) {
    http_response_code(500);
    echo 'Passwortkonfiguration unvollständig.';
    exit;
}

function verify_manage_password(string $input, string $salt, string $hash): bool {
    $candidate = hash('sha256', $input . '|' . $salt);
    return hash_equals($hash, $candidate);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if (verify_manage_password($_POST['password'], $manage_password_salt, $manage_password_hash)) {
        $_SESSION['authenticated'] = true;
        header('Location: ratings-admin.php');
        exit;
    } else {
        $loginError = 'Falsches Passwort!';
    }
}

if (isset($_GET['logout'])) {
	unset($_SESSION['authenticated']);
	header('Location: ratings-admin.php');
	exit;
}

$isAuthenticated = isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;

if (!$isAuthenticated) {
	// Login-Formular anzeigen
	?>
<!DOCTYPE html>
<html lang="de">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Login – Rating Admin</title>
	<link rel="icon" type="image/svg+xml" href="../assets/media/favicon.svg" />
	<link rel="stylesheet" href="../assets/css/styles.css" />
	<style>
		body { background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%); }
		.login-box {
			max-width: 450px;
			margin: 8rem auto;
			padding: 2.5rem;
			background: linear-gradient(135deg, rgba(11,15,22,0.95) 0%, rgba(20,20,30,0.95) 100%);
			border: 2px solid rgba(6,255,240,0.3);
			border-radius: 16px;
			backdrop-filter: blur(10px);
		}
	</style>
</head>
<body>
	<div class="login-box">
		<h1 style="text-align: center; margin-bottom: 2rem; background: linear-gradient(135deg, #06FFF0 0%, #8B5CF6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">⭐ Rating Admin</h1>
		<?php if (isset($loginError)): ?>
			<div style="padding: 1rem; margin-bottom: 1.5rem; background: rgba(255,0,110,0.2); border: 2px solid rgba(255,0,110,0.4); border-radius: 10px; color: #FF006E; text-align: center;">
				<?= htmlspecialchars($loginError) ?>
			</div>
		<?php endif; ?>
		<form method="post">
			<input name="password" type="password" placeholder="Passwort" required autofocus style="width: 100%; padding: 1rem; margin-bottom: 1.5rem; background: rgba(11,15,22,0.9); border: 2px solid rgba(6,255,240,0.3); border-radius: 10px; color: white; font-size: 1rem;">
			<button class="btn btn--neon" type="submit" style="width: 100%;">Anmelden</button>
		</form>
		<p class="txt-dim" style="margin-top: 1.5rem; text-align: center;">
			<a href="./index.html" class="nav-link">← Zurück zur Musik</a>
		</p>
	</div>
</body>
</html>
	<?php
	exit;
}

// Ab hier: Authentifiziert
$baseDir = __DIR__;
$tracksJson = $baseDir . DIRECTORY_SEPARATOR . 'tracks.json';

// Tracks laden
$tracks = [];
if (file_exists($tracksJson)) {
    $data = json_decode(@file_get_contents($tracksJson), true);
    if (is_array($data) && isset($data['tracks'])) {
        $tracks = $data['tracks'];
    }
}

function h($s){ return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
?>
<!DOCTYPE html>
<html lang="de">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Rating Verwaltung</title>
	<link rel="icon" type="image/svg+xml" href="../assets/media/favicon.svg" />
	<link rel="stylesheet" href="../assets/css/styles.css" />
	<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
	<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
	<style>
		body { background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%); }
		.admin-container { max-width: 1400px; margin: 0 auto; padding: 2rem; }
		.admin-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 2rem;
			flex-wrap: wrap;
			gap: 1rem;
		}
		.admin-header h1 {
			font-size: 2rem;
			background: linear-gradient(135deg, #06FFF0 0%, #8B5CF6 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
		}
		.stats-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 1.5rem;
			margin-bottom: 2rem;
		}
		.stat-card {
			background: linear-gradient(135deg, rgba(11,15,22,0.9) 0%, rgba(20,20,30,0.9) 100%);
			border: 2px solid rgba(6,255,240,0.2);
			border-radius: 12px;
			padding: 1.5rem;
			text-align: center;
		}
		.stat-card h3 {
			font-size: 2.5rem;
			color: #06FFF0;
			margin: 0 0 0.5rem 0;
		}
		.stat-card p {
			margin: 0;
			opacity: 0.7;
			font-size: 0.9rem;
		}
		.songs-table {
			width: 100%;
			background: linear-gradient(135deg, rgba(11,15,22,0.9) 0%, rgba(20,20,30,0.9) 100%);
			border: 2px solid rgba(6,255,240,0.2);
			border-radius: 12px;
			overflow: hidden;
		}
		.songs-table table {
			width: 100%;
			border-collapse: collapse;
		}
		.songs-table th {
			background: rgba(6,255,240,0.1);
			padding: 1rem;
			text-align: left;
			color: #06FFF0;
			font-weight: 600;
		}
		.songs-table td {
			padding: 1rem;
			border-top: 1px solid rgba(6,255,240,0.1);
		}
		.songs-table tr:hover {
			background: rgba(6,255,240,0.05);
		}
		.rating-details {
			cursor: pointer;
			color: #06FFF0;
			text-decoration: underline;
		}
		.rating-details:hover {
			color: #8B5CF6;
		}
		.log-modal {
			display: none;
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0,0,0,0.8);
			z-index: 1000;
			overflow-y: auto;
			padding: 2rem;
		}
		.log-modal.active {
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.log-content {
			background: linear-gradient(135deg, rgba(11,15,22,0.98) 0%, rgba(20,20,30,0.98) 100%);
			border: 2px solid #06FFF0;
			border-radius: 16px;
			padding: 2rem;
			max-width: 800px;
			width: 100%;
			max-height: 80vh;
			overflow-y: auto;
		}
		.log-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 1.5rem;
		}
		.log-header h2 {
			color: #06FFF0;
			margin: 0;
		}
		.log-close {
			background: rgba(255,0,110,0.2);
			border: 2px solid rgba(255,0,110,0.4);
			color: #FF006E;
			padding: 0.5rem 1rem;
			border-radius: 8px;
			cursor: pointer;
			font-weight: 600;
		}
		.log-close:hover {
			background: rgba(255,0,110,0.3);
		}
		.log-entry {
			background: rgba(6,255,240,0.05);
			border: 1px solid rgba(6,255,240,0.2);
			border-radius: 8px;
			padding: 1rem;
			margin-bottom: 1rem;
		}
		.log-entry-header {
			display: flex;
			justify-content: space-between;
			margin-bottom: 0.5rem;
		}
		.log-stars {
			color: #FFD700;
			font-size: 1.2rem;
		}
		.loading {
			text-align: center;
			padding: 2rem;
			color: #06FFF0;
		}
	</style>
</head>
<body>
	<header class="header">
		<nav class="nav container">
			<a class="nav__logo" href="./manage.php">← Songs verwalten</a>
		</nav>
	</header>
	
	<main class="main" style="padding-top: 6rem;">
		<div class="admin-container">
			<div class="admin-header">
				<h1>⭐ Rating Verwaltung</h1>
				<div style="display: flex; gap: 1rem;">
					<a href="./manage.php" class="btn btn--glass">← Zurück</a>
					<a href="?logout" class="btn btn--glass">Abmelden</a>
				</div>
			</div>

			<div class="stats-grid">
				<div class="stat-card">
					<h3 id="totalRatings">-</h3>
					<p>Bewertungen gesamt</p>
				</div>
				<div class="stat-card">
					<h3 id="avgRating">-</h3>
					<p>Durchschnitt (alle)</p>
				</div>
				<div class="stat-card">
					<h3 id="topRated">-</h3>
					<p>Beste Bewertung</p>
				</div>
				<div class="stat-card">
					<h3 id="ratedSongs">-</h3>
					<p>Bewertete Songs</p>
				</div>
			</div>

			<div class="songs-table">
				<table>
					<thead>
						<tr>
							<th>Song</th>
							<th>Kategorie</th>
							<th>⭐ Durchschnitt</th>
							<th>Anzahl</th>
							<th>Details</th>
						</tr>
					</thead>
					<tbody id="ratingsTable">
						<tr>
							<td colspan="5" class="loading">Lade Bewertungen...</td>
						</tr>
					</tbody>
				</table>
				<div style="margin-top: 1rem; padding: 1rem; background: rgba(6,255,240,0.05); border-radius: 8px; border-left: 3px solid #06FFF0;">
					<p style="margin: 0; opacity: 0.8; font-size: 0.9rem;">
						💡 <strong>Hinweis:</strong> Detaillierte Rating-Logs werden erst seit dem letzten Update gespeichert. 
						Songs ohne "Details"-Daten haben noch keine neuen Bewertungen seit dem Update erhalten.
					</p>
				</div>
			</div>
		</div>
	</main>

	<!-- Log Modal -->
	<div class="log-modal" id="logModal">
		<div class="log-content">
			<div class="log-header">
				<h2 id="logTitle">Rating Details</h2>
				<button class="log-close" onclick="closeLogModal()">✕ Schließen</button>
			</div>
			<div id="logEntries">
				<div class="loading">Lade Details...</div>
			</div>
		</div>
	</div>

	<script src="../assets/js/firebase-config.js"></script>
	<script>
		const tracks = <?= json_encode($tracks) ?>;
		const db = window.firebaseDB;

		async function loadRatings() {
			if (!db) {
				console.error('Firebase nicht initialisiert');
				return;
			}

			try {
				const ratingsRef = firebase.database().ref('ratings');
				const snapshot = await ratingsRef.once('value');
				const ratingsData = snapshot.val() || {};

				let totalRatings = 0;
				let totalSum = 0;
				let ratedSongs = 0;
				let topRating = 0;
				let topSongTitle = '';

				const tableBody = document.getElementById('ratingsTable');
				tableBody.innerHTML = '';

				// Track-Map für schnellen Zugriff
				const trackMap = {};
				tracks.forEach(t => trackMap[t.id] = t);

				// Sortiere nach Anzahl Bewertungen
				const sortedRatings = Object.entries(ratingsData)
					.map(([songId, data]) => ({ songId, ...data }))
					.sort((a, b) => b.count - a.count);

				sortedRatings.forEach(({ songId, total, count }) => {
					const track = trackMap[songId];
					if (!track) return;

					const average = (total / count).toFixed(1);
					totalRatings += count;
					totalSum += total;
					ratedSongs++;

					if (parseFloat(average) > topRating) {
						topRating = parseFloat(average);
						topSongTitle = track.title;
					}

					const row = document.createElement('tr');
					row.innerHTML = `
						<td><strong>${track.title}</strong></td>
						<td>${track.category || 'gemischt'}</td>
						<td><span style="color: #FFD700;">⭐ ${average}</span></td>
						<td>${count}</td>
						<td><span class="rating-details" onclick="showLogs('${songId}', '${track.title}')">📊 Details</span></td>
					`;
					tableBody.appendChild(row);
				});

				// Statistiken aktualisieren
				document.getElementById('totalRatings').textContent = totalRatings;
				document.getElementById('avgRating').textContent = totalRatings > 0 ? (totalSum / totalRatings).toFixed(1) : '0.0';
				document.getElementById('topRated').textContent = topRating > 0 ? `${topRating} (${topSongTitle})` : '-';
				document.getElementById('ratedSongs').textContent = `${ratedSongs} / ${tracks.length}`;

				if (sortedRatings.length === 0) {
					tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; opacity: 0.6;">Noch keine Bewertungen vorhanden.</td></tr>';
				}

			} catch (error) {
				console.error('Fehler beim Laden der Ratings:', error);
				document.getElementById('ratingsTable').innerHTML = '<tr><td colspan="5" style="text-align: center; color: #FF006E;">Fehler beim Laden der Daten.</td></tr>';
			}
		}

		async function showLogs(songId, songTitle) {
			const modal = document.getElementById('logModal');
			const logTitle = document.getElementById('logTitle');
			const logEntries = document.getElementById('logEntries');

			modal.classList.add('active');
			logTitle.textContent = `📊 ${songTitle}`;
			logEntries.innerHTML = '<div class="loading">Lade Details...</div>';

			try {
				// Nutze ratings/{songId}/count statt rating_logs für Admin-Zugriff
				const ratingsRef = firebase.database().ref(`ratings/${songId}`);
				const snapshot = await ratingsRef.once('value');
				const ratingData = snapshot.val();

				if (!ratingData || !ratingData.count) {
					logEntries.innerHTML = `
						<div style="text-align: center; padding: 2rem;">
							<div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
							<p style="opacity: 0.8; font-size: 1.1rem; margin-bottom: 0.5rem;">Noch keine Bewertungen vorhanden</p>
							<p style="opacity: 0.5; font-size: 0.9rem;">
								Sobald Nutzer diesen Song bewerten, erscheinen hier die Statistiken.
							</p>
						</div>
					`;
					return;
				}

				// Zeige verfügbare Statistiken
				const average = (ratingData.sum / ratingData.count).toFixed(1);
				const totalCount = ratingData.count;
				
				logEntries.innerHTML = `
					<div style="background: rgba(6,255,240,0.05); border: 1px solid rgba(6,255,240,0.2); border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
						<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
							<div style="text-align: center;">
								<div style="font-size: 2rem; color: #FFD700; margin-bottom: 0.5rem;">⭐</div>
								<div style="font-size: 2rem; font-weight: 600; color: #06FFF0;">${average}</div>
								<div style="opacity: 0.7; font-size: 0.9rem;">Durchschnitt</div>
							</div>
							<div style="text-align: center;">
								<div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
								<div style="font-size: 2rem; font-weight: 600; color: #06FFF0;">${totalCount}</div>
								<div style="opacity: 0.7; font-size: 0.9rem;">Bewertungen</div>
							</div>
							<div style="text-align: center;">
								<div style="font-size: 2rem; margin-bottom: 0.5rem;">📈</div>
								<div style="font-size: 2rem; font-weight: 600; color: #06FFF0;">${ratingData.sum}</div>
								<div style="opacity: 0.7; font-size: 0.9rem;">Gesamt Punkte</div>
							</div>
						</div>
					</div>
					<div style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.3); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
						<div style="opacity: 0.8; font-size: 0.9rem; text-align: center;">
							ℹ️ Detaillierte Logs (Zeitstempel, Session-IDs) sind nur über die Firebase Console verfügbar.<br>
							Hier werden die wichtigsten Statistiken angezeigt.
						</div>
					</div>
				`;

				return;

				// FALLBACK: Falls rating_logs doch verfügbar sind (nach Firebase Rules Update)
				const logsRef = firebase.database().ref(`rating_logs/${songId}`);
				const logsSnapshot = await logsRef.once('value');
				const logs = logsSnapshot.val();

				if (!logs || Object.keys(logs).length === 0) {
					logEntries.innerHTML = `
						<div style="text-align: center; padding: 2rem;">
							<div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
							<p style="opacity: 0.8; font-size: 1.1rem; margin-bottom: 0.5rem;">Noch keine detaillierten Logs verfügbar</p>
							<p style="opacity: 0.5; font-size: 0.9rem;">
								Logs werden erst seit dem letzten Update gespeichert.<br>
								Neue Bewertungen werden hier angezeigt.
							</p>
						</div>
					`;
					return;
				}

				const entries = Object.entries(logs)
					.map(([key, data]) => ({ key, ...data }))
					.filter(entry => entry.rating && entry.timestamp) // Filtere ungültige Einträge
					.sort((a, b) => b.timestamp - a.timestamp);

				if (entries.length === 0) {
					logEntries.innerHTML = `
						<div style="text-align: center; padding: 2rem; opacity: 0.6;">
							<p>Keine gültigen Log-Einträge gefunden.</p>
						</div>
					`;
					return;
				}

				logEntries.innerHTML = '';

				entries.forEach(entry => {
					const date = new Date(entry.timestamp);
					const stars = '⭐'.repeat(entry.rating);
					const userAgentShort = (entry.userAgent || 'Unbekannt').substring(0, 80);
					
					const div = document.createElement('div');
					div.className = 'log-entry';
					div.innerHTML = `
						<div class="log-entry-header">
							<span class="log-stars">${stars} (${entry.rating}/5)</span>
							<span style="opacity: 0.7;">${date.toLocaleDateString('de-DE')} ${date.toLocaleTimeString('de-DE')}</span>
						</div>
						<div style="font-size: 0.85rem; opacity: 0.6; margin-top: 0.5rem;">
							<div>Session: <code style="background: rgba(6,255,240,0.1); padding: 2px 6px; border-radius: 4px;">${entry.sessionId || 'unbekannt'}</code></div>
							<div style="margin-top: 0.25rem;">Browser: ${userAgentShort}${userAgentShort.length >= 80 ? '...' : ''}</div>
						</div>
					`;
					logEntries.appendChild(div);
				});

				// Zeige Gesamtanzahl
				const totalDiv = document.createElement('div');
				totalDiv.style.cssText = 'text-align: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(6,255,240,0.2); opacity: 0.7;';
				totalDiv.textContent = `Gesamt: ${entries.length} Bewertung${entries.length !== 1 ? 'en' : ''}`;
				logEntries.appendChild(totalDiv);

			} catch (error) {
				console.error('Fehler beim Laden der Logs:', error);
				logEntries.innerHTML = `
					<div style="text-align: center; padding: 2rem;">
						<div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">⚠️</div>
						<p style="color: #FF006E; margin-bottom: 0.5rem;">Fehler beim Laden der Details</p>
						<p style="opacity: 0.5; font-size: 0.9rem;">${error.message || 'Unbekannter Fehler'}</p>
					</div>
				`;
			}
		}

		function closeLogModal() {
			document.getElementById('logModal').classList.remove('active');
		}

		// Modal bei Klick außerhalb schließen
		document.getElementById('logModal').addEventListener('click', (e) => {
			if (e.target.id === 'logModal') {
				closeLogModal();
			}
		});

		// Lade Ratings beim Start
		if (db) {
			loadRatings();
		} else {
			setTimeout(() => {
				if (window.firebaseDB) {
					loadRatings();
				}
			}, 1000);
		}
	</script>
</body>
</html>
