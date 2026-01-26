<?php
session_start();
header('Content-Type: application/json');

// Nur Admin darf Benutzer verwalten
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Keine Berechtigung']);
    exit;
}

$users_file = __DIR__ . '/../data/users.json';
$data_dir = dirname($users_file);

if (!is_dir($data_dir)) mkdir($data_dir, 0755, true);

// GET: Liste aller Benutzer
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($users_file)) {
        echo file_get_contents($users_file);
    } else {
        echo json_encode([]);
    }
    exit;
}

// POST: Benutzer erstellen, freigeben oder löschen
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $users = [];
    if (file_exists($users_file)) {
        $users = json_decode(file_get_contents($users_file), true);
    }
    
    $action = $_POST['action'] ?? 'create';
    
    // Benutzer erstellen
    if ($action === 'create') {
        $username = trim($_POST['username'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $approved = isset($_POST['approved']) && $_POST['approved'] === 'on';
        
        if (empty($username) || empty($email) || empty($password)) {
            echo json_encode(['success' => false, 'error' => 'Alle Felder erforderlich']);
            exit;
        }
        
        if (isset($users[$username])) {
            echo json_encode(['success' => false, 'error' => 'Benutzername bereits vergeben']);
            exit;
        }
        
        $users[$username] = [
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'email' => $email,
            'approved' => $approved,
            'created' => date('Y-m-d H:i:s')
        ];
        
        file_put_contents($users_file, json_encode($users, JSON_PRETTY_PRINT));
        
        // E-Mail senden wenn freigegeben
        if ($approved) {
            sendApprovalEmail($email, $username, $password);
        }
        
        echo json_encode(['success' => true]);
        exit;
    }
    
    // Benutzer freigeben
    if ($action === 'approve') {
        $username = $_POST['username'] ?? '';
        $email = $_POST['email'] ?? '';
        
        if (isset($users[$username])) {
            $users[$username]['approved'] = true;
            file_put_contents($users_file, json_encode($users, JSON_PRETTY_PRINT));
            
            // E-Mail senden
            sendApprovalEmail($email, $username);
            
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Benutzer nicht gefunden']);
        }
        exit;
    }
    
    // Benutzer löschen
    if ($action === 'delete') {
        $username = $_POST['username'] ?? '';
        
        if (isset($users[$username])) {
            unset($users[$username]);
            file_put_contents($users_file, json_encode($users, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Benutzer nicht gefunden']);
        }
        exit;
    }
}

function sendApprovalEmail($email, $username, $password = null) {
    $subject = 'Werder CMS - Dein Account wurde freigegeben! ⚽';
    
    $message = "Hallo!\n\n";
    $message .= "Dein Werder CMS Account wurde vom Administrator freigegeben!\n\n";
    $message .= "Benutzername: $username\n";
    if ($password) {
        $message .= "Passwort: $password\n";
    }
    $message .= "\nDu kannst dich jetzt anmelden unter:\n";
    $message .= "https://mcgv.de/templates/demos/werder/cms/\n\n";
    $message .= "Viel Spaß beim Verwalten der Inhalte!\n\n";
    $message .= "Lebenslang Grün-Weiß! 🟢⚪\n";
    $message .= "SV Werder Bremen";
    
    $headers = "From: noreply@mcgv.de\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    mail($email, $subject, $message, $headers);
}
?>



