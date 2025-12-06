<?php

// Устанавливаем заголовки для JSON
header('Content-Type: application/json');

require('config.php');

$token = TOKEN;
$input = file_get_contents('php://input');
// file_put_contents('webhook.log', date('Y-m-d H:i:s') . " - " . $input . "\n\n", FILE_APPEND); // Логируем все входящие данные для отладки

// Если это POST запрос с JSON данными
if (!empty($input) && json_decode($input) !== null) {

    $postData = json_decode($input, true);
    
    if (isset($postData['web_app_data'])) {
        // Логируем
        // file_put_contents('webhook.log', date('Y-m-d H:i:s') . "--- - POST JSON: " . $input . "\n\n", FILE_APPEND);
    
        $webAppData = $postData['web_app_data'];
        $user = $webAppData['user'] ?? [];
        $user_id = $user['id'] ?? 0;
        $user_name = $user['first_name'] ?? 'Пользователь';
        $data = $webAppData['data'] ?? '';

        // file_put_contents('webhook.log', date('Y-m-d H:i:s') . "DATA: " . $data . "\n\n", FILE_APPEND);

        $calculationData = json_decode($data, true);
        
        if ($calculationData && isset($calculationData['action']) && $calculationData['action'] === 'send_calculation') {
            
            $result = handleWebAppData($webAppData);
            echo json_encode(['status' => 'success', 'message' => 'Data received']);
            exit;
        }
    } else {
        
    }
}

// Функция для обработки данных из Web App
function handleWebAppData($webAppData) {
    $user_id = $webAppData['user']['id'] ?? 0;
    $user_name = $webAppData['user']['first_name'] ?? 'Пользователь';
    $user_niсkname = $webAppData['user']['username'] ?? 'не найдено';
    $data = $webAppData['data'] ?? '';
    
    $calculationData = json_decode($data, true);
    // file_put_contents('webhook.log', date('Y-m-d H:i:s') . " - " . $data . "\n\n", FILE_APPEND);

    if ($calculationData && isset($calculationData['action']) && $calculationData['action'] === 'send_calculation') {
        
        $formattedMessage = formatCalculationForChat($calculationData['details']);

        sendMessage($user_id, $formattedMessage, null, 'Markdown'); // Отправляем пользователю
        sendToAdmin($user_id, $user_name, $user_niсkname, $calculationData['details']); // Отправляем администратору
        
        // Подтверждаем получение
        sendMessage($user_id, "✅ *Расчет успешно сохранен!*\n\nМенеджер свяжется с вами для уточнения деталей.", null, 'Markdown');
    }
}



// тут простой ответ хука на состальные запросы

$update = json_decode($input, true);

// 4. Обработка обычных сообщений
if (isset($update['message'])) {
    $chat_id = $update['message']['chat']['id'];
    $user_id = $update['message']['from']['id'];
    $first_name = $update['message']['from']['first_name'] ?? '';
    $last_name = $update['message']['from']['last_name'] ?? '';
    $username = $update['message']['from']['username'] ?? '';

    // Команда /start
    if (isset($update['message']['text']) && $update['message']['text'] == '/start') {
        $message = '
*Добро пожаловать в калькулятор гаража!*  
Здесь вы можете рассчитать стоимость гаража. Для расчета нажмите кнопку "Калькулятор гаража".';

        $keyboard = [
            "inline_keyboard" => [
                [[
                        "text" => "🧮 Калькулятор гаража",
                        "web_app" => ["url" => "https://myqu.ru/presents/calc-garage"]
                    
                ]],
                [[
                        "text" => "📞 Связаться с менеджером",
                        "callback_data" => "contact_manager"
                ]]
            ]
        ];
        sendMessage($chat_id, $message, $keyboard, 'Markdown');
    }

    // Команда /myid
    if (isset($update['message']['text']) && $update['message']['text'] == '/myid') {
        $message = "👤 *Ваши данные:*\n\n" .
                  "🆔 *User ID:* `$user_id`\n" .
                  "💬 *Chat ID:* `$chat_id`\n" .
                  "📛 *Имя:* $first_name $last_name\n" .
                  "🔗 *Username:* @" . ($username ?: 'не указан');
        
        sendMessage($chat_id, $message, null, 'Markdown');
    }
    exit;
}

// 5. Обработка callback_query
if (isset($update['callback_query'])) {
    $chat_id = $update['callback_query']['message']['chat']['id'];
    $data = $update['callback_query']['data'];
    
    if ($data === 'contact_manager') {
        $message = "
📞 *Связаться с менеджером*  
Телефон: +7 (926) 216-08-28  
Email: forpoststeel@yandex.ru  
Пн-Сб: с 09.00 до 18.00";
        sendMessage($chat_id, $message, null, 'Markdown');
        answerCallbackQuery($update['callback_query']['id'], "Менеджер скоро свяжется с вами!");
    }
    exit;
}




// Функция форматирования расчета для чата
function formatCalculationForChat($data) {
    return "🏗️ *РАСЧЕТ СТОИМОСТИ ГАРАЖА*\n\n" .
           "📏 *РАЗМЕРЫ:*\n" .
           "• Ширина: " . $data['width'] . " м\n" .
           "• Длина: " . $data['length'] . " м\n" .  
           "• Высота: " . $data['height'] . " м\n\n" .
           "🚪 *КОНСТРУКЦИЯ:*\n" .
           "• Ворота: " . $data['gateCount'] . " шт.\n" .
           "• Окна: " . $data['windowCount'] . " шт.\n" .
           "• Тип крыши: " . $data['roofType'] . "\n" .
           "• Электропривод: " . $data['gateElectric'] . "\n" .
           "• Дверь: " . ($data['door'] ? 'Да' : 'Нет') . "\n\n" .
           "⚡ *КОММУНИКАЦИИ:*\n" .
           "• Освещение: " . ($data['lighting'] ? 'Да' : 'Нет') . "\n" .
           "• Водопровод: " . ($data['waterSystem'] ? 'Да' : 'Нет') . "\n\n" .
           "🏗️ *ФУНДАМЕНТ И УТЕПЛЕНИЕ:*\n" .
           "• Фундамент: " . $data['foundation'] . "\n" .
           "• Утепление: " . $data['insulation'] . "\n\n" .
           "💰 *СТОИМОСТЬ:*\n" .
           "• " . $data['totalMin'] . "\n" .
           "• " . $data['totalMax'] . "\n\n" .
           "📅 *Дата расчета:* " . date('d.m.Y H:i');
}


// Функция отправки администратору
function sendToAdmin($user_id, $user_name, $user_nickname, $data) {
    global $token;
    $admin_chat_id = ADMIN_CHAT_ID;
    
    $adminMessage = "🆕 *НОВЫЙ РАСЧЕТ ГАРАЖА*\n\n" .
                    "*Клиент:* " . $user_name . "\n" .
                    "*ID:* " . $user_id . "\n" .
                    "*Nickname:* " . $user_nickname . "\n\n" .
                    "📊 *Параметры:*\n" .
                    "• Размер: " . $data['width'] . "×" . $data['length'] . "×" . $data['height'] . " м\n" .
                    "🚪 *КОНСТРУКЦИЯ:*\n" .
                    "• Ворота: " . $data['gateCount'] . " шт.\n" .
                    "• Окна: " . $data['windowCount'] . " шт.\n" .
                    "• Тип крыши: " . $data['roofType'] . "\n" .
                    "• Электропривод: " . $data['gateElectric'] . "\n" .
                    "• Дверь: " . ($data['door'] ? 'Да' : 'Нет') . "\n\n" .
                    "⚡ *КОММУНИКАЦИИ:*\n" .
                    "• Освещение: " . ($data['lighting'] ? 'Да' : 'Нет') . "\n" .
                    "• Водопровод: " . ($data['waterSystem'] ? 'Да' : 'Нет') . "\n\n" .
                    "🏗️ *ФУНДАМЕНТ И УТЕПЛЕНИЕ:*\n" .
                    "• Фундамент: " . $data['foundation'] . "\n" .
                    "• Утепление: " . $data['insulation'] . "\n\n" .
                    "💰 *СТОИМОСТЬ:*\n" .
                    "• " . $data['totalMin'] . "\n" .
                    "• " . $data['totalMax'] . "\n\n" .
                    "📅 *Дата расчета:* " . date('d.m.Y H:i');
    
    $url = "https://api.telegram.org/bot$token/sendMessage";
    $postData = [
        'chat_id' => $admin_chat_id,
        'text' => $adminMessage,
        'parse_mode' => 'Markdown'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);
}

// Функция ответа на callback query
function answerCallbackQuery($query_id, $text) {
    global $token;
    
    $url = "https://api.telegram.org/bot$token/answerCallbackQuery";
    $postData = [
        'callback_query_id' => $query_id,
        'text' => $text,
        'show_alert' => false
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);
}

// Функция отправки сообщения
function sendMessage($chat_id, $message, $keyboard = null, $parse_mode = 'HTML') {
    global $token;

    $url = "https://api.telegram.org/bot$token/sendMessage";
    
    $data = [
        'chat_id' => $chat_id,
        'text' => $message,
        'parse_mode' => $parse_mode
    ];
    
    if ($keyboard) $data['reply_markup'] = json_encode($keyboard);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);
    curl_close($ch);
    
    return $result;
}