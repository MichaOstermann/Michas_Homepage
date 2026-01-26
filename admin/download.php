<?php
// ═════════════════════════════════════════════════════════════
// DOWNLOAD GATEWAY - MIT ZEITLIMIT & RATE LIMITING
// © 2025 Michael Ostermann
// SICHERHEIT: Rate Limiting, Header Injection Protection, Security Headers
// ═════════════════════════════════════════════════════════════

// SECURITY HEADERS
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Robots-Tag: noindex, nofollow');

// RATE LIMITING CONFIG
$rate_limit_file = __DIR__ . '/download_rate_limit.json';
$max_downloads_per_hour = 10; // Max 10 Downloads pro IP pro Stunde
$rate_limit_window = 3600; // 1 Stunde

// ═════════════════════════════════════════════════════════════
// RATE LIMITING PRÜFUNG
// ═════════════════════════════════════════════════════════════
function checkDownloadRateLimit() {
    global $rate_limit_file, $max_downloads_per_hour, $rate_limit_window;
    
    $downloads = [];
    if (file_exists($rate_limit_file)) {
        $downloads = json_decode(file_get_contents($rate_limit_file), true) ?: [];
    }
    
    $client_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $current_time = time();
    
    // Bereinige alte Einträge (älter als 1 Stunde)
    $downloads = array_filter($downloads, function($download) use ($current_time, $rate_limit_window) {
        return ($current_time - $download['time']) < $rate_limit_window;
    });
    
    // Zähle Downloads für diese IP
    $ip_downloads = array_filter($downloads, function($download) use ($client_ip) {
        return $download['ip'] === $client_ip;
    });
    
    // Prüfe ob Limit erreicht
    if (count($ip_downloads) >= $max_downloads_per_hour) {
        $oldest_download = min(array_column($ip_downloads, 'time'));
        $remaining_time = ceil(($oldest_download + $rate_limit_window - $current_time) / 60);
        
        http_response_code(429);
        die("⚠️ Download-Limit erreicht! Bitte warte $remaining_time Minuten.<br><br>Max. $max_downloads_per_hour Downloads pro Stunde.");
    }
    
    return $downloads;
}

function registerDownload($template) {
    global $rate_limit_file;
    
    $downloads = [];
    if (file_exists($rate_limit_file)) {
        $downloads = json_decode(file_get_contents($rate_limit_file), true) ?: [];
    }
    
    $client_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $downloads[] = [
        'ip' => $client_ip,
        'time' => time(),
        'template' => basename($template)
    ];
    
    file_put_contents($rate_limit_file, json_encode($downloads));
}

// ═════════════════════════════════════════════════════════════
// RATE LIMITING PRÜFEN
// ═════════════════════════════════════════════════════════════
$downloads_data = checkDownloadRateLimit();

// ═════════════════════════════════════════════════════════════
// INPUT VALIDATION & SECURITY
// ═════════════════════════════════════════════════════════════
$downloadsDir = __DIR__ . '/../downloads/';
$timestampFile = __DIR__ . '/freigabe-timestamps.json';

// Template-Parameter validieren (Directory Traversal Protection)
$template = isset($_GET['file']) ? basename($_GET['file']) : '';

if (!$template) {
    http_response_code(400);
    die('❌ Fehler: Kein Template angegeben.');
}

// Nur .zip Dateien erlauben
if (!preg_match('/\.zip$/i', $template)) {
    http_response_code(400);
    die('❌ Fehler: Ungültiges Dateiformat. Nur .zip erlaubt.');
}

// Zusätzliche Sicherheit: Prüfe auf gefährliche Zeichen
if (preg_match('/[^a-zA-Z0-9._-]/', $template)) {
    http_response_code(400);
    die('❌ Fehler: Ungültige Zeichen im Dateinamen.');
}

$filePath = $downloadsDir . $template;

// ═════════════════════════════════════════════════════════════
// DATEI-EXISTENZ PRÜFEN
// ═════════════════════════════════════════════════════════════
if (!file_exists($filePath)) {
    http_response_code(404);
    die('❌ Template nicht verfügbar oder Freigabe abgelaufen.');
}

// ═════════════════════════════════════════════════════════════
// TIMESTAMP PRÜFEN (12h Limit)
// ═════════════════════════════════════════════════════════════
$timestamps = array();
if (file_exists($timestampFile)) {
    $data = json_decode(file_get_contents($timestampFile), true);
    if ($data) $timestamps = $data;
}

if (!isset($timestamps[$template])) {
    http_response_code(403);
    die('❌ Template nicht freigegeben.');
}

$elapsed = time() - $timestamps[$template];
if ($elapsed > (12 * 3600)) {
    // Automatisch löschen wenn abgelaufen
    @unlink($filePath);
    unset($timestamps[$template]);
    file_put_contents($timestampFile, json_encode($timestamps));
    
    http_response_code(410);
    die('❌ Freigabe ist abgelaufen (12 Stunden überschritten).');
}

// ═════════════════════════════════════════════════════════════
// DOWNLOAD REGISTRIEREN (für Rate Limiting)
// ═════════════════════════════════════════════════════════════
registerDownload($template);

// ═════════════════════════════════════════════════════════════
// SICHERER DATEI-DOWNLOAD
// ═════════════════════════════════════════════════════════════
// Verhindere Header Injection durch Filename-Sanitization
$safe_filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $template);

// Content-Type sicher setzen
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $safe_filename . '"');
header('Content-Length: ' . filesize($filePath));
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Datei sicher ausgeben
readfile($filePath);
exit;
?>

        $oldest_download = min(array_column($ip_downloads, 'time'));
        $remaining_time = ceil(($oldest_download + $rate_limit_window - $current_time) / 60);
        
        http_response_code(429);
        die("⚠️ Download-Limit erreicht! Bitte warte $remaining_time Minuten.<br><br>Max. $max_downloads_per_hour Downloads pro Stunde.");
    }
    
    return $downloads;
}

function registerDownload($template) {
    global $rate_limit_file;
    
    $downloads = [];
    if (file_exists($rate_limit_file)) {
        $downloads = json_decode(file_get_contents($rate_limit_file), true) ?: [];
    }
    
    $client_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $downloads[] = [
        'ip' => $client_ip,
        'time' => time(),
        'template' => basename($template)
    ];
    
    file_put_contents($rate_limit_file, json_encode($downloads));
}

// ═════════════════════════════════════════════════════════════
// RATE LIMITING PRÜFEN
// ═════════════════════════════════════════════════════════════
$downloads_data = checkDownloadRateLimit();

// ═════════════════════════════════════════════════════════════
// INPUT VALIDATION & SECURITY
// ═════════════════════════════════════════════════════════════
$downloadsDir = __DIR__ . '/../downloads/';
$timestampFile = __DIR__ . '/freigabe-timestamps.json';

// Template-Parameter validieren (Directory Traversal Protection)
$template = isset($_GET['file']) ? basename($_GET['file']) : '';

if (!$template) {
    http_response_code(400);
    die('❌ Fehler: Kein Template angegeben.');
}

// Nur .zip Dateien erlauben
if (!preg_match('/\.zip$/i', $template)) {
    http_response_code(400);
    die('❌ Fehler: Ungültiges Dateiformat. Nur .zip erlaubt.');
}

// Zusätzliche Sicherheit: Prüfe auf gefährliche Zeichen
if (preg_match('/[^a-zA-Z0-9._-]/', $template)) {
    http_response_code(400);
    die('❌ Fehler: Ungültige Zeichen im Dateinamen.');
}

$filePath = $downloadsDir . $template;

// ═════════════════════════════════════════════════════════════
// DATEI-EXISTENZ PRÜFEN
// ═════════════════════════════════════════════════════════════
if (!file_exists($filePath)) {
    http_response_code(404);
    die('❌ Template nicht verfügbar oder Freigabe abgelaufen.');
}

// ═════════════════════════════════════════════════════════════
// TIMESTAMP PRÜFEN (12h Limit)
// ═════════════════════════════════════════════════════════════
$timestamps = array();
if (file_exists($timestampFile)) {
    $data = json_decode(file_get_contents($timestampFile), true);
    if ($data) $timestamps = $data;
}

if (!isset($timestamps[$template])) {
    http_response_code(403);
    die('❌ Template nicht freigegeben.');
}

$elapsed = time() - $timestamps[$template];
if ($elapsed > (12 * 3600)) {
    // Automatisch löschen wenn abgelaufen
    @unlink($filePath);
    unset($timestamps[$template]);
    file_put_contents($timestampFile, json_encode($timestamps));
    
    http_response_code(410);
    die('❌ Freigabe ist abgelaufen (12 Stunden überschritten).');
}

// ═════════════════════════════════════════════════════════════
// DOWNLOAD REGISTRIEREN (für Rate Limiting)
// ═════════════════════════════════════════════════════════════
registerDownload($template);

// ═════════════════════════════════════════════════════════════
// SICHERER DATEI-DOWNLOAD
// ═════════════════════════════════════════════════════════════
// Verhindere Header Injection durch Filename-Sanitization
$safe_filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $template);

// Content-Type sicher setzen
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $safe_filename . '"');
header('Content-Length: ' . filesize($filePath));
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Datei sicher ausgeben
readfile($filePath);
exit;
?>

        $oldest_download = min(array_column($ip_downloads, 'time'));
        $remaining_time = ceil(($oldest_download + $rate_limit_window - $current_time) / 60);
        
        http_response_code(429);
        die("⚠️ Download-Limit erreicht! Bitte warte $remaining_time Minuten.<br><br>Max. $max_downloads_per_hour Downloads pro Stunde.");
    }
    
    return $downloads;
}

function registerDownload($template) {
    global $rate_limit_file;
    
    $downloads = [];
    if (file_exists($rate_limit_file)) {
        $downloads = json_decode(file_get_contents($rate_limit_file), true) ?: [];
    }
    
    $client_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $downloads[] = [
        'ip' => $client_ip,
        'time' => time(),
        'template' => basename($template)
    ];
    
    file_put_contents($rate_limit_file, json_encode($downloads));
}

// ═════════════════════════════════════════════════════════════
// RATE LIMITING PRÜFEN
// ═════════════════════════════════════════════════════════════
$downloads_data = checkDownloadRateLimit();

// ═════════════════════════════════════════════════════════════
// INPUT VALIDATION & SECURITY
// ═════════════════════════════════════════════════════════════
$downloadsDir = __DIR__ . '/../downloads/';
$timestampFile = __DIR__ . '/freigabe-timestamps.json';

// Template-Parameter validieren (Directory Traversal Protection)
$template = isset($_GET['file']) ? basename($_GET['file']) : '';

if (!$template) {
    http_response_code(400);
    die('❌ Fehler: Kein Template angegeben.');
}

// Nur .zip Dateien erlauben
if (!preg_match('/\.zip$/i', $template)) {
    http_response_code(400);
    die('❌ Fehler: Ungültiges Dateiformat. Nur .zip erlaubt.');
}

// Zusätzliche Sicherheit: Prüfe auf gefährliche Zeichen
if (preg_match('/[^a-zA-Z0-9._-]/', $template)) {
    http_response_code(400);
    die('❌ Fehler: Ungültige Zeichen im Dateinamen.');
}

$filePath = $downloadsDir . $template;

// ═════════════════════════════════════════════════════════════
// DATEI-EXISTENZ PRÜFEN
// ═════════════════════════════════════════════════════════════
if (!file_exists($filePath)) {
    http_response_code(404);
    die('❌ Template nicht verfügbar oder Freigabe abgelaufen.');
}

// ═════════════════════════════════════════════════════════════
// TIMESTAMP PRÜFEN (12h Limit)
// ═════════════════════════════════════════════════════════════
$timestamps = array();
if (file_exists($timestampFile)) {
    $data = json_decode(file_get_contents($timestampFile), true);
    if ($data) $timestamps = $data;
}

if (!isset($timestamps[$template])) {
    http_response_code(403);
    die('❌ Template nicht freigegeben.');
}

$elapsed = time() - $timestamps[$template];
if ($elapsed > (12 * 3600)) {
    // Automatisch löschen wenn abgelaufen
    @unlink($filePath);
    unset($timestamps[$template]);
    file_put_contents($timestampFile, json_encode($timestamps));
    
    http_response_code(410);
    die('❌ Freigabe ist abgelaufen (12 Stunden überschritten).');
}

// ═════════════════════════════════════════════════════════════
// DOWNLOAD REGISTRIEREN (für Rate Limiting)
// ═════════════════════════════════════════════════════════════
registerDownload($template);

// ═════════════════════════════════════════════════════════════
// SICHERER DATEI-DOWNLOAD
// ═════════════════════════════════════════════════════════════
// Verhindere Header Injection durch Filename-Sanitization
$safe_filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $template);

// Content-Type sicher setzen
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $safe_filename . '"');
header('Content-Length: ' . filesize($filePath));
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Datei sicher ausgeben
readfile($filePath);
exit;
?>
// Download-Gateway mit 12h Zeitlimit
$downloadsDir = __DIR__ . '/../downloads/';
$timestampFile = __DIR__ . '/freigabe-timestamps.json';

$template = isset($_GET['file']) ? basename($_GET['file']) : '';

if (!$template) {
    die('Kein Template angegeben.');
}

$filePath = $downloadsDir . $template;

if (!file_exists($filePath)) {
    die('Template nicht verfügbar oder Freigabe abgelaufen.');
}

// Timestamp prüfen
$timestamps = array();
if (file_exists($timestampFile)) {
    $data = json_decode(file_get_contents($timestampFile), true);
    if ($data) $timestamps = $data;
}

if (!isset($timestamps[$template])) {
    die('Template nicht freigegeben.');
}

$elapsed = time() - $timestamps[$template];
if ($elapsed > (12 * 3600)) {
    @unlink($filePath);
    unset($timestamps[$template]);
    file_put_contents($timestampFile, json_encode($timestamps));
    die('Freigabe ist abgelaufen (12 Stunden überschritten).');
}

// Download
header('Content-Type: application/zip');
header('Content-Disposition: attachment; filename="' . $template . '"');
header('Content-Length: ' . filesize($filePath));
readfile($filePath);
exit;
?>



