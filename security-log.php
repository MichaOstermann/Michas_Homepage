<?php
// ═══════════════════════════════════════════════════════════════
// MCGV.DE - SECURITY EVENT LOGGER (MINIMAL VERSION)
// © 2025 Michael Ostermann
// ═══════════════════════════════════════════════════════════════

// Setze Timeout
set_time_limit(2);
ini_set('max_execution_time', 2);

// Schnelle Antwort - KEIN BLOCKING
header('Content-Type: application/json');
http_response_code(200);
echo json_encode(['success' => true, 'logged' => 0]);
exit;

// Lese JSON-Daten (mit Timeout)
$json = @file_get_contents('php://input', false, null, 0, 10000); // Max 10KB
if (!$json) {
    http_response_code(400);
    exit(json_encode(['error' => 'No data']));
}

$data = json_decode($json, true);
if (!$data) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid JSON']));
}

// Batch-Processing Support (neue Struktur)
$events = isset($data['events']) && is_array($data['events']) ? $data['events'] : [$data];

// IP-Adresse ermitteln (einmal für alle Events)
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip = filter_var($_SERVER['HTTP_X_FORWARDED_FOR'], FILTER_VALIDATE_IP) ?: $ip;
}

// Log-Datei (sichere Location)
$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

$logFile = $logDir . '/security-' . date('Y-m-d') . '.log';

// SOFORTIGE Antwort senden (vor Logging)
http_response_code(200);
header('Content-Length: ' . strlen(json_encode(['success' => true, 'logged' => count($events)])));
echo json_encode(['success' => true, 'logged' => count($events)]);

// Flush Output sofort
if (function_exists('ob_flush')) {
    @ob_flush();
}
@flush();

// FastCGI Finish Request (wenn verfügbar)
if (function_exists('fastcgi_finish_request')) {
    @fastcgi_finish_request();
}

// Validierung & Logging (im Hintergrund)
foreach ($events as $eventData) {
    $event = filter_var($eventData['event'] ?? '', FILTER_SANITIZE_STRING);
    $details = filter_var($eventData['details'] ?? '', FILTER_SANITIZE_STRING);
    $userAgent = filter_var($eventData['userAgent'] ?? '', FILTER_SANITIZE_STRING);
    $url = filter_var($eventData['url'] ?? '', FILTER_SANITIZE_URL);
    
    if (empty($event)) continue;

    // Log-Eintrag erstellen
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'event' => $event,
        'details' => $details,
        'ip' => $ip,
        'userAgent' => $userAgent,
        'url' => $url
    ];

    // Schreibe in Log-Datei
    $logLine = json_encode($logEntry) . PHP_EOL;
    @file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);

    // Kritische Events → sofortige Aktion
    $criticalEvents = [
        'BOT_DETECTED',
        'HONEYPOT_TRIGGERED',
        'DEVTOOLS_OPENED',
        'EXCESSIVE_COPY_ATTEMPTS',
        'WEBDRIVER_DETECTED'
    ];

    if (in_array($event, $criticalEvents)) {
        // Blockiere IP (optional - kann zu blocklist.txt hinzugefügt werden)
        $blocklistFile = $logDir . '/blocked-ips.txt';
        $blockedIps = file_exists($blocklistFile) ? @file($blocklistFile, FILE_IGNORE_NEW_LINES) : [];
        
        if (!in_array($ip, $blockedIps)) {
            @file_put_contents($blocklistFile, $ip . PHP_EOL, FILE_APPEND | LOCK_EX);
        }
        
        // Optional: Email-Benachrichtigung bei kritischen Events
        // mail('admin@mcgv.de', 'Security Alert: ' . $event, json_encode($logEntry));
    }
}

// Alte Logs bereinigen (> 30 Tage)
$files = glob($logDir . '/security-*.log');
foreach ($files as $file) {
    if (filemtime($file) < (time() - (30 * 24 * 60 * 60))) {
        @unlink($file);
    }
}
?>

