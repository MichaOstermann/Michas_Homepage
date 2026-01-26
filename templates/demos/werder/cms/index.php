<?php
session_start();

// Konfiguration
$admin_user = 'admin';
$admin_pass = 'Darkman2012!'; // In Produktion: password_hash() verwenden!
$users_file = __DIR__ . '/data/users.json';
$data_dir = __DIR__ . '/data';
$uploads_dir = __DIR__ . '/uploads';

// Verzeichnisse erstellen
if (!is_dir($data_dir)) mkdir($data_dir, 0755, true);
if (!is_dir($uploads_dir)) mkdir($uploads_dir, 0755, true);
if (!is_dir($uploads_dir . '/photos')) mkdir($uploads_dir . '/photos', 0755, true);
if (!is_dir($uploads_dir . '/videos')) mkdir($uploads_dir . '/videos', 0755, true);

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: index.php');
    exit;
}

// Login-Check
if (!isset($_SESSION['user'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['username'], $_POST['password'])) {
        $username = $_POST['username'];
        $password = $_POST['password'];
        
        // Admin-Login
        if ($username === $admin_user && $password === $admin_pass) {
            $_SESSION['user'] = $username;
            $_SESSION['role'] = 'admin';
            header('Location: index.php');
            exit;
        }
        
        // Benutzer-Login
        if (file_exists($users_file)) {
            $users = json_decode(file_get_contents($users_file), true);
            if (isset($users[$username])) {
                if (password_verify($password, $users[$username]['password']) && $users[$username]['approved']) {
                    $_SESSION['user'] = $username;
                    $_SESSION['role'] = 'user';
                    header('Location: index.php');
                    exit;
                }
            }
        }
        
        $error = 'Ungültige Anmeldedaten oder Zugang nicht freigegeben!';
    }
    
    // Login-Formular
    ?>
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Werder CMS Login</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #0B0F16 0%, #1D9A50 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .login-container {
                background: rgba(255, 255, 255, 0.95);
                padding: 3rem;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 100%;
            }
            .logo {
                text-align: center;
                margin-bottom: 2rem;
            }
            .logo h1 {
                color: #1D9A50;
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            .logo p {
                color: #666;
                font-size: 0.9rem;
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            label {
                display: block;
                color: #333;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            input {
                width: 100%;
                padding: 0.8rem;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 1rem;
                transition: border 0.3s;
            }
            input:focus {
                outline: none;
                border-color: #1D9A50;
            }
            button {
                width: 100%;
                padding: 1rem;
                background: linear-gradient(135deg, #1D9A50 0%, #2ECC71 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                transition: transform 0.3s, box-shadow 0.3s;
            }
            button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(29, 154, 80, 0.4);
            }
            .error {
                background: #ffebee;
                color: #c62828;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1.5rem;
                text-align: center;
                font-weight: 600;
            }
            .register-link {
                text-align: center;
                margin-top: 1.5rem;
                color: #666;
            }
            .register-link a {
                color: #1D9A50;
                text-decoration: none;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="logo">
                <h1>⚽ Werder CMS</h1>
                <p>Content Management System</p>
            </div>
            <?php if (isset($error)): ?>
                <div class="error"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
            <form method="post">
                <div class="form-group">
                    <label>Benutzername</label>
                    <input type="text" name="username" required autofocus>
                </div>
                <div class="form-group">
                    <label>Passwort</label>
                    <input type="password" name="password" required>
                </div>
                <button type="submit">Anmelden</button>
            </form>
            <div class="register-link">
                Neu hier? <a href="register.php">Registrieren</a>
            </div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// CMS-Dashboard (nach Login)
$role = $_SESSION['role'];
$username = $_SESSION['user'];
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Werder CMS Dashboard</title>
    <link rel="stylesheet" href="cms-styles.css">
</head>
<body>
    <div class="cms-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <h1>⚽ Werder CMS</h1>
                <p><?= htmlspecialchars($username) ?> (<?= $role ?>)</p>
            </div>
            <nav class="sidebar-nav">
                <a href="#" class="nav-item active" data-tab="dashboard">
                    <span class="icon">📊</span> Dashboard
                </a>
                <?php if ($role === 'admin'): ?>
                <a href="#" class="nav-item" data-tab="users">
                    <span class="icon">👥</span> Benutzerverwaltung
                </a>
                <?php endif; ?>
                <a href="#" class="nav-item" data-tab="spielplan">
                    <span class="icon">📅</span> Spielplan
                </a>
                <a href="#" class="nav-item" data-tab="galerie">
                    <span class="icon">📷</span> Foto-Galerie
                </a>
                <a href="#" class="nav-item" data-tab="videos">
                    <span class="icon">🎥</span> Videos
                </a>
            </nav>
            <div class="sidebar-footer">
                <a href="?logout=1" class="logout-btn">Abmelden</a>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Dashboard Tab -->
            <div class="tab-content active" id="dashboard">
                <h2>Dashboard</h2>
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <div class="stat-value" id="stat-games">0</div>
                        <div class="stat-label">Spiele</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📷</div>
                        <div class="stat-value" id="stat-photos">0</div>
                        <div class="stat-label">Fotos</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎥</div>
                        <div class="stat-value" id="stat-videos">0</div>
                        <div class="stat-label">Videos</div>
                    </div>
                    <?php if ($role === 'admin'): ?>
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-value" id="stat-users">0</div>
                        <div class="stat-label">Benutzer</div>
                    </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Tabs werden von JavaScript geladen -->
            <div class="tab-content" id="users"></div>
            <div class="tab-content" id="spielplan"></div>
            <div class="tab-content" id="galerie"></div>
            <div class="tab-content" id="videos"></div>
        </main>
    </div>

    <script src="cms-script.js"></script>
</body>
</html>



