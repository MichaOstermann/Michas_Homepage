<?php
session_start();

$configFile = __DIR__ . '/config/config.php';
if (!file_exists($configFile)) {
    http_response_code(500);
    echo 'Konfigurationsdatei fehlt: config/config.php';
    exit;
}
require_once $configFile;

if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
    header('Location: manage.php');
    exit;
}

if (!isset($_SESSION['csrf_manage'])) {
    $_SESSION['csrf_manage'] = bin2hex(random_bytes(16));
}
$csrfToken = $_SESSION['csrf_manage'];

$baseDir = __DIR__;
$commentsDir = $baseDir . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'comments';
if (!is_dir($commentsDir)) {
    @mkdir($commentsDir, 0775, true);
}

$tracksJson = $baseDir . DIRECTORY_SEPARATOR . 'tracks.json';
$songTitles = [];
if (file_exists($tracksJson)) {
    $tracksData = json_decode(@file_get_contents($tracksJson), true);
    if (is_array($tracksData) && isset($tracksData['tracks'])) {
        foreach ($tracksData['tracks'] as $track) {
            if (!isset($track['id'])) continue;
            $songTitles[$track['id']] = [
                'title' => $track['title'] ?? $track['id'],
                'category' => $track['category'] ?? ''
            ];
        }
    }
}

function sanitize_song_id(string $songId): string {
    $clean = preg_replace('/[^a-zA-Z0-9_-]/', '', $songId);
    return substr((string)$clean, 0, 120);
}

function load_comments(string $filePath): array {
    if (!file_exists($filePath)) {
        return ['pending' => [], 'approved' => []];
    }
    $raw = @file_get_contents($filePath);
    if ($raw === false) {
        return ['pending' => [], 'approved' => []];
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return ['pending' => [], 'approved' => []];
    }
    return [
        'pending' => array_values(is_array($decoded['pending'] ?? []) ? $decoded['pending'] : []),
        'approved' => array_values(is_array($decoded['approved'] ?? []) ? $decoded['approved'] : [])
    ];
}

function save_comments(string $filePath, array $data): bool {
    $normalized = [
        'pending' => array_values(is_array($data['pending'] ?? []) ? $data['pending'] : []),
        'approved' => array_values(is_array($data['approved'] ?? []) ? $data['approved'] : [])
    ];
    $json = json_encode($normalized, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return $json !== false && @file_put_contents($filePath, $json, LOCK_EX) !== false;
}

function h($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function format_datetime(?string $iso): string {
    if (!$iso) return '';
    try {
        $dt = new DateTime($iso);
        return $dt->setTimezone(new DateTimeZone('Europe/Berlin'))->format('d.m.Y, H:i');
    } catch (Exception $e) {
        return $iso;
    }
}

function flash(string $message, string $type = 'success'): void {
    $_SESSION['comments_flash'] = ['message' => $message, 'type' => $type];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf']) || !hash_equals($csrfToken, (string)$_POST['csrf'])) {
        flash('Ungültiges Sicherheits-Token.', 'error');
        header('Location: comments-manage.php');
        exit;
    }

    $action = $_POST['action'] ?? '';
    $songId = sanitize_song_id((string)($_POST['songId'] ?? ''));
    $commentId = (string)($_POST['commentId'] ?? '');

    if ($songId === '' || $commentId === '') {
        flash('Song oder Kommentar nicht gefunden.', 'error');
        header('Location: comments-manage.php');
        exit;
    }

    $filePath = $commentsDir . DIRECTORY_SEPARATOR . $songId . '.json';
    $data = load_comments($filePath);
    $changed = false;

    if ($action === 'approve') {
        foreach ($data['pending'] as $idx => $item) {
            if (($item['id'] ?? null) === $commentId) {
                $approvedItem = $item;
                $approvedItem['status'] = 'approved';
                $approvedItem['approvedAt'] = gmdate('c');
                $data['approved'][] = $approvedItem;
                unset($data['pending'][$idx]);
                $data['pending'] = array_values($data['pending']);
                $changed = true;
                flash('Kommentar wurde freigegeben.');
                break;
            }
        }
        if (!$changed) {
            flash('Kommentar nicht im Bereich "Wartend" gefunden.', 'error');
        }
    } elseif ($action === 'delete') {
        $status = $_POST['status'] ?? 'pending';
        if ($status === 'approved') {
            foreach ($data['approved'] as $idx => $item) {
                if (($item['id'] ?? null) === $commentId) {
                    unset($data['approved'][$idx]);
                    $data['approved'] = array_values($data['approved']);
                    $changed = true;
                    flash('Kommentar wurde gelöscht.');
                    break;
                }
            }
        } else {
            foreach ($data['pending'] as $idx => $item) {
                if (($item['id'] ?? null) === $commentId) {
                    unset($data['pending'][$idx]);
                    $data['pending'] = array_values($data['pending']);
                    $changed = true;
                    flash('Kommentar wurde entfernt.');
                    break;
                }
            }
        }
        if (!$changed) {
            flash('Kommentar konnte nicht gefunden werden.', 'error');
        }
    } else {
        flash('Unbekannte Aktion.', 'error');
    }

    if ($changed) {
        if (!save_comments($filePath, $data)) {
            flash('Kommentar konnte nicht gespeichert werden.', 'error');
        }
    }

    header('Location: comments-manage.php');
    exit;
}

$pendingComments = [];
$approvedComments = [];

$files = @glob($commentsDir . DIRECTORY_SEPARATOR . '*.json');
if ($files) {
    foreach ($files as $file) {
        $songId = basename($file, '.json');
        $comments = load_comments($file);
        foreach ($comments['pending'] as $item) {
            $pendingComments[] = [
                'songId' => $songId,
                'comment' => $item
            ];
        }
        foreach ($comments['approved'] as $item) {
            $approvedComments[] = [
                'songId' => $songId,
                'comment' => $item
            ];
        }
    }
}

usort($pendingComments, function($a, $b) {
    return strcmp($b['comment']['createdAt'] ?? '', $a['comment']['createdAt'] ?? '');
});

usort($approvedComments, function($a, $b) {
    return strcmp($b['comment']['approvedAt'] ?? $b['comment']['createdAt'] ?? '', $a['comment']['approvedAt'] ?? $a['comment']['createdAt'] ?? '');
});

$flash = $_SESSION['comments_flash'] ?? null;
unset($_SESSION['comments_flash']);

function render_song_label(string $songId, array $songTitles): string {
    $info = $songTitles[$songId] ?? ['title' => $songId, 'category' => ''];
    $label = $info['title'] ?? $songId;
    $category = $info['category'] ?? '';
    if ($category !== '') {
        return sprintf('%s <span class="badge">%s</span>', h($label), h(ucfirst($category)));
    }
    return h($label);
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kommentare verwalten – Musik</title>
    <link rel="icon" type="image/svg+xml" href="../assets/media/favicon.svg" />
    <link rel="stylesheet" href="../assets/css/styles.css" />
    <style>
        body { background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%); }
        .manage-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .comment-list { display: grid; gap: 1rem; }
        .comment-card {
            background: linear-gradient(135deg, rgba(11,15,22,0.9) 0%, rgba(20,20,30,0.9) 100%);
            border: 2px solid rgba(6,255,240,0.2);
            border-radius: 12px;
            padding: 1.5rem;
            display: grid;
            gap: 1rem;
        }
        .comment-card.pending { border-color: rgba(255,140,0,0.5); }
        .comment-card.approved { border-color: rgba(0,255,136,0.4); }
        .comment-meta { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; font-size: 0.9rem; }
        .comment-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .btn-approve { padding: 0.6rem 1.25rem; border-radius: 8px; border: 2px solid rgba(0,255,136,0.5); background: rgba(0,255,136,0.15); color: #00FF88; font-weight: 600; cursor: pointer; }
        .btn-delete { padding: 0.6rem 1.25rem; border-radius: 8px; border: 2px solid rgba(255,0,110,0.4); background: rgba(255,0,110,0.12); color: #FF006E; font-weight: 600; cursor: pointer; }
        .badge { display: inline-flex; align-items: center; justify-content: center; padding: 0.2rem 0.6rem; border-radius: 999px; background: rgba(6,255,240,0.2); border: 1px solid rgba(6,255,240,0.3); font-size: 0.75rem; margin-left: 0.5rem; }
        .flash { padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; }
        .flash.success { background: rgba(0,255,136,0.15); border: 2px solid rgba(0,255,136,0.35); color: #00FF88; }
        .flash.error { background: rgba(255,0,110,0.15); border: 2px solid rgba(255,0,110,0.35); color: #FF4D8D; }
        .empty-state { padding: 2rem; text-align: center; opacity: 0.6; border: 2px dashed rgba(6,255,240,0.2); border-radius: 12px; }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav container">
            <a class="nav__logo" href="./manage.php">← Zurück zur Verwaltung</a>
        </nav>
    </header>
    <main class="main" style="padding-top: 6rem;">
        <div class="manage-container">
            <div class="header-row">
                <div>
                    <h1 style="margin: 0; background: linear-gradient(135deg, #06FFF0 0%, #8B5CF6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">💬 Kommentar-Moderation</h1>
                    <p class="txt-dim" style="margin-top: 0.35rem;">Freigeben, löschen und den Überblick behalten.</p>
                </div>
                <div class="btn-group" style="display:flex; gap:0.75rem;">
                    <a class="btn btn--glass" href="manage.php">🎵 Songs</a>
                    <a class="btn btn--glass" href="comments-manage.php" aria-current="page">💬 Kommentare</a>
                </div>
            </div>

            <?php if ($flash): ?>
                <div class="flash <?= h($flash['type'] ?? 'success') ?>"><?= h($flash['message'] ?? '') ?></div>
            <?php endif; ?>

            <section style="margin-bottom: 3rem;">
                <h2 style="color: #FF9800; margin-bottom: 1rem;">⏳ Wartet auf Freigabe (<?= count($pendingComments) ?>)</h2>
                <?php if (!count($pendingComments)): ?>
                    <div class="empty-state">Keine Kommentare warten aktuell auf Freigabe.</div>
                <?php else: ?>
                    <div class="comment-list">
                        <?php foreach ($pendingComments as $item): $comment = $item['comment']; $songId = $item['songId']; ?>
                            <article class="comment-card pending">
                                <div class="comment-meta">
                                    <div><?= render_song_label($songId, $songTitles) ?></div>
                                    <div>
                                        <span class="txt-dim">Erstellt:</span> <?= h(format_datetime($comment['createdAt'] ?? '')) ?>
                                    </div>
                                </div>
                                <div>
                                    <strong><?= h($comment['name'] ?? 'Anonym') ?></strong>
                                    <div class="txt-dim" style="font-size:0.8rem; margin-top:0.25rem;">ID: <?= h($comment['id'] ?? '') ?></div>
                                    <?php if (!empty($comment['ipHash'])): ?>
                                        <div class="txt-dim" style="font-size:0.75rem; margin-top:0.15rem;">IP Hash: <?= h($comment['ipHash']) ?></div>
                                    <?php endif; ?>
                                </div>
                                <div style="line-height:1.6;"><?= nl2br(h($comment['message'] ?? '')) ?></div>
                                <div class="comment-actions">
                                    <form method="post">
                                        <input type="hidden" name="csrf" value="<?= h($csrfToken) ?>">
                                        <input type="hidden" name="action" value="approve">
                                        <input type="hidden" name="songId" value="<?= h($songId) ?>">
                                        <input type="hidden" name="commentId" value="<?= h($comment['id'] ?? '') ?>">
                                        <button type="submit" class="btn-approve">✓ Freigeben</button>
                                    </form>
                                    <form method="post" onsubmit="return confirm('Kommentar wirklich löschen?');">
                                        <input type="hidden" name="csrf" value="<?= h($csrfToken) ?>">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="status" value="pending">
                                        <input type="hidden" name="songId" value="<?= h($songId) ?>">
                                        <input type="hidden" name="commentId" value="<?= h($comment['id'] ?? '') ?>">
                                        <button type="submit" class="btn-delete">🗑️ Löschen</button>
                                    </form>
                                </div>
                            </article>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </section>

            <section>
                <h2 style="color: #00FF88; margin-bottom: 1rem;">✅ Freigeschaltet (<?= count($approvedComments) ?>)</h2>
                <?php if (!count($approvedComments)): ?>
                    <div class="empty-state">Noch keine freigegebenen Kommentare.</div>
                <?php else: ?>
                    <div class="comment-list">
                        <?php foreach ($approvedComments as $item): $comment = $item['comment']; $songId = $item['songId']; ?>
                            <article class="comment-card approved">
                                <div class="comment-meta">
                                    <div><?= render_song_label($songId, $songTitles) ?></div>
                                    <div>
                                        <span class="txt-dim">Freigegeben:</span> <?= h(format_datetime($comment['approvedAt'] ?? $comment['createdAt'] ?? '')) ?>
                                    </div>
                                </div>
                                <div>
                                    <strong><?= h($comment['name'] ?? 'Anonym') ?></strong>
                                    <div class="txt-dim" style="font-size:0.8rem; margin-top:0.25rem;">ID: <?= h($comment['id'] ?? '') ?></div>
                                    <?php if (!empty($comment['ipHash'])): ?>
                                        <div class="txt-dim" style="font-size:0.75rem; margin-top:0.15rem;">IP Hash: <?= h($comment['ipHash']) ?></div>
                                    <?php endif; ?>
                                </div>
                                <div style="line-height:1.6;"><?= nl2br(h($comment['message'] ?? '')) ?></div>
                                <div class="comment-actions">
                                    <form method="post" onsubmit="return confirm('Kommentar wirklich löschen?');">
                                        <input type="hidden" name="csrf" value="<?= h($csrfToken) ?>">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="status" value="approved">
                                        <input type="hidden" name="songId" value="<?= h($songId) ?>">
                                        <input type="hidden" name="commentId" value="<?= h($comment['id'] ?? '') ?>">
                                        <button type="submit" class="btn-delete">🗑️ Löschen</button>
                                    </form>
                                </div>
                            </article>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </section>
        </div>
    </main>
</body>
</html>

