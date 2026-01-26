<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['csrf'])) {
	$_SESSION['csrf'] = bin2hex(random_bytes(16));
}

echo json_encode(['token' => $_SESSION['csrf']]);


