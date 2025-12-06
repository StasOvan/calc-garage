<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "PHP Version: " . phpversion() . "<br>";
echo "Script location: " . __FILE__ . "<br>";
echo "Working directory: " . getcwd() . "<br><br>";

// Проверим конфигурацию
echo "Checking config.php...<br>";
if (file_exists('config.php')) {
    require('config.php');
    echo "config.php loaded successfully<br>";
    echo "TOKEN: " . (defined('TOKEN') ? 'defined' : 'NOT defined') . "<br>";
    echo "ADMIN_CHAT_ID: " . (defined('ADMIN_CHAT_ID') ? 'defined' : 'NOT defined') . "<br>";
} else {
    echo "config.php NOT FOUND!<br>";
}

echo "<br>Checking permissions...<br>";
echo "Is writable: " . (is_writable('.') ? 'YES' : 'NO') . "<br>";

echo "<br>Testing file writing...<br>";
$test = file_put_contents('test_write.log', date('Y-m-d H:i:s') . " - Test write\n", FILE_APPEND);
echo "File write test: " . ($test !== false ? 'SUCCESS' : 'FAILED') . "<br>";

echo "<br>PHP errors log location:<br>";
echo "error_log: " . ini_get('error_log') . "<br>";
echo "Current error log: " . (ini_get('log_errors') ? 'ENABLED' : 'DISABLED') . "<br>";