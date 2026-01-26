<?php
// Sensitive SMTP Zugangsdaten HIER EINTRAGEN (nicht ins Repo committen, falls öffentlich!)
// Falls du schon Daten geschickt hattest, bitte hier eintragen.

// Sichere Passwort-Beschaffung:
// 1) Hosting: Environment Variable SMTP_PASSWORD setzen (empfohlen)
// 2) Datei außerhalb des Webroots: z.B. /home/USER/secure/smtp-pass.txt
// 3) Fallback: lokale Datei smtp-pass.txt (nicht committen!) im selben Verzeichnis
//    -> Lege eine Datei "smtp-pass.txt" mit nur dem Passwort an (keine Leerzeichen / Zeilenumbrüche)
// 4) Nach Rotation: alten Wert sofort löschen.

$smtpPassword = getenv('SMTP_PASSWORD');

// Prefer encrypted secret file if env keys are set
if (!$smtpPassword) {
    $encPath = __DIR__ . '/smtp-pass.enc';
    $key = getenv('SMTP_SECRET_KEY') ?: '';
    $iv  = getenv('SMTP_SECRET_IV') ?: '';
    if (is_file($encPath) && $key !== '' && $iv !== '') {
        require_once __DIR__ . '/secret-tool.php';
        $dec = decrypt_secret_file($encPath, $key, $iv);
        if (is_string($dec) && $dec !== '') {
            $smtpPassword = $dec;
        }
    }
}

// Plaintext fallback file (do not commit): smtp-pass.txt
if (!$smtpPassword) {
    $secureFile = __DIR__ . '/smtp-pass.txt';
    if (is_file($secureFile)) {
        $smtpPassword = trim((string)file_get_contents($secureFile));
    }
}

return [
    'enabled'      => true,
    'host'         => 'smtps.udag.de', // SMTP-Server (udag)
    'port'         => 465,             // SSL/TLS Port
    'encryption'   => 'ssl',           // 'ssl' für Port 465; bei 587 -> 'tls'
    'username'     => 'support@mcgv.de',
    'password'     => $smtpPassword ?: 'PLEASE_SET_SMTP_PASSWORD',
    'from_email'   => 'support@mcgv.de',
    'from_name'    => 'Code & Beats',
    'reply_to'     => 'support@mcgv.de'
];
