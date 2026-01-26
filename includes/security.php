<?php
// ═══════════════════════════════════════════════════════════════
// MCGV.DE - SECURITY LIBRARY
// © 2025 Michael Ostermann
// XSS, SQL-Injection, CSRF, Rate Limiting Protection
// ═══════════════════════════════════════════════════════════════

class Security {
    
    // ===== XSS PROTECTION =====
    public static function cleanInput($data) {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = self::cleanInput($value);
            }
            return $data;
        }
        
        // HTML-Entities escapen
        $data = htmlspecialchars($data, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        // Gefährliche Tags entfernen
        $data = strip_tags($data);
        
        // Whitespace trimmen
        $data = trim($data);
        
        return $data;
    }
    
    // ===== SQL-INJECTION PROTECTION =====
    public static function sanitizeSQL($data, $pdo = null) {
        if ($pdo && $pdo instanceof PDO) {
            // Prepared Statement (beste Methode)
            return $pdo->quote($data);
        }
        
        // Fallback: manuelle Bereinigung
        $data = str_replace([
            "'", '"', ';', '--', '/*', '*/', 'xp_', 'sp_',
            'union', 'select', 'insert', 'update', 'delete',
            'drop', 'create', 'alter', 'exec', 'execute'
        ], '', strtolower($data));
        
        return $data;
    }
    
    // ===== CSRF TOKEN =====
    public static function generateCSRFToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    public static function validateCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    // ===== RATE LIMITING =====
    public static function checkRateLimit($identifier, $max_requests = 60, $time_window = 60) {
        $cache_file = __DIR__ . '/../logs/rate-limit-' . md5($identifier) . '.json';
        
        $now = time();
        $requests = [];
        
        if (file_exists($cache_file)) {
            $requests = json_decode(file_get_contents($cache_file), true) ?: [];
        }
        
        // Entferne alte Einträge
        $requests = array_filter($requests, function($timestamp) use ($now, $time_window) {
            return ($now - $timestamp) < $time_window;
        });
        
        // Prüfe Limit
        if (count($requests) >= $max_requests) {
            return [
                'allowed' => false,
                'remaining' => 0,
                'reset_in' => $time_window - ($now - min($requests))
            ];
        }
        
        // Füge neue Anfrage hinzu
        $requests[] = $now;
        file_put_contents($cache_file, json_encode($requests), LOCK_EX);
        
        return [
            'allowed' => true,
            'remaining' => $max_requests - count($requests),
            'reset_in' => $time_window
        ];
    }
    
    // ===== IP-BLOCKING =====
    public static function checkBlockedIP($ip = null) {
        $ip = $ip ?: self::getClientIP();
        $blocklist_file = __DIR__ . '/../logs/blocked-ips.txt';
        
        if (!file_exists($blocklist_file)) {
            return false;
        }
        
        $blocked_ips = file($blocklist_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        return in_array($ip, $blocked_ips);
    }
    
    public static function blockIP($ip = null) {
        $ip = $ip ?: self::getClientIP();
        $blocklist_file = __DIR__ . '/../logs/blocked-ips.txt';
        
        $dir = dirname($blocklist_file);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        file_put_contents($blocklist_file, $ip . PHP_EOL, FILE_APPEND | LOCK_EX);
    }
    
    // ===== IP-ADRESSE ERMITTELN =====
    public static function getClientIP() {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        
        if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'];
            $ip_list = explode(',', $forwarded);
            $ip = trim($ip_list[0]);
        } elseif (isset($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        }
        
        return filter_var($ip, FILTER_VALIDATE_IP) ?: 'unknown';
    }
    
    // ===== USER AGENT VALIDATION =====
    public static function validateUserAgent() {
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        if (empty($user_agent)) {
            return false;
        }
        
        // Bot-Patterns
        $bot_patterns = [
            'bot', 'crawler', 'spider', 'scraper',
            'GPTBot', 'ChatGPT', 'Claude', 'anthropic',
            'CCBot', 'Bytespider', 'curl', 'wget', 'python',
            'scrapy', 'selenium', 'puppeteer', 'headless'
        ];
        
        foreach ($bot_patterns as $pattern) {
            if (stripos($user_agent, $pattern) !== false) {
                return false;
            }
        }
        
        return true;
    }
    
    // ===== FILE UPLOAD VALIDATION =====
    public static function validateFileUpload($file) {
        $errors = [];
        
        // Max 10MB
        if ($file['size'] > 10 * 1024 * 1024) {
            $errors[] = 'Datei zu groß (max 10MB)';
        }
        
        // Erlaubte Dateitypen
        $allowed_types = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/zip'
        ];
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mime_type, $allowed_types)) {
            $errors[] = 'Dateityp nicht erlaubt';
        }
        
        // Prüfe auf echte Bilddatei
        if (strpos($mime_type, 'image/') === 0) {
            if (!getimagesize($file['tmp_name'])) {
                $errors[] = 'Ungültige Bilddatei';
            }
        }
        
        // Dateiname bereinigen
        $filename = basename($file['name']);
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'safe_filename' => $filename,
            'mime_type' => $mime_type
        ];
    }
    
    // ===== SESSION SECURITY =====
    public static function secureSession() {
        // Session Cookie-Parameter
        ini_set('session.cookie_httponly', 1);
        ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) ? 1 : 0);
        ini_set('session.cookie_samesite', 'Strict');
        ini_set('session.use_strict_mode', 1);
        ini_set('session.use_only_cookies', 1);
        
        session_start();
        
        // Session Regeneration bei Login
        if (!isset($_SESSION['initiated'])) {
            session_regenerate_id(true);
            $_SESSION['initiated'] = true;
        }
        
        // IP-Check
        if (isset($_SESSION['ip'])) {
            if ($_SESSION['ip'] !== self::getClientIP()) {
                session_destroy();
                return false;
            }
        } else {
            $_SESSION['ip'] = self::getClientIP();
        }
        
        // Session Timeout (30 Minuten)
        if (isset($_SESSION['last_activity'])) {
            if ((time() - $_SESSION['last_activity']) > 1800) {
                session_destroy();
                return false;
            }
        }
        $_SESSION['last_activity'] = time();
        
        return true;
    }
    
    // ===== PASSWORD HASHING =====
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    // ===== HONEYPOT CHECK =====
    public static function checkHoneypot($field_name = 'website') {
        // Honeypot-Feld sollte leer sein
        return empty($_POST[$field_name]);
    }
    
    // ===== LOG SECURITY EVENT =====
    public static function logSecurityEvent($event, $details = '') {
        $log_dir = __DIR__ . '/../logs';
        if (!is_dir($log_dir)) {
            mkdir($log_dir, 0755, true);
        }
        
        $log_file = $log_dir . '/security-' . date('Y-m-d') . '.log';
        
        $log_entry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'event' => $event,
            'details' => $details,
            'ip' => self::getClientIP(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'url' => $_SERVER['REQUEST_URI'] ?? 'unknown'
        ];
        
        file_put_contents(
            $log_file,
            json_encode($log_entry) . PHP_EOL,
            FILE_APPEND | LOCK_EX
        );
    }
    
    // ===== BLOCK ACCESS =====
    public static function blockAccess($reason = 'Security violation') {
        http_response_code(403);
        
        self::logSecurityEvent('ACCESS_BLOCKED', $reason);
        self::blockIP();
        
        header('Content-Type: text/html; charset=UTF-8');
        echo '<!DOCTYPE html>
<html>
<head>
    <title>Zugriff blockiert</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #0B0F16; 
            color: #FF3333; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            margin: 0;
            text-align: center;
        }
        h1 { font-size: 4rem; margin: 0; }
        h2 { font-size: 2rem; color: #fff; }
        p { color: #999; }
    </style>
</head>
<body>
    <div>
        <h1>⛔</h1>
        <h2>Zugriff blockiert</h2>
        <p>' . htmlspecialchars($reason) . '</p>
        <p style="margin-top: 2rem; font-size: 0.9rem; color: #666;">
            Security ID: ' . md5(time() . self::getClientIP()) . '<br>
            © 2025 MCGV.DE
        </p>
    </div>
</body>
</html>';
        exit;
    }
}

// ═══════════════════════════════════════════════════════════════
// USAGE EXAMPLE:
// 
// require_once 'includes/security.php';
// 
// // XSS Protection
// $safe_input = Security::cleanInput($_POST['username']);
// 
// // Rate Limiting
// $rate_limit = Security::checkRateLimit($_SERVER['REMOTE_ADDR'], 60, 60);
// if (!$rate_limit['allowed']) {
//     die('Too many requests');
// }
// 
// // CSRF Protection
// $token = Security::generateCSRFToken();
// if (!Security::validateCSRFToken($_POST['csrf_token'])) {
//     Security::blockAccess('Invalid CSRF token');
// }
// 
// ═══════════════════════════════════════════════════════════════
?>



