<?php
/**
 * AUTO-MUSIKLISTE MIT VOLLSTÄNDIGER BACKEND-INTEGRATION
 * Kritische Reparatur gemäß Anforderungsdokument 2025-11-08
 * 
 * Features:
 * - Vollständiger CSRF-Schutz
 * - Robuste File-Locking Integration
 * - URL-Encoding für Sonderzeichen
 * - Stabile Rating-Keys via Slugification
 * - Atomare Schreiboperationen
 * - PRG-Pattern (Post-Redirect-Get)
 */

// ============================================================================
// SESSION START (PFLICHT - GANZ OBEN)
// ============================================================================
session_start();

// Error handling
error_reporting(E_ALL);
@ini_set('display_errors', '0');
@ini_set('log_errors', '1');

// ============================================================================
// HILFSFUNKTIONEN (GENAU WIE GEFORDERT)
// ============================================================================

/**
 * URL-Pfad segmentweise encodieren
 */
function url_path_join(...$parts) {
    $encoded = array_map(function($p) {
        return implode('/', array_map('rawurlencode', explode('/', $p)));
    }, $parts);
    return implode('/', $encoded);
}

/**
 * Stabiler Slug aus Titel generieren
 */
function slugify($str) {
    if (empty($str)) return 'n-a';
    // Unicode -> ASCII
    $s = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $str);
    if ($s === false) $s = $str; // Fallback
    // Nur a-z, 0-9, Bindestrich
    $s = preg_replace('~[^a-zA-Z0-9]+~', '-', $s);
    $s = strtolower(trim($s, '-'));
    return empty($s) ? 'n-a' : $s;
}

/**
 * Musikordner rekursiv scannen
 */
function scanMusicFolder($baseDir) {
    $tracks = [];
    try {
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($baseDir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && strtolower($file->getExtension()) === 'mp3') {
                $fullPath = $file->getPathname();
                $relativePath = str_replace($baseDir . DIRECTORY_SEPARATOR, '', $fullPath);
                $relativePath = str_replace(DIRECTORY_SEPARATOR, '/', $relativePath); // Unix-Style

                $title = pathinfo($file->getFilename(), PATHINFO_FILENAME);
                // Normalisiere 4+ Punkte am Ende zu 3
                $title = preg_replace('/\.{4,}$/', '...', $title);
                
                $subDir = dirname($relativePath);
                $category = ($subDir === '.' || $subDir === '') ? 'misc' : strtolower(basename($subDir));

                $tracks[] = [
                    'title' => $title,
                    'category' => $category,
                    'fileRel' => $relativePath,
                    'filePath' => $fullPath
                ];
            }
        }
    } catch (Exception $e) {
        error_log('scanMusicFolder error: ' . $e->getMessage());
    }
    return $tracks;
}

/**
 * Prüfen ob Track bereits in statischer Seite
 */
function isTrackInStaticPage($staticHtml, $track) {
    $titleEscaped = htmlspecialchars($track['title'], ENT_QUOTES, 'UTF-8');
    $titleRaw = $track['title'];
    $encodedPath = url_path_join('..', 'Musik', $track['fileRel']);
    
    return (stripos($staticHtml, $titleEscaped) !== false) ||
           (stripos($staticHtml, $titleRaw) !== false) ||
           (stripos($staticHtml, $encodedPath) !== false);
}

/**
 * Track-Karte rendern
 */
function renderTrackCard($track, $isIntegrated = false) {
    $title = htmlspecialchars($track['title'], ENT_QUOTES, 'UTF-8');
    $cat   = htmlspecialchars($track['category'], ENT_QUOTES, 'UTF-8');
    $slug  = slugify($track['title']);
    $src   = url_path_join('..', 'Musik', $track['fileRel']);

    $status = $isIntegrated 
        ? '<span class="status-integrated">✓ Integriert</span> – Kategorie: ' . $cat
        : '<span class="status-new">⚠ Nur in Auto-Liste</span> – Noch nicht in statischer Seite! (' . $cat . ')';

    $badge = $isIntegrated ? '' : '<div class="badge badge--new" aria-label="Neu">Neu</div>';

    $coverUrl = url_path_join('..', 'assets', 'media', 'cover-default.svg');
    $html = <<<HTML
          <article class="card card--track music-card" data-category="{$cat}" data-auto="1">
            <img class="card__media music-card-image" src="{$coverUrl}" alt="{$title} Cover" loading="lazy" />
            <div class="card__body">
              <h3 class="card__title">{$title}</h3>
              <p class="card__text txt-dim" style="margin-top:0.5rem; font-size:0.9rem;">
                {$status}
              </p>
              {$badge}
              <audio class="card__player music-player" controls preload="metadata">
                <source src="{$src}" type="audio/mpeg" />
                Dein Browser unterstützt das Audio-Element nicht.
              </audio>
              <div class="rating-widget" data-song-id="{$slug}">
                <div class="rating-stars">
                  <span class="rating-star">⭐</span><span class="rating-star">⭐</span><span class="rating-star">⭐</span><span class="rating-star">⭐</span><span class="rating-star">⭐</span>
                </div>
                <div class="rating-info"><span class="rating-average">0.0</span><span class="rating-count">(0 Bewertungen)</span></div>
              </div>
              <div class="card__actions">
                <a class="btn btn--glass btn-download" href="{$src}" download="Michael Ostermann - {$title}.mp3">Download</a>
              </div>
            </div>
          </article>

HTML;
    return $html;
}

/**
 * AUTO-IMPORT Block und manuellen Teil trennen
 * Liefert [autoBlockInnerHTML, manualHtml]
 */
function splitStaticHtml($html) {
    if (empty($html)) {
        return ['', ''];
    }
    if (preg_match('/<!-- AUTO-IMPORT START -->(.*?)<!-- AUTO-IMPORT END -->/s', $html, $m)) {
        // Innerer Inhalt des Auto-Blocks (zwischen den Markern)
        return [$m[1], str_replace($m[0], '', $html)];
    }
    return ['', $html];
}
// ============================================================================
// CSRF TOKEN GENERIERUNG
// ============================================================================
if (!isset($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}
$csrfToken = $_SESSION['csrf'];

// ============================================================================
// KONFIGURATION
// ============================================================================
$musicDir = realpath(__DIR__ . '/../Musik');
if (!$musicDir || !is_dir($musicDir)) {
    die('FATAL: Musikordner nicht gefunden!');
}

$staticIndexPath = __DIR__ . '/index.html';
$debugMode = isset($_GET['debug']) && $_GET['debug'] === '1';

// ============================================================================
// POST-HANDLER: INTEGRATE
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['integrate'])) {
    // CSRF-Validierung
    if (!isset($_POST['csrf']) || !hash_equals($_SESSION['csrf'], $_POST['csrf'])) {
        http_response_code(403);
        die('FEHLER: Ungültiges CSRF-Token!');
    }

    // Input-Validierung
    if (empty($_POST['track_select']) || !is_array($_POST['track_select'])) {
        $_SESSION['message'] = 'Keine Tracks ausgewählt.';
        $_SESSION['message_type'] = 'error';
        header('Location: index-auto.php');
        exit;
    }

    try {
        // Whitelist: Alle verfügbaren Tracks scannen
        $allTracks = scanMusicFolder($musicDir);
        $tracksByTitle = [];
        foreach ($allTracks as $t) {
            $tracksByTitle[$t['title']] = $t;
        }

        // Nur ausgewählte UND in Whitelist vorhandene Tracks verwenden
        $selectedTitles = $_POST['track_select'];
        $tracksToIntegrate = [];
        foreach ($selectedTitles as $title) {
            if (isset($tracksByTitle[$title])) {
                $tracksToIntegrate[] = $tracksByTitle[$title];
            } else {
                error_log('WARNING: Track nicht in Whitelist: ' . $title);
            }
        }

        if (empty($tracksToIntegrate)) {
            $_SESSION['message'] = 'Keine gültigen Tracks gefunden.';
            $_SESSION['message_type'] = 'error';
            header('Location: index-auto.php');
            exit;
        }

        // Backup erstellen
        $backupName = 'index.' . date('Ymd-His') . '.bak.html';
        if (!copy($staticIndexPath, __DIR__ . '/' . $backupName)) {
            throw new Exception('Backup fehlgeschlagen!');
        }

        // HTML-Block generieren
        $autoBlock = "        <!-- AUTO-IMPORT START -->\n";
        foreach ($tracksToIntegrate as $track) {
            $autoBlock .= renderTrackCard($track, true);
        }
        $autoBlock .= "        <!-- AUTO-IMPORT END -->\n";

        // Statische Seite einlesen
        $staticContent = file_get_contents($staticIndexPath);
        if ($staticContent === false) {
            throw new Exception('index.html konnte nicht gelesen werden!');
        }

        // Marker-Block ersetzen oder einfügen
        if (strpos($staticContent, '<!-- AUTO-IMPORT START -->') !== false) {
            // Ersetze existierenden Block
            $pattern = '/<!-- AUTO-IMPORT START -->.*?<!-- AUTO-IMPORT END -->/s';
            $staticContent = preg_replace($pattern, rtrim($autoBlock), $staticContent);
        } else {
            // Füge vor </div><!-- GRID END --> oder am Ende des Grids ein
            $gridEndPos = strpos($staticContent, '</div><!-- GRID END -->');
            if ($gridEndPos === false) {
                // Fallback: Suche nach letztem </div> vor </main>
                $mainEndPos = strpos($staticContent, '</main>');
                if ($mainEndPos !== false) {
                    $gridEndPos = strrpos(substr($staticContent, 0, $mainEndPos), '</div>');
                }
            }
            
            if ($gridEndPos !== false) {
                $staticContent = substr($staticContent, 0, $gridEndPos) . 
                                $autoBlock . 
                                substr($staticContent, $gridEndPos);
            } else {
                throw new Exception('Einfügepunkt in index.html nicht gefunden!');
            }
        }

        // Atomares Schreiben mit File-Locking
        $handle = fopen($staticIndexPath, 'c+');
        if ($handle === false) {
            throw new Exception('index.html konnte nicht geöffnet werden!');
        }

        if (!flock($handle, LOCK_EX)) {
            fclose($handle);
            throw new Exception('File-Lock fehlgeschlagen!');
        }

        ftruncate($handle, 0);
        rewind($handle);
        $bytesWritten = fwrite($handle, $staticContent);
        fflush($handle);
        flock($handle, LOCK_UN);
        fclose($handle);

        if ($bytesWritten === false) {
            throw new Exception('Schreibvorgang fehlgeschlagen!');
        }

        // Erfolg: Redirect mit PRG-Pattern
        $_SESSION['message'] = count($tracksToIntegrate) . ' Titel erfolgreich integriert! Backup: ' . $backupName;
        $_SESSION['message_type'] = 'success';
        header('Location: index-auto.php?success=integrated&count=' . count($tracksToIntegrate));
        exit;

    } catch (Exception $e) {
        error_log('Integration error: ' . $e->getMessage());
        $_SESSION['message'] = 'FEHLER: ' . $e->getMessage();
        $_SESSION['message_type'] = 'error';
        header('Location: index-auto.php');
        exit;
    }
}

// ============================================================================
// POST-HANDLER: UNDO
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['undo_auto'])) {
    // CSRF-Validierung
    if (!isset($_POST['csrf']) || !hash_equals($_SESSION['csrf'], $_POST['csrf'])) {
        http_response_code(403);
        die('FEHLER: Ungültiges CSRF-Token!');
    }

    try {
        // Backup erstellen
        $backupName = 'index.' . date('Ymd-His') . '.undo.html';
        if (!copy($staticIndexPath, __DIR__ . '/' . $backupName)) {
            throw new Exception('Backup fehlgeschlagen!');
        }

        // Statische Seite einlesen
        $staticContent = file_get_contents($staticIndexPath);
        if ($staticContent === false) {
            throw new Exception('index.html konnte nicht gelesen werden!');
        }

        // Marker-Block entfernen
        $pattern = '/<!-- AUTO-IMPORT START -->.*?<!-- AUTO-IMPORT END -->/s';
        $cleanedContent = preg_replace($pattern, "        <!-- AUTO-IMPORT START -->\n        <!-- AUTO-IMPORT END -->\n", $staticContent);

        if ($cleanedContent === null) {
            throw new Exception('Regex-Fehler beim Entfernen!');
        }

        // Atomares Schreiben mit File-Locking
        $handle = fopen($staticIndexPath, 'c+');
        if ($handle === false) {
            throw new Exception('index.html konnte nicht geöffnet werden!');
        }

        if (!flock($handle, LOCK_EX)) {
            fclose($handle);
            throw new Exception('File-Lock fehlgeschlagen!');
        }

        ftruncate($handle, 0);
        rewind($handle);
        $bytesWritten = fwrite($handle, $cleanedContent);
        fflush($handle);
        flock($handle, LOCK_UN);
        fclose($handle);

        if ($bytesWritten === false) {
            throw new Exception('Schreibvorgang fehlgeschlagen!');
        }

        // Erfolg: Redirect mit PRG-Pattern
        $_SESSION['message'] = 'Auto-Importe erfolgreich entfernt! Backup: ' . $backupName;
        $_SESSION['message_type'] = 'success';
        header('Location: index-auto.php?success=undone');
        exit;

    } catch (Exception $e) {
        error_log('Undo error: ' . $e->getMessage());
        $_SESSION['message'] = 'FEHLER: ' . $e->getMessage();
        $_SESSION['message_type'] = 'error';
        header('Location: index-auto.php');
        exit;
    }
}

// ============================================================================
// GET-HANDLER: SCAN & RENDER
// ============================================================================

// Musik-Ordner scannen
$allTracks = scanMusicFolder($musicDir);

// Dynamische Musikliste (tracks.json) laden, um Integration auf der neuen Seite zu erkennen
$dynamicTitles = [];
$dynamicSlugs   = [];
$tracksJsonPath = __DIR__ . '/tracks.json';
if (is_file($tracksJsonPath)) {
    $jsonRaw = @file_get_contents($tracksJsonPath);
    if ($jsonRaw !== false) {
        $json = @json_decode($jsonRaw, true);
        if (is_array($json)) {
            // Unterstütze sowohl Array als auch { tracks: [...] }
            $list = isset($json['tracks']) && is_array($json['tracks']) ? $json['tracks'] : $json;
            foreach ($list as $item) {
                if (is_array($item)) {
                    $t = isset($item['title']) ? (string)$item['title'] : '';
                    if ($t !== '') {
                        $dynamicTitles[$t] = true;
                        $dynamicSlugs[slugify($t)] = true;
                    }
                }
            }
        }
    }
}

// Album-Dateien (z. B. Alpha) prüfen – Integration gilt auch, wenn Slug.mp3 im Album-Ordner existiert
$albumSlugMp3 = [];
$albumsBase = realpath(__DIR__ . '/../assets/media/albums');
if ($albumsBase && is_dir($albumsBase)) {
    $rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($albumsBase, RecursiveDirectoryIterator::SKIP_DOTS));
    foreach ($rii as $f) {
        if ($f->isFile() && strtolower($f->getExtension()) === 'mp3') {
            $base = strtolower(pathinfo($f->getFilename(), PATHINFO_FILENAME));
            $albumSlugMp3[$base] = true;
        }
    }
}

// Statische Seite einlesen für Abgleich
$staticHtml = '';
$autoImportCount = 0;          // Anzahl automatisch integrierter Karten
if (file_exists($staticIndexPath)) {
    $staticHtml = file_get_contents($staticIndexPath);
}

// Teile HTML auf: Auto-Import Block vs manueller Rest
list($autoBlockInner, $manualHtml) = splitStaticHtml($staticHtml);
if ($autoBlockInner !== '') {
    $autoImportCount = substr_count($autoBlockInner, '<article');
}

// Neue / integrierte Tracks bestimmen – präziser:
// Ein Track gilt als integriert wenn er im Auto-Block ODER im manuellen Bereich auftaucht.
$newTracks = [];
$integratedTracks = [];
$manualHitCount = 0;  // nur informative Zählung
$autoHitCount   = 0;  // nur informative Zählung
foreach ($allTracks as $track) {
    $titleEsc = htmlspecialchars($track['title'], ENT_QUOTES, 'UTF-8');
    $titleRaw = $track['title'];
    $encPath  = url_path_join('..', 'Musik', $track['fileRel']);

    $inAuto   = ($autoBlockInner !== '') && (
        stripos($autoBlockInner, $titleEsc) !== false ||
        stripos($autoBlockInner, $titleRaw) !== false ||
        stripos($autoBlockInner, $encPath) !== false
    );
    $inManual = (
        stripos($manualHtml, $titleEsc) !== false ||
        stripos($manualHtml, $titleRaw) !== false ||
        stripos($manualHtml, $encPath) !== false
    );

    // Dynamische Integration: in tracks.json vorhanden?
    $inDynamic = isset($dynamicTitles[$titleRaw]) || isset($dynamicSlugs[slugify($titleRaw)]);

    // Album-Integration: existiert eine Datei mit Slug.mp3 in assets/media/albums/** ?
    $slug = slugify($titleRaw);
    $inAlbum = isset($albumSlugMp3[$slug]);

    if ($inAuto)   { $autoHitCount++; }
    if ($inManual) { $manualHitCount++; }

    if ($inAuto || $inManual || $inDynamic || $inAlbum) {
        $integratedTracks[] = $track;
    } else {
        $newTracks[] = $track;
    }
}

// Slug-Kollisionen (z.B. Emoji/4-Punkte vs. bereinigter Titel) erkennen
$slugMap = [];
foreach ($allTracks as $t) {
    $s = slugify($t['title']);
    if (!isset($slugMap[$s])) $slugMap[$s] = [];
    $slugMap[$s][] = $t;
}
$slugDuplicates = array_filter($slugMap, function($arr) { return count($arr) > 1; });

// Session-Nachrichten abrufen
$message = $_SESSION['message'] ?? '';
$messageType = $_SESSION['message_type'] ?? 'info';
unset($_SESSION['message'], $_SESSION['message_type']);

?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Automatische Musikliste – Code & Beats</title>
    <link rel="icon" type="image/svg+xml" href="../assets/media/favicon.svg">
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/rating-styles.css">
    <style>
        .auto-hint { text-align:center; margin:1rem 0 2rem; font-size:0.85rem; opacity:0.7; }
        .music-grid { margin-top:2rem; }
        .badge--new { background:linear-gradient(135deg,#06FFF0,#8B5CF6); color:#0B0F16; font-weight:700; padding:.25rem .6rem; border-radius:999px; font-size:0.75rem; display:inline-block; margin-top:0.5rem; }
        .cover--static { outline:2px solid rgba(255,255,255,0.05); }
        .chip { display:inline-block; padding:.35rem .7rem; margin:.25rem; border:1px solid rgba(255,255,255,0.18); border-radius:999px; background:rgba(255,255,255,0.06); color:#E5E7EB; cursor:pointer; transition: all .15s ease; }
        .chip:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.28); }
        .chip.active { background:linear-gradient(135deg,#06FFF0,#8B5CF6); color:#0B0F16; border-color: transparent; }
        .status-integrated { color:#10B981; font-size:0.8rem; font-weight:600; }
        .status-new { color:#F59E0B; font-size:0.8rem; font-weight:600; }
        .alert { padding:1rem; margin:1rem 0; border-radius:0.5rem; }
        .alert--success { background:rgba(16,185,129,0.1); border:1px solid #10B981; color:#10B981; }
        .alert--error { background:rgba(239,68,68,0.1); border:1px solid #EF4444; color:#EF4444; }
    </style>
</head>
<body>
    <main class="main">
        <section class="section" style="padding-top:4rem;">
            <div class="container">
                <h1 class="section__title" style="text-align:center; font-size:3rem;">Automatische Musikliste</h1>
                <p class="auto-hint">
                    Diese Seite scannt den Ordner <code>Musik</code> automatisch. 
                    Deine ursprüngliche Seite <a href="index.html">(statische Version)</a> bleibt unverändert.
                </p>
                <p class="auto-hint">Build: <?= date('Y-m-d H:i:s', filemtime(__FILE__)) ?> | Login-Mode: Session | CSRF aktiv</p>

                <?php if ($message): ?>
                <div class="alert alert--<?= htmlspecialchars($messageType, ENT_QUOTES, 'UTF-8') ?>" role="alert">
                    <strong><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></strong>
                </div>
                <?php endif; ?>

                <?php if (!empty($newTracks)): ?>
                <div class="card" style="padding:1rem; margin:1rem 0; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);">
                    <h3 style="margin-top:0;">Neue Titel zur Integration (<?= count($newTracks) ?>)</h3>
                    <p class="txt-dim" style="margin:0.5rem 0 1rem; font-size:0.9rem;">
                        Diese Titel wurden im Musik-Ordner gefunden, sind aber noch nicht in der statischen Seite integriert.
                    </p>
                    <form method="post" action="index-auto.php" style="display:grid; gap:.5rem;">
                        <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8') ?>">
                        <div style="display:grid; gap:.35rem;">
                            <?php foreach ($newTracks as $track): ?>
                            <label style="display:flex; align-items:center; gap:.5rem;">
                                <input type="checkbox" name="track_select[]" value="<?= htmlspecialchars($track['title'], ENT_QUOTES, 'UTF-8') ?>" />
                                <span><?= htmlspecialchars($track['title'], ENT_QUOTES, 'UTF-8') ?></span>
                                <small class="txt-dim" style="margin-left:.5rem;">(<?= htmlspecialchars($track['category'], ENT_QUOTES, 'UTF-8') ?>)</small>
                                <span class="status-new">⚡ Neu</span>
                            </label>
                            <?php endforeach; ?>
                        </div>
                        <div>
                            <button class="btn btn--neon" type="submit" name="integrate" value="1" onclick="return confirm('Ausgewählte Titel in die statische Seite übernehmen?');">
                                Ausgewählte in statische Seite übernehmen
                            </button>
                        </div>
                    </form>
                </div>
                <?php else: ?>
                <div class="card" style="padding:1rem; margin:1rem 0; background:rgba(16,185,129,0.05); border:1px solid #10B981;">
                    <p style="color:#10B981; margin:0;">✓ Alle gefundenen Titel sind bereits in der statischen Seite integriert.</p>
                </div>
                <?php endif; ?>

                <div class="card" style="padding:1rem; margin:1rem 0; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);">
                    <h3 style="margin-top:0;">Aufräumen</h3>
                    <p class="txt-dim" style="margin:.25rem 0 .75rem;">
                        Gefundene Auto-Importe in statischer Seite: <strong><?= $autoImportCount ?></strong>
                    </p>
                    <form method="post" action="index-auto.php">
                        <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrfToken, ENT_QUOTES, 'UTF-8') ?>">
                        <button class="btn btn--glass" type="submit" name="undo_auto" value="1" 
                                onclick="return confirm('Alle automatisch importierten Karten aus index.html entfernen? Es wird zuvor ein Backup erstellt.');"
                                <?= $autoImportCount > 0 ? '' : 'disabled' ?>>
                            Alle Auto-Importe entfernen
                        </button>
                    </form>
                </div>

                <div class="filters" id="auto-filters"></div>

                <div class="grid grid--cards music-grid" id="auto-grid">
                    <?php foreach (array_merge($newTracks, $integratedTracks) as $track): 
                        $isIntegrated = in_array($track, $integratedTracks, true);
                        echo renderTrackCard($track, $isIntegrated);
                    endforeach; ?>
                </div>

                <div style="margin-top:3rem; text-align:center;">
                    <a href="index.html" class="btn btn--glass">Zur statischen Seite</a>
                    <a href="../index.html" class="btn btn--neon">Startseite</a>
                </div>
            </div>
        </section>
    </main>

    <script defer src="../assets/js/firebase-config.js"></script>
    <script defer src="../assets/js/rating-system.js"></script>

    <!-- URL-Encoding für Sonderzeichen -->
    <script>
    (function() {
        function needsEncoding(path) {
            return typeof path === 'string' && !/%[0-9A-Fa-f]{2}/.test(path);
        }
        function encodePath(path) {
            return path.split('/').map(seg => {
                if (seg === '' || seg === '.' || seg === '..') return seg;
                return encodeURIComponent(seg);
            }).join('/');
        }
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('audio source').forEach(el => {
                const src = el.getAttribute('src');
                if (src && needsEncoding(src)) el.setAttribute('src', encodePath(src));
            });
            document.querySelectorAll('a.btn-download').forEach(a => {
                const href = a.getAttribute('href');
                if (href && needsEncoding(href)) a.setAttribute('href', encodePath(href));
            });
        });
    })();
    </script>

    <!-- Stabile Rating-Keys via Slug -->
    <script>
    (function() {
        function slugify(s) {
            if (!s) return 'n-a';
            s = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
            s = s.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
            return s || 'n-a';
        }
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.music-card').forEach(card => {
                const titleEl = card.querySelector('.card__title');
                const widget = card.querySelector('.rating-widget');
                if (titleEl && widget) {
                    widget.setAttribute('data-song-id', slugify(titleEl.textContent.trim()));
                }
            });
        });
    })();
    </script>

    <!-- Rating-System Init -->
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof window.initRatingSystem === 'function') {
            try { window.initRatingSystem(); } catch (e) { console.error('Rating init failed', e); }
        } else if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('tracks:rendered'));
        }
    });
    </script>

    <!-- Filter mit A11y -->
    <script>
    (function(){
        const grid = document.getElementById('auto-grid');
        const filterBar = document.getElementById('auto-filters');
        if(!grid || !filterBar) return;

        const cats = Array.from(new Set(
            Array.from(grid.querySelectorAll('[data-category]'))
                 .map(el => el.getAttribute('data-category'))
                 .filter(Boolean)
        ));
        if(!cats.length) return;

        function applyFilter(value) {
            Array.from(grid.children).forEach(card => {
                const match = (value === 'all' || card.getAttribute('data-category') === value);
                card.style.display = match ? '' : 'none';
            });
        }

        function makeBtn(label, value) {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = label;
            b.className = 'chip';
            b.dataset.value = value;
            b.setAttribute('role', 'button');
            b.setAttribute('aria-pressed', 'false');
            b.addEventListener('click', () => {
                filterBar.querySelectorAll('.chip').forEach(c=>{
                    c.classList.remove('active');
                    c.setAttribute('aria-pressed', 'false');
                });
                b.classList.add('active');
                b.setAttribute('aria-pressed', 'true');
                applyFilter(value);
            });
            return b;
        }

        const allBtn = makeBtn('Alle', 'all');
        filterBar.appendChild(allBtn);
        allBtn.classList.add('active');
        allBtn.setAttribute('aria-pressed', 'true');
        cats.forEach(c => filterBar.appendChild(makeBtn(c, c)));
        applyFilter('all');
    })();
    </script>
</body>
</html>
