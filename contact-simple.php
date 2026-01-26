<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Nur POST-Anfragen erlauben
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Nur POST-Anfragen erlaubt']);
    exit;
}

// JSON-Daten empfangen
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Hilfsfunktion für Logging
function cb_write_log(string $line): void {
    $logFile = __DIR__ . '/contact-log.txt';
    // Versuche zu schreiben; bei Fehler still ignorieren
    @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
}

// Basis-Meta für Logging
$timestampIso = date('c');
$ip = $_SERVER['REMOTE_ADDR'] ?? '-';
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '-';

if ($data === null || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ungültiges JSON']);
    cb_write_log("[$timestampIso] ip=$ip ua=" . str_replace(["\r","\n"],' ',$ua) . " parse_error json_invalid\n");
    exit;
}

// Neuer Honeypot-Feldname um Autofill zu vermeiden
$honeypotRaw = isset($data['hp_field']) ? trim((string)$data['hp_field']) : '';
if ($honeypotRaw !== '') {
    // Bot oder Fehltrigger -> nicht senden, aber loggen
    cb_write_log("[$timestampIso] ip=$ip hp_trigger=1 hp_val=" . str_replace(["\r","\n"], ' ', $honeypotRaw) . " admin_attempt=0 admin_sent=0 auto_sent=0 name=- email=- msg_len=0 ua=" . str_replace(["\r","\n"],' ',$ua) . "\n");
    echo json_encode([
        'success' => true,
        'honeypotTriggered' => true,
        'message' => 'Nachricht erfolgreich versendet! Wir melden uns schnellstmöglich zurück.'
    ]);
    exit;
}

// Validierung
if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Alle Felder sind erforderlich']);
    exit;
}

// Sanitizing & Hardening
function cb_clean_header_input(string $value, int $maxLen): string {
    $value = substr($value, 0, $maxLen);
    // CR/LF entfernen, um Header-Injection zu verhindern
    return str_replace(["\r", "\n"], '', $value);
}

$rawName = isset($data['name']) ? (string)$data['name'] : '';
$rawEmail = isset($data['email']) ? (string)$data['email'] : '';
$rawMessage = isset($data['message']) ? (string)$data['message'] : '';

$name = htmlspecialchars(strip_tags(cb_clean_header_input($rawName, 100)), ENT_QUOTES, 'UTF-8');
$email = filter_var(cb_clean_header_input($rawEmail, 254), FILTER_SANITIZE_EMAIL);
// Nachricht: Newlines bleiben für Lesbarkeit erhalten, aber Länge wird begrenzt
$rawMessage = substr($rawMessage, 0, 5000);
$message = htmlspecialchars(strip_tags($rawMessage), ENT_QUOTES, 'UTF-8');

// E-Mail-Validierung
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ungültige E-Mail-Adresse']);
    exit;
}

// E-Mail-Konfiguration
$to = 'support@mcgv.de';
$subject = 'Neue Nachricht von Code & Beats - ' . $name;

// Meta-Infos für die Admin-Mail
$timestamp = date('d.m.Y H:i');
$ip = $ip; // bereits gesetzt
$ua = $ua; // bereits gesetzt
$messageHtml = nl2br($message);

// HTML E-Mail Template
$htmlMessage = <<<HTML
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Neue Kontaktanfrage</title>
</head>
<body style="margin:0; padding:0; background:#f3f5f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color:#111;">
    <!-- Preheader (hidden) -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; visibility:hidden; mso-hide:all;">
        Neue Kontaktanfrage von {$name} – {$email}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f5f7; padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" width="640" style="max-width:640px; width:100%; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 6px 30px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="background:linear-gradient(135deg,#06FFF0 0%,#8B5CF6 100%); padding:28px 32px;">
                            <div style="font-size:14px; letter-spacing:1px; font-weight:800; text-transform:uppercase; color:#0B0F16; opacity:0.9;">Code &amp; Beats</div>
                            <div style="font-size:24px; font-weight:900; margin-top:6px; color:#0B0F16;">Neue Kontaktanfrage</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 32px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate; border-spacing:0 12px;">
                                <tr>
                                    <td style="width:160px; font-size:12px; text-transform:uppercase; letter-spacing:.5px; color:#6b6f76; font-weight:700;">Name</td>
                                    <td style="font-size:16px; color:#111; font-weight:600;">{$name}</td>
                                </tr>
                                <tr>
                                    <td style="width:160px; font-size:12px; text-transform:uppercase; letter-spacing:.5px; color:#6b6f76; font-weight:700;">E‑Mail</td>
                                    <td style="font-size:16px;"><a href="mailto:{$email}" style="color:#5b3df6; text-decoration:none; font-weight:600;">{$email}</a></td>
                                </tr>
                                <tr>
                                    <td style="width:160px; font-size:12px; text-transform:uppercase; letter-spacing:.5px; color:#6b6f76; font-weight:700; vertical-align:top; padding-top:10px;">Nachricht</td>
                                    <td>
                                        <div style="margin-top:6px; padding:16px 18px; border:1px solid #e8eaee; border-radius:10px; background:#fafbfc; color:#111; line-height:1.6; font-size:15px;">{$messageHtml}</div>
                                    </td>
                                </tr>
                            </table>

                            <div style="margin-top:22px; border-top:1px dashed #e6e8ee; padding-top:16px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                    <tr>
                                        <td style="font-size:12px; color:#6b6f76;">Empfangen: <strong style="color:#111;">{$timestamp}</strong></td>
                                        <td style="font-size:12px; color:#6b6f76; text-align:right;">IP: <strong style="color:#111;">{$ip}</strong></td>
                                    </tr>
                                </table>
                                <div style="margin-top:6px; font-size:11px; color:#9aa0a6;">User‑Agent: {$ua}</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#0B0F16; color:#cfd3da; padding:16px 32px; text-align:center; font-size:12px;">
                            Code &amp; Beats · mcgv.de
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;

// E-Mail Headers
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/html; charset=UTF-8';
$headers[] = 'Content-Transfer-Encoding: 8bit';
$headers[] = 'From: Code & Beats <support@mcgv.de>';
// Reply-To nur die Adresse für maximale Mail-Kompatibilität
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'Sender: support@mcgv.de';
$headers[] = 'Return-Path: support@mcgv.de';
$headers[] = 'Date: ' . date('r');
$headers[] = 'Message-ID: <' . uniqid('', true) . '@mcgv.de>';
$headers[] = 'X-Mailer: CodeBeats/1.1';

// Versuch zuerst SMTP
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
            'body' => strip_tags($htmlMessage)
        ]);
    }
} catch (Throwable $e) {
    // SMTP fehlgeschlagen – fallback
    cb_write_log("[$timestampIso] smtp_error=" . str_replace(["\r","\n"],' ', $e->getMessage()) . "\n");
}
if (!$mailSent) {
    // Fallback auf mail()
    $envelopeFrom = 'support@mcgv.de';
    $additionalParams = '-f ' . $envelopeFrom;
    $mailSent = @mail($to, $subject, $htmlMessage, implode("\r\n", $headers), $additionalParams);
}
// Flag für Logging
$adminAttempted = true;
// Auto-Reply wird deaktiviert
$autoReplySent = false;

// Auto-Reply deaktiviert -> keine zweite Mail
$autoReplySent = false; // bleibt false für Logging

if ($mailSent) {
    // Logging Erfolg
    cb_write_log("[$timestampIso] ip=$ip hp_trigger=0 hp_val=- admin_attempt=1 admin_sent=" . ($mailSent?1:0) . " auto_sent=0 name=" . str_replace(["\r","\n"],' ', $name) . " email=$email msg_len=" . strlen($message) . " ua=" . str_replace(["\r","\n"],' ',$ua) . "\n");
    echo json_encode([
        'success' => true,
        'mailFailed' => false,
        'honeypotTriggered' => false,
        'message' => 'Nachricht erfolgreich versendet! Wir melden uns schnellstmöglich zurück.'
    ]);
} else {
    // Logging Fehler (Admin fehlgeschlagen, Auto-Reply evtl. gesendet)
    cb_write_log("[$timestampIso] ip=$ip hp_trigger=0 hp_val=- admin_attempt=1 admin_sent=0 auto_sent=0 name=" . str_replace(["\r","\n"],' ', $name) . " email=$email msg_len=" . strlen($message) . " ua=" . str_replace(["\r","\n"],' ',$ua) . " mail_error=admin_failed\n");
    // Für Nutzer trotzdem Erfolg melden (silent degrade), Flag für Diagnose mitschicken
    echo json_encode([
        'success' => true,
        'mailFailed' => true,
        'honeypotTriggered' => false,
        'message' => 'Nachricht erfolgreich versendet! Wir melden uns schnellstmöglich zurück.'
    ]);
}
?>
