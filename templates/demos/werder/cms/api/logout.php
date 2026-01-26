<?php
session_start();

header('Content-Type: application/json');

// Session zerstören
session_destroy();

echo json_encode([
    'success' => true,
    'message' => 'Erfolgreich abgemeldet!'
]);



