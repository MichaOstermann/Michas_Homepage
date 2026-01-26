<?php
header('Content-Type: application/json; charset=utf-8');
$mode = $_GET['mode'] ?? 'test';
$to = 'support@mcgv.de';
$envelope = '-f support@mcgv.de';
$response = [];
$response['php_version'] = PHP_VERSION;
$response['sendmail_path'] = ini_get('sendmail_path');
$response['default_socket_timeout'] = ini_get('default_socket_timeout');
$response['mode'] = $mode;
$response['time'] = date('c');

if ($mode === 'test') {
    $subject = 'Mail-Diagnose Test ' . date('H:i:s');
    $body = "Diagnose-Mail von mail-diagnostics.php (\nZeit: " . date('r') . "\nIP: " . ($_SERVER['REMOTE_ADDR'] ?? '-') . "\nUA: " . ($_SERVER['HTTP_USER_AGENT'] ?? '-') . "\n)";
    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'Content-Transfer-Encoding: 8bit';
    $headers[] = 'From: Diagnose <support@mcgv.de>';
    $headers[] = 'Return-Path: support@mcgv.de';
    $headers[] = 'Message-ID: <' . uniqid('', true) . '@mcgv.de>';
    $headers[] = 'X-Mailer: MailDiag/1.0';
    $sent = @mail($to, $subject, $body, implode("\r\n", $headers), $envelope);
    $response['mail_sent'] = $sent;
    $response['note'] = $sent ? 'mail() returned true' : 'mail() returned false';
    if (!$sent) {
        $response['last_error'] = error_get_last();
    }
}

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
