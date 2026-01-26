<?php
header('Content-Type: application/json; charset=UTF-8');

$baseDir = __DIR__;
$audioDir = $baseDir . DIRECTORY_SEPARATOR . 'audio';
$tracksJson = $baseDir . DIRECTORY_SEPARATOR . 'tracks.json';
$tracks = [];

function slugify_beta($str) {
  if (function_exists('iconv')) {
    $tmp = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $str);
    if ($tmp !== false) $str = $tmp;
  }
  $s = preg_replace('~[^a-zA-Z0-9]+~', '-', (string)$str);
  $s = strtolower(trim($s, '-'));
  return $s !== '' ? $s : 'n-a';
}

if (!is_dir($audioDir)) {
  @mkdir($audioDir, 0775, true);
}

try {
  $rii = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($audioDir, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
  );
  foreach ($rii as $f) {
    if (!$f->isFile()) continue;
    $ext = strtolower(pathinfo($f->getFilename(), PATHINFO_EXTENSION));
    if ($ext !== 'mp3') continue;
    $full = $f->getPathname();
    $rel = str_replace($baseDir . DIRECTORY_SEPARATOR, '', $full);
    $rel = str_replace(DIRECTORY_SEPARATOR, '/', $rel); // Musik_beta/audio/....
    $title = pathinfo($f->getFilename(), PATHINFO_FILENAME);
    $tracks[] = [
      'id' => slugify_beta($title),
      'title' => $title,
      'category' => 'gemischt',
      'description' => '',
      'cover' => 'cover-default.svg',
      'audio' => basename($rel),
      'folder' => 'Musik_beta/audio'
    ];
  }
  usort($tracks, function($a,$b){ return strcmp($a['title'], $b['title']); });
} catch (Exception $e) {
  echo json_encode(['tracks'=>[],'error'=>'scan failed']);
  exit;
}

$payload = ['tracks' => $tracks];
echo json_encode($payload, JSON_UNESCAPED_UNICODE);

if (isset($_GET['save']) && $_GET['save'] === '1') {
  $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
  if ($json !== false) {
    @file_put_contents($tracksJson, $json, LOCK_EX);
  }
}

