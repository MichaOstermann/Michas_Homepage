<?php
// Template Download Anfrage Endpoint
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
// Restriktives CORS: nur eigene Domains/Localhost
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = (bool) preg_match('/(mcgv|codebeats|localhost|127\\.0\\.0\\.1)/i', $origin);
if ($origin && $allowed) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
} else {
    // Kein Wildcard-CORS für fremde Origins
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Nur POST erlaubt']); exit; }

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Ungültiges JSON']); exit; }

$name    = trim($data['name'] ?? '');
$email   = trim($data['email'] ?? '');
$template= trim($data['template'] ?? '');
$title   = trim($data['title'] ?? $template);
$message = trim($data['message'] ?? '');
$ip      = $_SERVER['REMOTE_ADDR'] ?? '-';
$ua      = $_SERVER['HTTP_USER_AGENT'] ?? '-';

if ($name === '' || $email === '' || $template === '') { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Pflichtfelder fehlen']); exit; }
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Ungültige Email']); exit; }

$logFile = __DIR__ . '/template-requests.log';
$timestampIso = date('c');

// Email Aufbau
$subject = 'Template Anfrage: ' . $title . ' (' . $template . ')';
$body  = "Neue Template-Anfrage\n\n";
$body .= "Template: $title ($template)\n";
$body .= "Name: $name\n";
$body .= "Email: $email\n";
$body .= ($message !== '' ? "Verwendungszweck:\n$message\n\n" : "Verwendungszweck: (nicht angegeben)\n\n");
$body .= "IP: $ip\n";
$body .= "User-Agent: $ua\n";
$body .= "Zeit: " . date('d.m.Y H:i:s') . "\n";

$mailSent = false; $smtpTried = false; $smtpError = '';
try {
    $cfg = @require __DIR__ . '/mail-config.php';
    if (is_array($cfg) && !empty($cfg['enabled'])) {
        $smtpTried = true;
        require_once __DIR__ . '/smtp-mailer.php';
        $mailSent = smtp_send([
            'host' => $cfg['host'],
            'port' => $cfg['port'],
            'encryption' => $cfg['encryption'],
            'username' => $cfg['username'],
            'password' => $cfg['password'],
            'from_email' => $cfg['from_email'],
            'from_name' => $cfg['from_name'],
            'reply_to' => $cfg['reply_to'],
            'to_email' => $cfg['reply_to'], // sende an Support
            'subject' => $subject,
            'body' => $body
        ]);
    }
} catch (Throwable $e) {
    $smtpError = $e->getMessage();
}
if (!$mailSent) {
    // Fallback mail()
    $headers = [];
    $headers[] = 'From: Code & Beats <support@mcgv.de>';
    $headers[] = 'Reply-To: ' . $email;
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'Content-Transfer-Encoding: 8bit';
    $headers[] = 'X-Mailer: CodeBeats/TemplateReq 1.0';
    $envelopeFrom = 'support@mcgv.de';
    $mailSent = @mail($cfg['reply_to'] ?? 'support@mcgv.de', $subject, $body, implode("\r\n", $headers), '-f ' . $envelopeFrom);
}

// Logging
$logLine = "[$timestampIso] template=$template title=" . str_replace(["\r","\n"],' ', $title) . " name=" . str_replace(["\r","\n"],' ', $name) . " email=$email sent=" . ($mailSent?1:0) . " smtp=" . ($smtpTried?1:0) . " smtp_error=" . str_replace(["\r","\n"],' ', $smtpError) . " ip=$ip ua=" . str_replace(["\r","\n"],' ', $ua) . "\n";
@file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);

http_response_code(200);
echo json_encode([
    'success' => true,
    'mailFailed' => $mailSent ? false : true,
    'smtpTried' => $smtpTried,
    'template' => $template
]);
