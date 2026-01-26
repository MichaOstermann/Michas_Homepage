<?php
// ═════════════════════════════════════════════════════════════
// WERDER FANS CMS - SECURITY HELPER
// © 2025 Michael Ostermann
// ZENTRALE SICHERHEITSFUNKTIONEN
// ═════════════════════════════════════════════════════════════

// SECURITY HEADERS
function setSecurityHeaders() {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Content-Security-Policy: default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\';');
}

// SESSION SECURITY
function initSecureSession() {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) ? 1 : 0);
    ini_set('session.cookie_samesite', 'Strict');
    ini_set('session.use_strict_mode', 1);
    
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

// LOGIN CHECK
function requireLogin() {
    $session_timeout = 1800; // 30 Minuten
    $current_time = time();
    
    if (!isset($_SESSION['cms_logged_in']) || $_SESSION['cms_logged_in'] !== true) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => '🔒 Nicht angemeldet! Bitte erst einloggen.'
        ]);
        exit;
    }
    
    // Session-Timeout prüfen
    if (isset($_SESSION['cms_last_activity'])) {
        if (($current_time - $_SESSION['cms_last_activity']) > $session_timeout) {
            session_destroy();
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => '⏰ Session abgelaufen (30 Min Timeout)'
            ]);
            exit;
        }
    }
    
    // IP-Check (Session Hijacking Protection)
    $current_ip = $_SERVER['REMOTE_ADDR'] ?? '';
    if (isset($_SESSION['cms_ip']) && $_SESSION['cms_ip'] !== $current_ip) {
        session_destroy();
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => '⚠️ Sicherheitswarnung: IP-Adresse geändert!'
        ]);
        exit;
    }
    
    // Aktualisiere Last Activity
    $_SESSION['cms_last_activity'] = $current_time;
    
    return true;
}

// XSS PROTECTION
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

// VALIDATE JSON INPUT
function getJsonInput() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Ungültige JSON-Daten'
        ]);
        exit;
    }
    
    return $data;
}

// CSRF TOKEN (optional für künftige Erweiterung)
function generateCsrfToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// FILE UPLOAD VALIDATION
function validateImageUpload($file) {
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $max_size = 5 * 1024 * 1024; // 5 MB
    
    if (!in_array($file['type'], $allowed_types)) {
        return ['success' => false, 'message' => 'Nur Bilder erlaubt (JPG, PNG, GIF, WEBP)'];
    }
    
    if ($file['size'] > $max_size) {
        return ['success' => false, 'message' => 'Datei zu groß (max 5 MB)'];
    }
    
    // Prüfe ob wirklich ein Bild
    $image_info = @getimagesize($file['tmp_name']);
    if ($image_info === false) {
        return ['success' => false, 'message' => 'Keine gültige Bilddatei'];
    }
    
    return ['success' => true];
}

// DIRECTORY TRAVERSAL PROTECTION
function sanitizeFilename($filename) {
    // Entferne gefährliche Zeichen
    $filename = basename($filename);
    $filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
    return $filename;
}



