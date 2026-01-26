<?php
// Fehlerausgabe unterdrücken für sauberes JSON
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Konfiguration
$to = "support@mcgv.de"; // reverted domain (Live-Domain mcgv.de)
$subject = "🎉 Neue Newsletter-Anmeldung - Code & Beats";
// Meta
$timestampIso = date('c');
$ip = $_SERVER['REMOTE_ADDR'] ?? '-';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '-';

// POST-Daten validieren
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Nur POST-Requests erlaubt'], JSON_UNESCAPED_UNICODE);
    exit;
}

// JSON-Daten empfangen
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// JSON-Parsing-Fehler prüfen
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ungültige JSON-Daten'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Validierung
if (!isset($data['name']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name und Email erforderlich'], JSON_UNESCAPED_UNICODE);
    exit;
}

$name = htmlspecialchars(trim($data['name']), ENT_QUOTES, 'UTF-8');
$email = filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL);
$interests = isset($data['interests']) ? $data['interests'] : [];

if (!$email) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ungültige Email-Adresse'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Interessen formatieren
$interestsList = '';
$interestIcons = [
    'music' => '🎵 Musik',
    'powershell' => '💻 PowerShell',
    'templates' => '🎨 Templates',
    'gaming' => '🎮 Gaming',
    'blog' => '📝 Blog'
];

if (!empty($interests)) {
    $interestsList = "\n\nInteressiert sich für:\n";
    foreach ($interests as $interest) {
        $interestsList .= "  • " . ($interestIcons[$interest] ?? $interest) . "\n";
    }
} else {
    $interestsList = "\n\nInteressiert sich für: Alle Bereiche\n";
}

// Email-Inhalt
$message = "Neue Newsletter-Anmeldung auf Code & Beats!\n\n";
$message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$message .= "Name:     " . $name . "\n";
$message .= "Email:    " . $email . "\n";
$message .= $interestsList;
$message .= "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$message .= "Zeitstempel: " . date('d.m.Y H:i:s') . "\n";
$message .= "IP-Adresse:  " . $_SERVER['REMOTE_ADDR'] . "\n";
$message .= "User Agent:  " . $_SERVER['HTTP_USER_AGENT'] . "\n\n";
$message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$message .= "Nächste Schritte:\n";
$message .= "1. Email-Adresse zu deiner Newsletter-Liste hinzufügen\n";
$message .= "2. Optional: Willkommens-Email an " . $email . " senden\n\n";

// Email-Headers (robust)
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'Content-Transfer-Encoding: 8bit';
$headers[] = 'From: Code & Beats Newsletter <noreply@mcgv.de>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'Sender: noreply@mcgv.de';
$headers[] = 'Return-Path: noreply@mcgv.de';
$headers[] = 'Date: ' . date('r');
$headers[] = 'Message-ID: <' . uniqid('', true) . '@mcgv.de>';
$headers[] = 'X-Mailer: CodeBeats/Newsletter 1.0';

$envelopeFrom = 'noreply@mcgv.de';
$additionalParams = '-f ' . $envelopeFrom;
// SMTP zuerst versuchen
$mailSent = false;
try {
    $smtpCfg = @require __DIR__ . '/mail-config.php';
    if (is_array($smtpCfg) && !empty($smtpCfg['enabled'])) {
        require_once __DIR__ . '/smtp-mailer.php';
        $mailSent = smtp_send([
            'host' => $smtpCfg['host'],
            'port' => $smtpCfg['port'],
            'encryption' => $smtpCfg['encryption'],
            'username' => $smtpCfg['username'],
            'password' => $smtpCfg['password'],
            'from_email' => $smtpCfg['from_email'],
            'from_name' => $smtpCfg['from_name'],
            'reply_to' => $smtpCfg['reply_to'],
            'to_email' => $to,
            'subject' => $subject,
            'body' => $message
        ]);
    }
} catch (Throwable $e) {
    error_log('SMTP newsletter error: ' . $e->getMessage());
}
if (!$mailSent) {
    $mailSent = @mail($to, $subject, $message, implode("\r\n", $headers), $additionalParams);
}

// Logging (immer) – Erfolg / Fehler
$logFile = __DIR__ . '/newsletter-subscribers.log';
$logEntry = '[' . $timestampIso . '] ip=' . str_replace(["\r","\n"],' ',$ip) . ' ua=' . str_replace(["\r","\n"],' ',$ua) . ' name=' . str_replace(["\r","\n"],' ',$name) . ' email=' . $email . ' interests=' . implode(',', $interests) . ' sent=' . ($mailSent?1:0) . "\n";
@file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

http_response_code(200);
echo json_encode([
    'success' => true,
    'mailFailed' => $mailSent ? false : true,
    'message' => $mailSent 
        ? 'Newsletter-Anmeldung erfolgreich! (Admin-Mail zugestellt)' 
        : 'Newsletter-Anmeldung gespeichert – Mail-Versand fehlgeschlagen (admin).'
], JSON_UNESCAPED_UNICODE);
exit;
?>
