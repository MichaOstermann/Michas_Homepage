<?php
/**
 * Secret helper: AES-256-CBC decrypt for small secrets stored as base64 in files.
 * Usage: $plain = decrypt_secret_file(__DIR__.'/smtp-pass.enc', getenv('SMTP_SECRET_KEY'), getenv('SMTP_SECRET_IV'));
 */
function decrypt_secret_base64(string $cipherB64, string $key, string $iv): ?string {
    if ($key === '' || $iv === '') return null;
    $cipher = base64_decode($cipherB64, true);
    if ($cipher === false) return null;
    $keyBin = hash('sha256', $key, true); // derive 32 bytes
    $ivBin  = substr(hash('sha256', $iv, true), 0, 16); // 16 bytes IV
    $plain = openssl_decrypt($cipher, 'aes-256-cbc', $keyBin, OPENSSL_RAW_DATA, $ivBin);
    if ($plain === false) return null;
    return rtrim($plain);
}

function decrypt_secret_file(string $path, ?string $key, ?string $iv): ?string {
    if (!is_file($path)) return null;
    $key = $key ?? '';
    $iv  = $iv ?? '';
    if ($key === '' || $iv === '') return null;
    $content = trim((string)file_get_contents($path));
    if ($content === '') return null;
    return decrypt_secret_base64($content, $key, $iv);
}
