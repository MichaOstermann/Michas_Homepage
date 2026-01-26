<?php
/**
 * Einfacher SMTP Mailer (AUTH LOGIN) mit optional TLS/SSL ohne externe Bibliotheken.
 * Nutzung: require 'smtp-mailer.php'; $ok = smtp_send([...]);
 */
function smtp_send(array $options): bool {
    $host       = $options['host'];
    $port       = (int)$options['port'];
    $encryption = strtolower($options['encryption']); // tls|ssl|none
    $username   = $options['username'];
    $password   = $options['password'];
    $fromEmail  = $options['from_email'];
    $fromName   = $options['from_name'];
    $toEmail    = $options['to_email'];
    $subject    = $options['subject'];
    $body       = $options['body'];
    $replyTo    = $options['reply_to'] ?? $fromEmail;
    $timeout    = 15;

    $context = stream_context_create();
    $remote = ($encryption === 'ssl') ? "ssl://{$host}:{$port}" : "tcp://{$host}:{$port}";
    $fp = @stream_socket_client($remote, $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $context);
    if (!$fp) {
        error_log("SMTP connect failed: $errno $errstr");
        return false;
    }
    stream_set_timeout($fp, $timeout);

    $read = function() use ($fp) { return fgets($fp, 512); };
    $expect = function($code) use ($read) {
        $line = $read();
        if ($line === false || strpos($line, (string)$code) !== 0) {
            error_log("SMTP unexpected: " . trim((string)$line));
            return false;
        }
        return true;
    };
    $write = function($cmd) use ($fp) { fwrite($fp, $cmd . "\r\n"); };

    if (!$expect(220)) { return false; }
    $write('EHLO mcgv.de');
    if (!$expect(250)) { return false; }

    if ($encryption === 'tls') {
        $write('STARTTLS');
        if (!$expect(220)) { return false; }
        if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT | STREAM_CRYPTO_METHOD_TLSv1_3_CLIENT)) {
            error_log('SMTP TLS failed');
            return false;
        }
        // Re-EHLO
        $write('EHLO mcgv.de');
        if (!$expect(250)) { return false; }
    }

    // AUTH LOGIN
    $write('AUTH LOGIN');
    if (!$expect(334)) { return false; }
    $write(base64_encode($username));
    if (!$expect(334)) { return false; }
    $write(base64_encode($password));
    if (!$expect(235)) { return false; }

    // Envelope
    $write("MAIL FROM:<{$fromEmail}>");
    if (!$expect(250)) { return false; }
    $write("RCPT TO:<{$toEmail}>");
    if (!$expect(250)) { return false; }
    $write('DATA');
    if (!$expect(354)) { return false; }

    $messageId = uniqid('', true) . '@mcgv.de';
    $date = date('r');
    $headers = [];
    $headers[] = 'Date: ' . $date;
    $headers[] = 'Message-ID: <' . $messageId . '>';
    $headers[] = 'From: ' . encode_mime($fromName) . " <{$fromEmail}>";
    $headers[] = 'Reply-To: ' . $replyTo;
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'Content-Transfer-Encoding: 8bit';
    $headers[] = 'Subject: ' . encode_mime($subject);
    $headersStr = implode("\r\n", $headers);

    $data = $headersStr . "\r\n\r\n" . $body . "\r\n.";
    $write($data);
    if (!$expect(250)) { return false; }
    $write('QUIT');
    fclose($fp);
    return true;
}

function encode_mime(string $text): string {
    // Simple UTF-8 Q encoding fallback
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}
