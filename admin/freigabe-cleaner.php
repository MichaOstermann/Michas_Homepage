<?php
// Automatisches Entfernen von Demo-Schutz nach Freigabe
// Aufruf: ?template=business-pro.zip

$freigegebenDir = '../templates/freigegeben/';
$template = isset($_GET['template']) ? $_GET['template'] : '';

if (!$template || !file_exists($freigegebenDir . $template)) {
    echo "<p style='color:red;'>Template nicht gefunden!</p>";
    exit;
}

// Entpacken
$zip = new ZipArchive;
$extractPath = $freigegebenDir . pathinfo($template, PATHINFO_FILENAME) . '/';
if ($zip->open($freigegebenDir . $template) === TRUE) {
    $zip->extractTo($extractPath);
    $zip->close();
    echo "<p style='color:green;'>Template entpackt!</p>";
} else {
    echo "<p style='color:red;'>Fehler beim Entpacken!</p>";
    exit;
}

// Demo-Schutz automatisch entfernen
$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($extractPath)
);
foreach ($files as $file) {
    if ($file->isFile() && preg_match('/\.(html|htm|js|css)$/i', $file->getFilename())) {
        $content = file_get_contents($file->getPathname());
        // Entferne typische Demo-Schutz-Komponenten
        $content = preg_replace('/<div[^>]*class=["\"][^\"]*demo[^\"]*["\"][^>]*>.*?<\/div>/is', '', $content); // Demo-Banner
        $content = preg_replace('/Geschützte Demo.*?Vorschau.*?kopiert.*?archiviert.*?werden\./is', '', $content); // Hinweistext
        $content = preg_replace('/if\s*\(window\.location\.pathname.*?{.*?}/is', '', $content); // JS-Sperrlogik
        file_put_contents($file->getPathname(), $content);
    }
}
echo "<p style='color:green;'>Demo-Schutz entfernt! Dateien sind jetzt bearbeitbar.</p>";
?>
