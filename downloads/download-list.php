<?php
// download-list.php
$dir = __DIR__;
$files = glob($dir . '/*.zip');
echo "<h2>Verfügbare Templates</h2><ul>";
foreach ($files as $file) {
    $name = basename($file);
    echo "<li><a href='$name' download>$name</a></li>";
}
echo "</ul>";
?>
