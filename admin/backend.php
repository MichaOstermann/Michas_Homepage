
<?php
// Session-Cookie-Parameter explizit setzen
$cookieParams = session_get_cookie_params();
session_set_cookie_params([
    'lifetime' => $cookieParams['lifetime'],
    'path' => $cookieParams['path'],
    'domain' => $cookieParams['domain'],
    'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
    'httponly' => true,
    'samesite' => 'Lax'
]);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$passwort = 'Darkman2012!';
// Logout-Logik
if (isset($_GET['logout'])) {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    session_destroy();
    header('Location: backend.php');
    exit;
}
if (!isset($_SESSION['is_admin'])) {
    if (isset($_POST['adminpw'])) {
        if ($_POST['adminpw'] === $passwort) {
            session_regenerate_id(true); // Session-Fixierung verhindern
            $_SESSION['is_admin'] = true;
        } else {
            $error = 'Falsches Passwort!';
        }
    }
    if (!isset($_SESSION['is_admin'])) {
        echo '<!DOCTYPE html><html><head><title>Login</title><style>body{font-family:Arial;background:#fafbfc;margin:40px;}form{background:#fff;padding:30px 40px;border-radius:8px;box-shadow:0 2px 8px #eee;max-width:320px;margin:auto;}input[type=password]{width:100%;padding:8px;margin:10px 0 20px 0;border:1px solid #ccc;border-radius:4px;}button{background:#0078d7;color:#fff;border:none;padding:8px 20px;border-radius:4px;cursor:pointer;font-weight:bold;}button:hover{background:#005fa3;}h2{margin-bottom:20px;}p{color:#b71c1c;}</style></head><body>';
        echo '<form method="post"><h2>Admin Login</h2>';
        if (isset($error)) echo '<p>'.$error.'</p>';
        echo '<input type="password" name="adminpw" placeholder="Passwort" autofocus required><button type="submit">Login</button></form></body></html>';
        exit;
    }
}
?>
<html>
<head>
    <title>Template-Freigabe</title>
    <style>
        body { font-family: Arial, sans-serif; background: #fafbfc; margin: 40px; }
        h2 { color: #222; }
        table { border-collapse: collapse; width: 500px; background: #fff; box-shadow: 0 2px 8px #eee; }
        th, td { padding: 10px 16px; border-bottom: 1px solid #eee; text-align: left; }
        th { background: #f5f5f5; }
        tr:last-child td { border-bottom: none; }
        .freigeben-btn { background: #0078d7; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .freigeben-btn:hover { background: #005fa3; }
        .status-frei { color: #2e7d32; font-weight: bold; }
        .status-nicht { color: #b71c1c; font-weight: bold; }
        .msg { margin: 16px 0; padding: 10px; border-radius: 4px; }
        .msg-success { background: #e8f5e9; color: #2e7d32; }
        .msg-error { background: #ffebee; color: #b71c1c; }
    </style>
</head>
<body>
<div style="display:flex;justify-content:space-between;align-items:center;max-width:500px;">
    <div style="font-size:12px;color:#888;">Session-ID: <?php echo session_id(); ?> | Status: <?php echo isset($_SESSION['is_admin']) ? 'Eingeloggt' : 'Nicht eingeloggt'; ?></div>
    <h2>Template-Freigabe</h2>
    <a href="?logout=1" style="background:#b71c1c;color:#fff;padding:6px 16px;border-radius:4px;text-decoration:none;font-weight:bold;">Abmelden</a>
</div>
<?php
// Error Reporting für Debugging (entfernen nach dem Testen)
error_reporting(E_ALL);
ini_set('display_errors', 1);

$originalsDir = __DIR__ . '/../templates/originals/';
$freigegebenDir = __DIR__ . '/../templates/freigegeben/';
$downloadsDir = __DIR__ . '/../downloads/';
$scriptsDir = __DIR__ . '/../scripts/';

// Verzeichnisse erstellen falls nicht vorhanden
if (!is_dir($originalsDir)) mkdir($originalsDir, 0755, true);
if (!is_dir($freigegebenDir)) mkdir($freigegebenDir, 0755, true);
if (!is_dir($downloadsDir)) mkdir($downloadsDir, 0755, true);
if (!is_dir($scriptsDir)) mkdir($scriptsDir, 0755, true);

// Freigabe-Logik
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['template'])) {
    $template = $_POST['template'];
    if (file_exists($originalsDir . $template)) {
        copy($originalsDir . $template, $freigegebenDir . $template);
        copy($originalsDir . $template, $downloadsDir . $template);
        $_SESSION['freigabe_msg'] = "$template wurde freigegeben! <a href='../downloads/" . urlencode($template) . "' style='margin-left:20px;font-weight:bold;color:#0078d7;text-decoration:underline;'>Download-Link</a>";
    } elseif (file_exists($downloadsDir . $template)) {
        copy($downloadsDir . $template, $freigegebenDir . $template);
        $_SESSION['freigabe_msg'] = "$template wurde aus downloads freigegeben!";
    } elseif (file_exists($freigegebenDir . $template)) {
        copy($freigegebenDir . $template, $downloadsDir . $template);
        $_SESSION['freigabe_msg'] = "$template wurde aus freigegeben nach downloads kopiert!";
    } else {
        $_SESSION['freigabe_msg'] = "<span class='msg-error'>Datei nicht gefunden!</span>";
    }
    header('Location: backend.php');
    exit;
}

// Templates auflisten

// Alle ZIP-Dateien aus allen relevanten Verzeichnissen sammeln und eindeutige Namen extrahieren
$allFiles = array_merge(
    glob($originalsDir . '*.zip') ?: [],
    glob($freigegebenDir . '*.zip') ?: [],
    glob($downloadsDir . '*.zip') ?: []
);
$uniqueNames = array_unique(array_map('basename', $allFiles));

// Debug-Info
if (empty($uniqueNames)) {
    echo "<div class='msg msg-error'>Keine Templates gefunden. Verzeichnisse:<br>";
    echo "Originals: " . realpath($originalsDir) . " (existiert: " . (is_dir($originalsDir) ? 'ja' : 'nein') . ")<br>";
    echo "Freigegeben: " . realpath($freigegebenDir) . " (existiert: " . (is_dir($freigegebenDir) ? 'ja' : 'nein') . ")<br>";
    echo "Downloads: " . realpath($downloadsDir) . " (existiert: " . (is_dir($downloadsDir) ? 'ja' : 'nein') . ")</div>";
}

if (isset($_SESSION['freigabe_msg'])) {
    echo "<div class='msg msg-success'>" . $_SESSION['freigabe_msg'] . "</div>";
    unset($_SESSION['freigabe_msg']);
}
echo "<table>";
echo "<tr><th>Template</th><th>Status</th><th>Aktion</th></tr>";
foreach ($uniqueNames as $name) {
    $isFreigegeben = file_exists($freigegebenDir . $name) && file_exists($downloadsDir . $name);
    echo "<tr>";
    echo "<td>$name</td>";
    echo "<td>" . ($isFreigegeben ? "<span class='status-frei'>Freigegeben</span>" : "<span class='status-nicht'>Nicht freigegeben</span>") . "</td>";
    echo "<td>";
    if (!$isFreigegeben) {
        echo "<form method='post' style='display:inline;'>
                <input type='hidden' name='template' value='$name'>
                <input type='hidden' name='session_id' value='" . session_id() . "'>
                <button type='submit' class='freigeben-btn'>Freigeben</button>
              </form>";
    } else {
        $downloadUrl = '../downloads/' . urlencode($name);
        echo "<a href='$downloadUrl' style='font-weight:bold;color:#0078d7;text-decoration:underline;'>Download</a>";
    }
    echo "</td></tr>";
}
echo "</table>";
?>
</body>
</html>
<?php
// Datei-Ende - explizite Schließung
?>
