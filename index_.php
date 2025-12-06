<!DOCTYPE html>
<html>
<head>
    <title>Mini App</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: var(--tg-theme-bg-color, #ffffff);
            color: var(--tg-theme-text-color, #000000);
        }
        .clickable-line {
            font-size: 18px;
            color: var(--tg-theme-link-color, #2678b6);
            text-decoration: none;
            padding: 12px 24px;
            border: 1px solid var(--tg-theme-link-color, #2678b6);
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        .clickable-line:hover {
            background: var(--tg-theme-link-color, #2678b6);
            color: var(--tg-theme-bg-color, #ffffff);
        }
    </style>
</head>
<body>
    <a class="clickable-line" href="https://t.me/cmacuk" target="_blank">
        @cmacuk
    </a>

    <script>
        // Инициализация Telegram Web App
        Telegram.WebApp.ready();
        
        // Опционально: можно использовать Telegram WebApp для открытия ссылки
        document.querySelector('.clickable-line').addEventListener('click', function(e) {
            e.preventDefault();
            Telegram.WebApp.openTelegramLink('https://t.me/cmacuk');        
        });
    </script>
</body>
</html>