<?php

header('Content-Type: application/json');

$token = '8415875616:AAE9gpZU3IfuAIngJcF401gElUNkC5A3eD8';

$user_id = intval($_GET['user_id']);

// 1. Получаение фото профиля

$photos = file_get_contents("https://api.telegram.org/bot{$token}/getUserProfilePhotos?user_id={$user_id}&limit=1");
$photos = json_decode($photos, true);

$file_id = $photos['result']['photos'][0][0]['file_id'];

// 2. Получаем путь к фотографии

$file = file_get_contents("https://api.telegram.org/bot{$token}/getFile?file_id={$file_id}");
$file = json_decode($file, true);

$file_path = $file['result']['file_path'];

$avatar_url = "https://api.telegram.org/file/bot{$token}/{$file_path}";

echo json_encode(['ok' => true, 'avatar_url' => $avatar_url]);