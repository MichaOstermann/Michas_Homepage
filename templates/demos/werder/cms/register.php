<?php
$users_file = __DIR__ . '/data/users.json';
$data_dir = __DIR__ . '/data';

if (!is_dir($data_dir)) mkdir($data_dir, 0755, true);

$success = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $password_confirm = $_POST['password_confirm'] ?? '';
    $email = trim($_POST['email'] ?? '');
    
    if (empty($username) || empty($password) || empty($email)) {
        $error = 'Alle Felder müssen ausgefüllt werden!';
    } elseif ($password !== $password_confirm) {
        $error = 'Passwörter stimmen nicht überein!';
    } elseif (strlen($password) < 6) {
        $error = 'Passwort muss mindestens 6 Zeichen lang sein!';
    } else {
        $users = [];
        if (file_exists($users_file)) {
            $users = json_decode(file_get_contents($users_file), true);
        }
        
        if (isset($users[$username])) {
            $error = 'Benutzername bereits vergeben!';
        } else {
            $users[$username] = [
                'password' => password_hash($password, PASSWORD_DEFAULT),
                'email' => $email,
                'approved' => false,
                'created' => date('Y-m-d H:i:s')
            ];
            
            file_put_contents($users_file, json_encode($users, JSON_PRETTY_PRINT));
            $success = true;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Werder CMS Registrierung</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0B0F16 0%, #1D9A50 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .register-container {
            background: rgba(255, 255, 255, 0.95);
            padding: 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
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
        .success {
            background: #e8f5e9;
            color: #2e7d32;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            text-align: center;
        }
        .success h3 {
            margin-bottom: 0.5rem;
        }
        .login-link {
            text-align: center;
            margin-top: 1.5rem;
            color: #666;
        }
        .login-link a {
            color: #1D9A50;
            text-decoration: none;
            font-weight: 600;
        }
        .info-box {
            background: #e3f2fd;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            color: #1565c0;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="register-container">
        <div class="logo">
            <h1>⚽ Werder CMS</h1>
            <p>Registrierung</p>
        </div>
        
        <?php if ($success): ?>
            <div class="success">
                <h3>✅ Registrierung erfolgreich!</h3>
                <p>Dein Account wurde erstellt und wartet auf die Freigabe durch den Administrator.</p>
                <p style="margin-top: 1rem;"><a href="index.php" style="color: #1D9A50; font-weight: 600;">Zum Login →</a></p>
            </div>
        <?php else: ?>
            <div class="info-box">
                ℹ️ Nach der Registrierung muss dein Account vom Administrator freigegeben werden, bevor du dich anmelden kannst.
            </div>
            
            <?php if ($error): ?>
                <div class="error"><?= htmlspecialchars($error) ?></div>
            <?php endif; ?>
            
            <form method="post">
                <div class="form-group">
                    <label>Benutzername</label>
                    <input type="text" name="username" required autofocus>
                </div>
                <div class="form-group">
                    <label>E-Mail</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Passwort (min. 6 Zeichen)</label>
                    <input type="password" name="password" required>
                </div>
                <div class="form-group">
                    <label>Passwort bestätigen</label>
                    <input type="password" name="password_confirm" required>
                </div>
                <button type="submit">Registrieren</button>
            </form>
            
            <div class="login-link">
                Schon registriert? <a href="index.php">Zum Login</a>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>



