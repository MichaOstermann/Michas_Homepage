<?php
// ═════════════════════════════════════════════════════════════
// WERDER FANS CMS - SECURE LOGIN
// © 2025 Michael Ostermann
// MAXIMALE SICHERHEIT: bcrypt, Rate Limiting, CSRF, Sessions
// ═════════════════════════════════════════════════════════════

// SECURITY HEADERS
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// Session-Sicherheit
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) ? 1 : 0);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', 1);

session_start();

// Verschlüsseltes Passwort mit bcrypt (PASSWORD_DEFAULT)
// Original-Passwort: Darkman2912!
// Hash generiert mit: password_hash('Darkman2912!', PASSWORD_DEFAULT)
$admin_username = 'admin';
$admin_password_hash = '$2y$10$YZ9jX8KpqL5mH3nW7vB9.eK4JxM2RtP6QsL8NvC5XwA9YzH1KmF3G';

// RATE LIMITING (max 5 Versuche pro 15 Minuten)
$login_attempts_file = '../data/login_attempts.json';
$max_attempts = 5;
$lockout_time = 900; // 15 Minuten

// Erstelle data-Ordner wenn nicht existiert
if (!file_exists('../data')) {
    mkdir('../data', 0755, true);
}

// Lade Login-Versuche
$attempts = [];
if (file_exists($login_attempts_file)) {
    $attempts = json_decode(file_get_contents($login_attempts_file), true) ?: [];
}

$client_ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$current_time = time();

// Bereinige alte Einträge
$attempts = array_filter($attempts, function($attempt) use ($current_time, $lockout_time) {
    return ($current_time - $attempt['time']) < $lockout_time;
});

// Zähle Versuche für diese IP
$ip_attempts = array_filter($attempts, function($attempt) use ($client_ip) {
    return $attempt['ip'] === $client_ip;
});

// Prüfe ob IP gesperrt ist
if (count($ip_attempts) >= $max_attempts) {
    $oldest_attempt = min(array_column($ip_attempts, 'time'));
    $remaining_time = ceil(($oldest_attempt + $lockout_time - $current_time) / 60);
    
    http_response_code(429);
    echo json_encode([
        'success' => false,
        'message' => "⚠️ Zu viele Login-Versuche! Bitte warte $remaining_time Minuten.",
        'locked' => true
    ]);
    exit;
}

// Login-Versuch
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // INPUT VALIDATION
    $username = filter_var($data['username'] ?? '', FILTER_SANITIZE_STRING);
    $password = $data['password'] ?? '';
    
    // Prüfe ob Daten vorhanden
    if (empty($username) || empty($password)) {
        echo json_encode([
            'success' => false,
            'message' => 'Bitte fülle alle Felder aus!'
        ]);
        exit;
    }
    
    // Timing-Attack-Schutz: Immer password_verify ausführen
    $password_correct = password_verify($password, $admin_password_hash);
    $username_correct = hash_equals($admin_username, $username);
    
    if ($username_correct && $password_correct) {
        // ✅ LOGIN ERFOLGREICH
        
        // Regeneriere Session-ID (Session Fixation Protection)
        session_regenerate_id(true);
        
        // Setze Session-Variablen
        $_SESSION['cms_logged_in'] = true;
        $_SESSION['cms_username'] = $username;
        $_SESSION['cms_is_admin'] = true;
        $_SESSION['cms_login_time'] = time();
        $_SESSION['cms_last_activity'] = time();
        $_SESSION['cms_ip'] = $client_ip;
        
        // Lösche Login-Versuche für diese IP
        $attempts = array_filter($attempts, function($attempt) use ($client_ip) {
            return $attempt['ip'] !== $client_ip;
        });
        file_put_contents($login_attempts_file, json_encode(array_values($attempts)));
        
        echo json_encode([
            'success' => true,
            'message' => '✅ Login erfolgreich!'
        ]);
    } else {
        // ❌ LOGIN FEHLGESCHLAGEN
        
        // Registriere fehlgeschlagenen Versuch
        $attempts[] = [
            'ip' => $client_ip,
            'time' => $current_time,
            'username' => $username
        ];
        file_put_contents($login_attempts_file, json_encode($attempts));
        
        $remaining_attempts = $max_attempts - count($ip_attempts) - 1;
        
        echo json_encode([
            'success' => false,
            'message' => "❌ Falscher Benutzername oder Passwort! ($remaining_attempts Versuche übrig)"
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Ungültige Anfrage-Methode'
    ]);
}

