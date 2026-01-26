<?php
// ═════════════════════════════════════════════════════════════
// WERDER FANS CMS - SESSION CHECK
// © 2025 Michael Ostermann
// SICHERHEIT: Session-Timeout, IP-Check, XSS-Protection
// ═════════════════════════════════════════════════════════════

// SECURITY HEADERS
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Session-Sicherheit
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) ? 1 : 0);
ini_set('session.cookie_samesite', 'Strict');

session_start();

// SESSION TIMEOUT (30 Minuten Inaktivität)
$session_timeout = 1800; // 30 Minuten
$current_time = time();

// Prüfe ob eingeloggt
if (isset($_SESSION['cms_logged_in']) && $_SESSION['cms_logged_in'] === true) {
    
    // Prüfe Session-Timeout
    if (isset($_SESSION['cms_last_activity'])) {
        if (($current_time - $_SESSION['cms_last_activity']) > $session_timeout) {
            // Session abgelaufen
            session_destroy();
            echo json_encode([
                'loggedIn' => false,
                'message' => 'Session abgelaufen (30 Min Timeout)'
            ]);
            exit;
        }
    }
    
    // Prüfe IP-Adresse (Session Hijacking Protection)
    $current_ip = $_SERVER['REMOTE_ADDR'] ?? '';
    if (isset($_SESSION['cms_ip']) && $_SESSION['cms_ip'] !== $current_ip) {
        // IP hat sich geändert - potentieller Session Hijack
        session_destroy();
        echo json_encode([
            'loggedIn' => false,
            'message' => 'Sicherheitswarnung: IP-Adresse geändert'
        ]);
        exit;
    }
    
    // Aktualisiere Last Activity
    $_SESSION['cms_last_activity'] = $current_time;
    
    // XSS-Protection für Output
    $username = htmlspecialchars($_SESSION['cms_username'] ?? 'Admin', ENT_QUOTES, 'UTF-8');
    
    echo json_encode([
        'loggedIn' => true,
        'username' => $username,
        'isAdmin' => $_SESSION['cms_is_admin'] ?? true,
        'sessionTime' => floor(($current_time - ($_SESSION['cms_login_time'] ?? $current_time)) / 60) . ' Min'
    ]);
} else {
    echo json_encode([
        'loggedIn' => false
    ]);
}

