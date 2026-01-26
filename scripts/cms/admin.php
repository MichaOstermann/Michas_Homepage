<?php
// ═════════════════════════════════════════════════════════════
// POWERSHELL SCRIPTS CMS - ADMIN PANEL
// © 2025 Michael Ostermann
// Eigenständiges CMS nur für PowerShell-Bereich
// ═════════════════════════════════════════════════════════════

session_start();

// Security Headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Config
$admin_password = 'Darkman2012!'; // Klartext für einfache Nutzung
$data_dir = __DIR__ . '/data/';
$scripts_file = $data_dir . 'scripts.json';
$stats_file = $data_dir . 'stats.json';
$uploads_dir = __DIR__ . '/uploads/';

// Ensure directories
if (!is_dir($data_dir)) mkdir($data_dir, 0755, true);
if (!is_dir($uploads_dir)) mkdir($uploads_dir, 0755, true);

// Initialize files
if (!file_exists($scripts_file)) {
    file_put_contents($scripts_file, json_encode([], JSON_PRETTY_PRINT));
}
if (!file_exists($stats_file)) {
    file_put_contents($stats_file, json_encode(['total_downloads' => 0, 'total_views' => 0], JSON_PRETTY_PRINT));
}

// Login Check
if (!isset($_SESSION['ps_cms_admin'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
        if ($_POST['password'] === $admin_password) {
            $_SESSION['ps_cms_admin'] = true;
            header('Location: admin.php');
            exit;
        } else {
            $error = 'Falsches Passwort!';
        }
    }
    ?>
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>⚡ PS-CMS Login</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #0B0F16 0%, #1a1f2e 50%, #0B0F16 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .login-container {
                background: rgba(139, 92, 246, 0.05);
                border: 2px solid rgba(139, 92, 246, 0.3);
                border-radius: 20px;
                padding: 3rem;
                width: 90%;
                max-width: 420px;
                backdrop-filter: blur(20px);
                box-shadow: 0 30px 80px rgba(139, 92, 246, 0.4);
            }
            .logo { font-size: 5rem; text-align: center; margin-bottom: 1rem; filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.8)); }
            h1 { 
                text-align: center; 
                background: linear-gradient(135deg, #8B5CF6 0%, #06FFF0 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            .subtitle { text-align: center; color: rgba(255,255,255,0.6); margin-bottom: 2rem; font-size: 0.9rem; }
            .error { 
                background: linear-gradient(135deg, rgba(255,87,87,0.2) 0%, rgba(255,87,87,0.1) 100%);
                border: 2px solid #FF5757;
                padding: 1rem;
                border-radius: 12px;
                margin-bottom: 1.5rem;
                color: #FF5757;
                text-align: center;
                font-weight: 600;
            }
            input {
                width: 100%;
                padding: 1.2rem;
                border: 2px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                background: rgba(11, 15, 22, 0.8);
                color: #fff;
                font-size: 1rem;
                margin-bottom: 1.5rem;
                transition: all 0.3s;
            }
            input:focus {
                outline: none;
                border-color: #8B5CF6;
                box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
            }
            button {
                width: 100%;
                padding: 1.2rem;
                background: linear-gradient(135deg, #8B5CF6 0%, #06FFF0 100%);
                border: none;
                border-radius: 12px;
                color: #000;
                font-weight: 700;
                font-size: 1.1rem;
                cursor: pointer;
                transition: all 0.3s;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            button:hover {
                transform: translateY(-3px);
                box-shadow: 0 15px 40px rgba(139, 92, 246, 0.6);
            }
            .footer { text-align: center; margin-top: 2rem; color: rgba(255,255,255,0.4); font-size: 0.85rem; }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="logo">⚡</div>
            <h1>PowerShell CMS</h1>
            <p class="subtitle">Script-Management-System</p>
            
            <?php if (isset($error)): ?>
                <div class="error">🔒 <?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
            
            <form method="POST">
                <input type="password" name="password" placeholder="🔑 Admin-Passwort eingeben" required autofocus>
                <button type="submit">🚀 Anmelden</button>
            </form>
            
            <div class="footer">© 2025 Michael Ostermann</div>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

// Load Data
$scripts = json_decode(file_get_contents($scripts_file), true);
$stats = json_decode(file_get_contents($stats_file), true);

// Handle Actions
$message = '';
$message_type = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add/Edit Script
    if (isset($_POST['save_script'])) {
        $id = $_POST['id'] ?: 'ps_' . time() . '_' . rand(1000, 9999);
        
        $script = [
            'id' => $id,
            'name' => htmlspecialchars($_POST['name'], ENT_QUOTES),
            'slug' => strtolower(str_replace(' ', '-', preg_replace('/[^A-Za-z0-9 ]/', '', $_POST['name']))),
            'description' => htmlspecialchars($_POST['description'], ENT_QUOTES),
            'category' => htmlspecialchars($_POST['category'], ENT_QUOTES),
            'version' => htmlspecialchars($_POST['version'], ENT_QUOTES),
            'ps_version' => htmlspecialchars($_POST['ps_version'], ENT_QUOTES),
            'tags' => array_map('trim', array_filter(explode(',', $_POST['tags']))),
            'features' => array_map('trim', array_filter(explode("\n", $_POST['features']))),
            'file_path' => '',
            'downloads' => (int)($_POST['downloads'] ?? 0),
            'views' => (int)($_POST['views'] ?? 0),
            'rating' => (float)($_POST['rating'] ?? 0),
            'rating_count' => (int)($_POST['rating_count'] ?? 0),
            'created' => $_POST['created'] ?? date('Y-m-d'),
            'updated' => date('Y-m-d H:i:s'),
            'active' => isset($_POST['active']) ? 1 : 0,
            'is_premium' => isset($_POST['is_premium']) ? 1 : 0,
            'price' => (float)($_POST['price'] ?? 0)
        ];
        
        // Handle File Upload
        if (isset($_FILES['script_file']) && $_FILES['script_file']['error'] === UPLOAD_ERR_OK) {
            $ext = strtolower(pathinfo($_FILES['script_file']['name'], PATHINFO_EXTENSION));
            if ($ext === 'ps1' || $ext === 'zip') {
                $filename = $id . '.' . $ext;
                $target = $uploads_dir . $filename;
                if (move_uploaded_file($_FILES['script_file']['tmp_name'], $target)) {
                    $script['file_path'] = 'cms/uploads/' . $filename;
                    $script['file_type'] = $ext; // Track file type
                }
            }
        } else {
            // Keep existing file
            foreach ($scripts as $s) {
                if ($s['id'] === $id) {
                    $script['file_path'] = $s['file_path'];
                    $script['file_type'] = $s['file_type'] ?? 'ps1';
                    break;
                }
            }
        }
        
        // Update or Add
        $found = false;
        foreach ($scripts as $i => $s) {
            if ($s['id'] === $id) {
                $scripts[$i] = $script;
                $found = true;
                break;
            }
        }
        if (!$found) {
            $scripts[] = $script;
        }
        
        file_put_contents($scripts_file, json_encode($scripts, JSON_PRETTY_PRINT));
        $message = $found ? '✅ Script erfolgreich aktualisiert!' : '✅ Script erfolgreich erstellt!';
        $message_type = 'success';
    }
    
    // Delete Script
    if (isset($_POST['delete'])) {
        $id = $_POST['delete'];
        $scripts = array_values(array_filter($scripts, function($s) use ($id) {
            return $s['id'] !== $id;
        }));
        file_put_contents($scripts_file, json_encode($scripts, JSON_PRETTY_PRINT));
        $message = '🗑️ Script gelöscht!';
        $message_type = 'success';
    }
}

// Calculate Stats
$total_scripts = count($scripts);
$active_scripts = count(array_filter($scripts, fn($s) => $s['active']));
$total_downloads = array_sum(array_column($scripts, 'downloads'));
$total_views = array_sum(array_column($scripts, 'views'));
$avg_rating = $total_scripts > 0 ? array_sum(array_column($scripts, 'rating')) / $total_scripts : 0;
$categories = [];
foreach ($scripts as $s) {
    $cat = $s['category'];
    $categories[$cat] = ($categories[$cat] ?? 0) + 1;
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚡ PowerShell CMS - Admin</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0B0F16 0%, #1a1f2e 100%);
            color: #fff;
            line-height: 1.6;
        }
        
        .cms-wrapper {
            display: grid;
            grid-template-columns: 280px 1fr;
            min-height: 100vh;
        }
        
        /* Sidebar */
        .sidebar {
            background: linear-gradient(180deg, rgba(139,92,246,0.1) 0%, rgba(11,15,22,0.8) 100%);
            border-right: 2px solid rgba(139,92,246,0.2);
            padding: 2rem 0;
        }
        
        .sidebar-header {
            padding: 0 2rem 2rem;
            border-bottom: 1px solid rgba(139,92,246,0.2);
            margin-bottom: 2rem;
        }
        
        .logo-area {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .logo-icon {
            font-size: 3rem;
            filter: drop-shadow(0 0 20px rgba(139,92,246,0.6));
        }
        
        .logo-text h1 {
            font-size: 1.5rem;
            background: linear-gradient(135deg, #8B5CF6 0%, #06FFF0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .logo-text p {
            font-size: 0.75rem;
            color: rgba(255,255,255,0.5);
        }
        
        .nav-menu {
            list-style: none;
        }
        
        .nav-item {
            display: block;
            padding: 1rem 2rem;
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            transition: all 0.3s;
            border-left: 3px solid transparent;
        }
        
        .nav-item:hover, .nav-item.active {
            background: rgba(139,92,246,0.1);
            color: #8B5CF6;
            border-left-color: #8B5CF6;
        }
        
        .sidebar-footer {
            padding: 0 2rem;
            margin-top: 2rem;
        }
        
        .btn-logout {
            display: block;
            padding: 0.8rem;
            background: rgba(255,87,87,0.2);
            border: 2px solid #FF5757;
            border-radius: 8px;
            color: #FF5757;
            text-align: center;
            text-decoration: none;
            transition: all 0.3s;
            font-weight: 600;
        }
        
        .btn-logout:hover {
            background: rgba(255,87,87,0.3);
            transform: translateX(5px);
        }
        
        /* Main Content */
        .main-content {
            padding: 3rem 4rem;
            overflow-y: auto;
            max-width: 1600px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3rem;
            padding-bottom: 1.5rem;
            border-bottom: 2px solid rgba(139,92,246,0.2);
        }
        
        .page-title {
            font-size: 3rem;
            background: linear-gradient(135deg, #8B5CF6 0%, #06FFF0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
        }
        
        .user-badge {
            background: rgba(139,92,246,0.2);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            border: 1px solid rgba(139,92,246,0.4);
            font-size: 0.9rem;
        }
        
        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        
        .stat-card {
            background: linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(6,255,240,0.05) 100%);
            border: 2px solid rgba(139,92,246,0.3);
            border-radius: 16px;
            padding: 2rem;
            transition: all 0.3s;
            text-align: center;
            min-height: 150px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(139,92,246,0.3);
            border-color: #8B5CF6;
        }
        
        .stat-icon {
            font-size: 3rem;
            margin-bottom: 0.8rem;
            filter: drop-shadow(0 0 10px rgba(139,92,246,0.5));
        }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #8B5CF6;
            margin-bottom: 0.8rem;
            line-height: 1;
        }
        
        .stat-label {
            color: rgba(255,255,255,0.7);
            font-size: 1rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Message */
        .message {
            padding: 1rem 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            animation: slideIn 0.3s ease-out;
        }
        
        .message.success {
            background: linear-gradient(135deg, rgba(0,255,136,0.2) 0%, rgba(0,255,136,0.1) 100%);
            border: 2px solid #00FF88;
            color: #00FF88;
        }
        
        @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        /* Section */
        .section {
            background: rgba(11,15,22,0.6);
            border: 2px solid rgba(139,92,246,0.2);
            border-radius: 16px;
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .section-title {
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            color: #8B5CF6;
        }
        
        /* Table */
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .table th {
            background: rgba(139,92,246,0.1);
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid rgba(139,92,246,0.3);
        }
        
        .table td {
            padding: 1rem;
            border-bottom: 1px solid rgba(139,92,246,0.1);
        }
        
        .table tr:hover {
            background: rgba(139,92,246,0.05);
        }
        
        /* Badge */
        .badge {
            display: inline-block;
            padding: 0.3rem 0.8rem;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .badge-gaming { background: rgba(6,255,240,0.2); color: #06FFF0; }
        .badge-security { background: rgba(255,87,87,0.2); color: #FF5757; }
        .badge-system { background: rgba(255,193,7,0.2); color: #FFC107; }
        .badge-active { background: rgba(0,255,136,0.2); color: #00FF88; }
        .badge-inactive { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); }
        
        /* Buttons */
        .btn {
            display: inline-block;
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #8B5CF6 0%, #06FFF0 100%);
            color: #000;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(139,92,246,0.4);
        }
        
        .btn-edit {
            background: rgba(6,255,240,0.2);
            color: #06FFF0;
            border: 1px solid rgba(6,255,240,0.4);
        }
        
        .btn-delete {
            background: rgba(255,87,87,0.2);
            color: #FF5757;
            border: 1px solid rgba(255,87,87,0.4);
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        /* Form */
        .form-grid {
            display: grid;
            gap: 1.5rem;
        }
        
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .form-label {
            color: rgba(255,255,255,0.8);
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .form-input, .form-textarea, .form-select {
            padding: 0.8rem 1rem;
            background: rgba(11,15,22,0.8);
            border: 2px solid rgba(139,92,246,0.2);
            border-radius: 8px;
            color: #fff;
            font-family: inherit;
            font-size: 1rem;
            transition: all 0.3s;
        }
        
        .form-input:focus, .form-textarea:focus, .form-select:focus {
            outline: none;
            border-color: #8B5CF6;
            box-shadow: 0 0 0 3px rgba(139,92,246,0.2);
        }
        
        .form-textarea {
            resize: vertical;
            min-height: 120px;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .checkbox-wrapper {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .checkbox-wrapper input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
        }
        
        /* Utilities */
        .hidden { display: none !important; }
        .text-center { text-align: center; }
        .mt-2 { margin-top: 2rem; }
        .mb-2 { margin-bottom: 2rem; }
    </style>
</head>
<body>
    <div class="cms-wrapper">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo-area">
                    <div class="logo-icon">⚡</div>
                    <div class="logo-text">
                        <h1>PS-CMS</h1>
                        <p>Script Manager</p>
                    </div>
                </div>
            </div>
            
            <nav>
                <ul class="nav-menu">
                    <li><a href="#" class="nav-item active" onclick="showSection('dashboard'); return false;">📊 Dashboard</a></li>
                    <li><a href="#" class="nav-item" onclick="showSection('scripts'); return false;">📝 Scripts (<?= $total_scripts ?>)</a></li>
                    <li><a href="#" class="nav-item" onclick="showSection('add'); return false;">➕ Neues Script</a></li>
                    <li><a href="#" class="nav-item" onclick="showSection('stats'); return false;">📈 Statistiken</a></li>
                </ul>
            </nav>
            
            <div class="sidebar-footer">
                <a href="?logout=1" class="btn-logout">🚪 Abmelden</a>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="main-content">
            <div class="header">
                <h1 class="page-title" id="pageTitle">Dashboard</h1>
                <div class="user-badge">👤 Admin</div>
            </div>
            
            <?php if ($message): ?>
                <div class="message <?= $message_type ?>"><?= $message ?></div>
            <?php endif; ?>
            
            <!-- Dashboard Section -->
            <div id="section-dashboard" class="content-section">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📝</div>
                        <div class="stat-value"><?= $total_scripts ?></div>
                        <div class="stat-label">Scripts Total</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value"><?= $active_scripts ?></div>
                        <div class="stat-label">Aktive Scripts</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⬇️</div>
                        <div class="stat-value"><?= number_format($total_downloads) ?></div>
                        <div class="stat-label">Downloads</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">👁️</div>
                        <div class="stat-value"><?= number_format($total_views) ?></div>
                        <div class="stat-label">Views</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value"><?= number_format($avg_rating, 1) ?></div>
                        <div class="stat-label">Ø Rating</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📁</div>
                        <div class="stat-value"><?= count($categories) ?></div>
                        <div class="stat-label">Kategorien</div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="section-title">🔥 Neueste Scripts</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Kategorie</th>
                                <th>Downloads</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            $recent = array_slice(array_reverse($scripts), 0, 5);
                            foreach ($recent as $s):
                            ?>
                                <tr>
                                    <td><strong><?= htmlspecialchars($s['name']) ?></strong></td>
                                    <td><span class="badge badge-<?= strtolower($s['category']) ?>"><?= htmlspecialchars($s['category']) ?></span></td>
                                    <td><?= number_format($s['downloads']) ?></td>
                                    <td><span class="badge <?= $s['active'] ? 'badge-active' : 'badge-inactive' ?>"><?= $s['active'] ? '✅ Aktiv' : '⏸️ Inaktiv' ?></span></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Scripts List Section -->
            <div id="section-scripts" class="content-section hidden">
                <div class="section">
                    <h2 class="section-title">📝 Alle Scripts</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Kategorie</th>
                                <th>Version</th>
                                <th>👁️ Views</th>
                                <th>⬇️ Downloads</th>
                                <th>⭐ Rating</th>
                                <th>💬 Kommentare</th>
                                <th>💎 Premium</th>
                                <th>Status</th>
                                <th>Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($scripts as $s): ?>
                                <tr>
                                    <td><strong><?= htmlspecialchars($s['name']) ?></strong></td>
                                    <td><span class="badge badge-<?= strtolower($s['category']) ?>"><?= htmlspecialchars($s['category']) ?></span></td>
                                    <td><?= htmlspecialchars($s['version']) ?></td>
                                    <td><span style="color: #06FFF0; font-weight: 600;"><?= number_format($s['views'] ?? 0) ?></span></td>
                                    <td><span style="color: #00FF88; font-weight: 600;"><?= number_format($s['downloads'] ?? 0) ?></span></td>
                                    <td>⭐ <?= number_format($s['rating'] ?? 0, 1) ?> <span style="color: rgba(255,255,255,0.5);">(<?= $s['rating_count'] ?? 0 ?>)</span></td>
                                    <td><span style="color: #8B5CF6; font-weight: 600;"><?= count($s['comments'] ?? []) ?></span></td>
                                    <td>
                                        <?php if (!empty($s['is_premium'])): ?>
                                            <span style="color: #FFD700; font-weight: 700;">💎 €<?= number_format($s['price'] ?? 0, 2) ?></span>
                                        <?php else: ?>
                                            <span style="color: rgba(255,255,255,0.3);">-</span>
                                        <?php endif; ?>
                                    </td>
                                    <td><span class="badge <?= $s['active'] ? 'badge-active' : 'badge-inactive' ?>"><?= $s['active'] ? '✅' : '⏸️' ?></span></td>
                                    <td>
                                        <button class="btn btn-edit" onclick='editScript(<?= json_encode($s) ?>)'>✏️</button>
                                        <form method="POST" style="display: inline;" onsubmit="return confirm('Wirklich löschen?')">
                                            <input type="hidden" name="delete" value="<?= $s['id'] ?>">
                                            <button type="submit" class="btn btn-delete">🗑️</button>
                                        </form>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Add/Edit Section -->
            <div id="section-add" class="content-section hidden">
                <div class="section">
                    <h2 class="section-title" id="formTitle">➕ Neues Script erstellen</h2>
                    <form method="POST" enctype="multipart/form-data" id="scriptForm" class="form-grid">
                        <input type="hidden" name="id" id="script_id">
                        <input type="hidden" name="downloads" id="script_downloads" value="0">
                        <input type="hidden" name="views" id="script_views" value="0">
                        <input type="hidden" name="rating" id="script_rating" value="0">
                        <input type="hidden" name="rating_count" id="script_rating_count" value="0">
                        <input type="hidden" name="created" id="script_created">
                        
                        <div class="form-group">
                            <label class="form-label">Script Name *</label>
                            <input type="text" name="name" id="script_name" class="form-input" required placeholder="z.B. Gaming PC Turbo Cleaner">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Kategorie *</label>
                                <select name="category" id="script_category" class="form-select" required>
                                    <option value="Gaming">🎮 Gaming</option>
                                    <option value="Security">🛡️ Security</option>
                                    <option value="System">⚙️ System</option>
                                    <option value="Automation">🤖 Automation</option>
                                    <option value="Network">🌐 Network</option>
                                    <option value="Tools">🔧 Tools</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Version *</label>
                                <input type="text" name="version" id="script_version" class="form-input" required placeholder="1.0">
                            </div>
                            <div class="form-group">
                                <label class="form-label">PS Version *</label>
                                <input type="text" name="ps_version" id="script_ps_version" class="form-input" required placeholder="5.1+">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Beschreibung *</label>
                            <textarea name="description" id="script_description" class="form-textarea" required placeholder="Beschreibe was das Script macht..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Features (eine pro Zeile)</label>
                            <textarea name="features" id="script_features" class="form-textarea" placeholder="Bereinigt Temp-Dateien&#10;Optimiert RAM&#10;Gaming Performance Boost"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Tags (kommasepariert)</label>
                            <input type="text" name="tags" id="script_tags" class="form-input" placeholder="Gaming, Performance, Cleaner">
                        </div>
                        
        <div class="form-group">
            <label class="form-label">Script-Datei (.ps1 oder .zip für komplexe Scripts)</label>
            <input type="file" name="script_file" accept=".ps1,.zip" class="form-input">
            <small style="color: rgba(255,255,255,0.5);">
                💡 <strong>.ps1</strong> für einzelne Scripts | <strong>.zip</strong> für Scripts mit mehreren Dateien/Modulen<br>
                Bei ZIP: Haupt-Script sollte <code>main.ps1</code> oder <code>install.ps1</code> heißen
            </small>
        </div>
        
        <div style="display: flex; gap: 2rem;">
            <div class="checkbox-wrapper">
                <input type="checkbox" name="active" id="script_active" checked>
                <label for="script_active" class="form-label">✅ Script ist aktiv (auf Website sichtbar)</label>
            </div>
            
            <div class="checkbox-wrapper">
                <input type="checkbox" name="is_premium" id="script_premium" onchange="togglePriceField()">
                <label for="script_premium" class="form-label">💎 Premium Script (kostenpflichtig)</label>
            </div>
        </div>
        
        <div class="form-group" id="priceField" style="display: none;">
            <label class="form-label">💶 Preis in EUR</label>
            <input type="number" name="price" id="script_price" class="form-input" step="0.01" min="0" placeholder="9.99">
            <small style="color: rgba(255,255,255,0.5);">Preis für das Premium-Script (z.B. 9.99 für 9,99€)</small>
        </div>
                        
                        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                            <button type="submit" name="save_script" class="btn btn-primary">💾 Speichern</button>
                            <button type="button" class="btn btn-edit" onclick="resetForm()">🔄 Zurücksetzen</button>
                        </div>
                    </form>
                </div>
            </div>
            
            <!-- Stats Section -->
            <div id="section-stats" class="content-section hidden">
                <div class="section">
                    <h2 class="section-title">📊 Kategorien-Verteilung</h2>
                    <div style="display: grid; gap: 1rem;">
                        <?php foreach ($categories as $cat => $count): ?>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <span style="min-width: 120px; font-weight: 600;"><?= htmlspecialchars($cat) ?></span>
                                <div style="flex: 1; height: 30px; background: rgba(139,92,246,0.1); border-radius: 8px; overflow: hidden; border: 1px solid rgba(139,92,246,0.3);">
                                    <div style="height: 100%; background: linear-gradient(90deg, #8B5CF6 0%, #06FFF0 100%); width: <?= ($count / $total_scripts) * 100 ?>%; display: flex; align-items: center; justify-content: center; color: #000; font-weight: 700; font-size: 0.85rem;">
                                        <?= $count ?>
                                    </div>
                                </div>
                                <span style="min-width: 50px; text-align: right; color: #8B5CF6; font-weight: 700;"><?= round(($count / $total_scripts) * 100) ?>%</span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                
                <div class="section mt-2">
                    <h2 class="section-title">🏆 Top 10 Downloads</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Downloads</th>
                                <th>Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            $sorted = $scripts;
                            usort($sorted, function($a, $b) { return $b['downloads'] - $a['downloads']; });
                            foreach (array_slice($sorted, 0, 10) as $i => $s):
                            ?>
                                <tr>
                                    <td><strong><?= $i + 1 ?></strong></td>
                                    <td><?= htmlspecialchars($s['name']) ?></td>
                                    <td><?= number_format($s['downloads']) ?></td>
                                    <td>⭐ <?= number_format($s['rating'], 1) ?></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
    
    <script>
        // Section Navigation
        function showSection(section) {
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
            
            // Show selected section
            document.getElementById('section-' + section).classList.remove('hidden');
            
            // Update nav
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            event.target.classList.add('active');
            
            // Update title
            const titles = {
                'dashboard': 'Dashboard',
                'scripts': 'Alle Scripts',
                'add': 'Neues Script',
                'stats': 'Statistiken'
            };
            document.getElementById('pageTitle').textContent = titles[section];
        }
        
        // Edit Script
        function editScript(script) {
            showSection('add');
            document.getElementById('formTitle').textContent = '✏️ Script bearbeiten';
            
            document.getElementById('script_id').value = script.id;
            document.getElementById('script_name').value = script.name;
            document.getElementById('script_category').value = script.category;
            document.getElementById('script_version').value = script.version;
            document.getElementById('script_ps_version').value = script.ps_version;
            document.getElementById('script_description').value = script.description;
            document.getElementById('script_features').value = script.features.join('\n');
            document.getElementById('script_tags').value = script.tags.join(', ');
            document.getElementById('script_downloads').value = script.downloads;
            document.getElementById('script_views').value = script.views;
            document.getElementById('script_rating').value = script.rating;
            document.getElementById('script_rating_count').value = script.rating_count;
            document.getElementById('script_created').value = script.created;
            document.getElementById('script_active').checked = script.active;
            document.getElementById('script_premium').checked = script.is_premium || false;
            document.getElementById('script_price').value = script.price || 0;
            togglePriceField();
        }
        
        // Reset Form
        function resetForm() {
            document.getElementById('scriptForm').reset();
            document.getElementById('script_id').value = '';
            document.getElementById('formTitle').textContent = '➕ Neues Script erstellen';
            togglePriceField();
        }
        
        // Toggle Price Field based on Premium checkbox
        function togglePriceField() {
            const isPremium = document.getElementById('script_premium').checked;
            const priceField = document.getElementById('priceField');
            priceField.style.display = isPremium ? 'block' : 'none';
        }
    </script>
</body>
</html>



