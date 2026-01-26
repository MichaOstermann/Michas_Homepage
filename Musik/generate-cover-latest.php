<?php
/**
 * Generate and assign an SVG cover for the latest track in Musik/tracks.json.
 * Usage: open this file in the browser. It will generate covers/<id>.svg and update tracks.json.
 */
header('Content-Type: text/html; charset=UTF-8');

$tracksJson = __DIR__ . '/tracks.json';
$assetsMediaDir = realpath(__DIR__ . '/../assets/media');

function svg_escape($s) {
  return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function u_strlen($s) { return function_exists('mb_strlen') ? mb_strlen($s) : strlen($s); }
function u_substr($s, $start, $len = null) {
  if (function_exists('mb_substr')) return $len === null ? mb_substr($s, $start) : mb_substr($s, $start, $len);
  return $len === null ? substr($s, $start) : substr($s, $start, $len);
}

function category_colors($cat) {
  switch (strtolower($cat)) {
    case 'alpha':    return ['#FFD700', '#FF8C00'];
    case 'party':    return ['#06FFF0', '#8B5CF6'];
    case 'rapp':     return ['#FF006E', '#8B5CF6'];
    case 'love':     return ['#FF1493', '#FF69B4'];
    case 'gemischt': return ['#8B5CF6', '#06FFF0'];
    case 'traurig':  return ['#4A5568', '#718096'];
    case 'synth':    return ['#06FFF0', '#00FF88'];
    case 'lofi':     return ['#8B5CF6', '#06FFF0'];
    case 'ambient':  return ['#00FF88', '#06FFF0'];
    default:         return ['#8B5CF6', '#06FFF0'];
  }
}

function svg_wrap_lines($text, $maxLen = 18) {
  $text = preg_replace('/\s+/', ' ', trim($text));
  if ($text === '') return ['New Track'];
  $words = explode(' ', $text);
  $lines = [];
  $line = '';
  foreach ($words as $w) {
    if (u_strlen($line . ' ' . $w) <= $maxLen || $line === '') {
      $line = ($line === '') ? $w : ($line . ' ' . $w);
    } else {
      $lines[] = $line;
      $line = $w;
    }
  }
  if ($line !== '') $lines[] = $line;
  if (count($lines) > 3) {
    $lines = array_slice($lines, 0, 3);
    $last = $lines[2];
    if (u_strlen($last) > $maxLen - 1) {
      $last = u_substr($last, 0, $maxLen - 1) . '…';
    }
    $lines[2] = $last;
  }
  return $lines;
}

function generate_cover_svg($title, $category, $destPath) {
  $display = $title !== '' ? $title : 'New Track';
  $display = svg_escape($display);
  [$c1, $c2] = category_colors($category);
  $lines = svg_wrap_lines($display, 18);
  $lineCount = count($lines);
  $titleFont = 108;
  if ($lineCount === 2) $titleFont = 100;
  if ($lineCount >= 3) $titleFont = 92;

  $startY = 600 - (($lineCount - 1) * ($titleFont + 10)) / 2;
  $tspans = '';
  for ($i = 0; $i < $lineCount; $i++) {
    $y = $startY + $i * ($titleFont + 10);
    $t = svg_escape($lines[$i]);
    $tspans .= '<text x="600" y="' . $y . '" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="' . $titleFont . '" fill="url(#g)" filter="url(#glow)">' . $t . '</text>';
  }
  $categoryText = svg_escape($category);

  $svg = <<<SVG
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{$c1}"/>
      <stop offset="100%" stop-color="{$c2}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1200" height="1200" fill="#0B0F16"/>
  <g opacity="0.08" stroke="url(#g)">
    <path d="M0 200 H1200M0 400 H1200M0 600 H1200M0 800 H1200M0 1000 H1200" />
    <path d="M200 0 V1200M400 0 V1200M600 0 V1200M800 0 V1200M1000 0 V1200" />
  </g>
  <circle cx="950" cy="260" r="160" fill="url(#g)" opacity="0.18" filter="url(#glow)"/>
  {$tspans}
  <text x="600" y="{$startY + $lineCount * ($titleFont + 10) + 40}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="54" fill="#E5E7EB" opacity="0.85">
    Michael Ostermann · {$categoryText}
  </text>
</svg>
SVG;
  return @file_put_contents($destPath, $svg) !== false;
}

function load_tracks($path) {
  if (!file_exists($path)) return [];
  $raw = file_get_contents($path);
  if ($raw === false) return [];
  $json = json_decode($raw, true);
  if (is_array($json) && isset($json['tracks']) && is_array($json['tracks'])) {
    return $json['tracks'];
  }
  if (is_array($json)) return $json;
  return [];
}

function save_tracks($path, $tracks) {
  $content = json_encode($tracks, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
  if ($content === false) throw new Exception('JSON Encoding fehlgeschlagen.');
  $h = fopen($path, 'c+');
  if (!$h) throw new Exception('tracks.json konnte nicht geöffnet werden.');
  if (!flock($h, LOCK_EX)) { fclose($h); throw new Exception('File-Lock fehlgeschlagen.'); }
  ftruncate($h, 0);
  rewind($h);
  fwrite($h, $content);
  fflush($h);
  flock($h, LOCK_UN);
  fclose($h);
}

echo '<!doctype html><html lang="de"><head><meta charset="utf-8"/><title>Cover-Generator</title>';
echo '<style>body{background:#0B0F16;color:#E5E7EB;font-family:system-ui,Segoe UI,Arial;padding:2rem} .ok{color:#10B981} .err{color:#EF4444}</style></head><body>';
echo '<h1>SVG Cover für letzten Track erzeugen</h1>';

try {
  if ($assetsMediaDir === false) throw new Exception('assets/media nicht gefunden.');
  $tracks = load_tracks($tracksJson);
  if (empty($tracks)) throw new Exception('tracks.json leer oder nicht gefunden.');

  // Nimm den letzten Eintrag
  $idx = count($tracks) - 1;
  $track = $tracks[$idx];
  $id = isset($track['id']) ? $track['id'] : '';
  $title = isset($track['title']) ? $track['title'] : 'New Track';
  $cat = isset($track['category']) ? $track['category'] : 'misc';

  $coversDir = $assetsMediaDir . DIRECTORY_SEPARATOR . 'covers';
  if (!is_dir($coversDir)) {
    @mkdir($coversDir, 0775, true);
  }
  if (!is_dir($coversDir)) throw new Exception('covers-Verzeichnis konnte nicht erstellt werden.');

  $coverPath = $coversDir . DIRECTORY_SEPARATOR . $id . '.svg';
  if (!generate_cover_svg($title, $cat, $coverPath)) {
    throw new Exception('SVG konnte nicht geschrieben werden.');
  }

  $tracks[$idx]['cover'] = 'covers/' . $id . '.svg';
  save_tracks($tracksJson, $tracks);

  echo '<p class="ok">✅ Cover erzeugt und eingetragen: assets/media/covers/' . htmlspecialchars($id . '.svg', ENT_QUOTES, 'UTF-8') . '</p>';
  echo '<p><a href="index.html" style="color:#06FFF0">Zur Musik-Seite</a></p>';
} catch (Exception $e) {
  echo '<p class="err">❌ Fehler: ' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . '</p>';
}

echo '</body></html>';

