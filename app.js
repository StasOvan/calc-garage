// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;

if (tg) {
    
    tg.setHeaderColor('#2c3e50');// Устанавливаем цветовую схему бота
    tg.setBackgroundColor('#f5f7fa');
    
    
    tg.MainButton.setText("Отправить расчетtg");// Инициализируем основную кнопку
    tg.MainButton.show();
    
    // Показываем нашу кнопку для тестирования
    // document.getElementById('telegramBtn').style.display = 'block';
}

// Цены из таблицы
const prices = {
    metal: { min: 5314.0, max: 8183.56, unit: 'м²', note: 'по полу' },
    gate: { min: 105600.0, max: 162624.0, unit: 'шт' },
    gateElectric: { min: 17600.0, max: 27104.0, unit: 'шт' },
    lighting: { min: 32438.4, max: 49955.0, unit: 'шт' },
    waterSystem: { min: 28758.4, max: 44288.0, unit: 'шт' },
    foundation: {
        'нет': { min: 0, max: 0, unit: '' },
        'Плита 150мм': { min: 4844.0, max: 8800.0, unit: 'м²', note: 'по полу' },
        'Винтовые сваи': { min: 2700.0, max: 4158.0, unit: 'м²', note: 'по полу' }
    },
    insulation: {
        'Профилированный лист': { min: 1080.0, max: 1663.0, unit: 'м²' },
        'Сэндвич панели 100мм': { min: 3680.0, max: 5667.0, unit: 'м²' }
    },
    window: { min: 9080.0, max: 13983.0, unit: 'шт' },
    door: { min: 21920.0, max: 33757.0, unit: 'шт' },
    transport: { min: 2000.0, max: 2200.0, unit: 'м²' },
    metises: { min: 575.0, max: 632.5, unit: '' }
};

// Получаем элементы DOM
const valWidth = document.getElementById('valWidth');
const valLength = document.getElementById('valLength');
const valHeight = document.getElementById('valHeight');
const valGateCount = document.getElementById('valGateCount');
const valLighting = document.getElementById('valLighting');
const valWaterSystem = document.getElementById('valWaterSystem');
const valWindowCount = document.getElementById('valWindowCount');
const valDoor = document.getElementById('valDoor');
const valTransport = document.getElementById('valTransport');
const valMetises = document.getElementById('valMetises');

const summary = document.getElementById('summary');
const priceDetails = document.getElementById('priceDetails');
const resetBtn = document.getElementById('resetBtn');
const telegramBtn = document.getElementById('telegramBtn');
const gateElectricGroup = document.getElementById('gateElectricGroup');

// Радиокнопки
const valRoofType = document.getElementsByName('valRoofType');
const valFoundation = document.getElementsByName('valFoundation');
const valInsulation = document.getElementsByName('valInsulation');
const valGateElectric = document.getElementsByName('valGateElectric');

// Функция для обновления состояния электропривода ворот
function updateGateElectricState() {
    const gateCount = parseInt(valGateCount.value) || 0;
    const radioOptions = gateElectricGroup.querySelectorAll('.radio-option');
    
    if (gateCount === 0) {
        // Отключаем электропривод ворот
        gateElectricGroup.classList.add('disabled-option');
        valGateElectric.forEach(radio => {
            radio.disabled = true;
        });
        // Сбрасываем выбор электропривода
        document.getElementById('valGateElectric2').checked = true;
        saveValue('valGateElectric', 'нет');
    } else {
        // Включаем электропривод ворот
        gateElectricGroup.classList.remove('disabled-option');
        valGateElectric.forEach(radio => {
            radio.disabled = false;
        });
    }
}


// Загружаем сохраненные значения из localStorage
function loadSavedValues() {

    // Обработка числовых полей и чекбоксов
    const fields = [
        'valWidth', 'valLength', 'valHeight', 'valGateCount', 'valWindowCount'
    ];
    
    fields.forEach(field => {
        const savedValue = localStorage.getItem(field);
        if (savedValue !== null) {
            document.getElementById(field).value = savedValue;
        }
    });
    
    const checkboxes = [
        'valLighting', 'valWaterSystem', 'valDoor'
    ];
    
    checkboxes.forEach(checkbox => {
        const savedValue = localStorage.getItem(checkbox);
        if (savedValue !== null) {
            document.getElementById(checkbox).checked = savedValue === 'true';
        }
    });
    
    // Обработка радиокнопок
    const radioGroups = [
        {name: 'valRoofType', storageKey: 'valRoofType'},
        {name: 'valFoundation', storageKey: 'valFoundation'},
        {name: 'valInsulation', storageKey: 'valInsulation'},
        {name: 'valGateElectric', storageKey: 'valGateElectric'}
    ];
    
    radioGroups.forEach(group => {
        const savedValue = localStorage.getItem(group.storageKey);
        if (savedValue !== null) {
            const radios = document.getElementsByName(group.name);
            for (let radio of radios) {
                if (radio.value === savedValue) {
                    radio.checked = true;
                    break;
                }
            }
        }
    });
    
    // Обновляем состояние электропривода ворот
    updateGateElectricState();
    calculate();
}

// Сохраняем значения в localStorage
function saveValue(field, value) {
    localStorage.setItem(field, value);
}

// Получаем значение выбранной радиокнопки
function getSelectedRadioValue(name) {
    const radios = document.getElementsByName(name);
    for (let radio of radios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return '';
}

// Вычисляем общую стоимость
function calculate() {

    // Получаем значения из полей
    const width = parseFloat(valWidth.value) || 0;
    const length = parseFloat(valLength.value) || 0;
    const height = parseFloat(valHeight.value) || 0;
    const gateCount = parseInt(valGateCount.value) || 0;
    const windowCount = parseInt(valWindowCount.value) || 0;
    
    const roofType = getSelectedRadioValue('valRoofType');
    const gateElectric = getSelectedRadioValue('valGateElectric');
    const lighting = valLighting.checked;
    const waterSystem = valWaterSystem.checked;
    const foundation = getSelectedRadioValue('valFoundation');
    const insulation = getSelectedRadioValue('valInsulation');
    const door = valDoor.checked;
    
    // Рассчитываем площади
    const floorArea = width * length; // площадь пола
    const wallArea = 2 * (width + length) * height; // площадь стен
    
    // Рассчитываем стоимость по компонентам
    let totalMin = 0;
    let totalMax = 0;
    let details = [];
    
    // Металлоконструкция (по полу)
    if (floorArea > 0) {
        const metalMin = floorArea * prices.metal.min;
        const metalMax = floorArea * prices.metal.max;
        totalMin += metalMin;
        totalMax += metalMax;
        details.push(`Металлоконструкция (${floorArea.toFixed(1)} м²): ${formatCurrency(metalMin)} - ${formatCurrency(metalMax)}`);
    }
    
    // Ворота
    if (gateCount > 0) {
        const gateMin = gateCount * prices.gate.min;
        const gateMax = gateCount * prices.gate.max;
        totalMin += gateMin;
        totalMax += gateMax;
        details.push(`Ворота (${gateCount} шт): ${formatCurrency(gateMin)} - ${formatCurrency(gateMax)}`);
    }
    
    // Электропривод ворот
    if (gateElectric === 'да' && gateCount > 0) {
        const electricMin = gateCount * prices.gateElectric.min;
        const electricMax = gateCount * prices.gateElectric.max;
        totalMin += electricMin;
        totalMax += electricMax;
        details.push(`Электропривод ворот (${gateCount} шт): ${formatCurrency(electricMin)} - ${formatCurrency(electricMax)}`);
    }
    
    // Комплект электроосвещения
    if (lighting) {
        totalMin += prices.lighting.min;
        totalMax += prices.lighting.max;
        details.push(`Комплект электроосвещения: ${formatCurrency(prices.lighting.min)} - ${formatCurrency(prices.lighting.max)}`);
    }
    
    // Водосточная система
    if (waterSystem) {
        totalMin += prices.waterSystem.min;
        totalMax += prices.waterSystem.max;
        details.push(`Водосточная система: ${formatCurrency(prices.waterSystem.min)} - ${formatCurrency(prices.waterSystem.max)}`);
    }
    
    // Фундамент
    if (foundation !== 'нет' && floorArea > 0) {
        const foundationMin = floorArea * prices.foundation[foundation].min;
        const foundationMax = floorArea * prices.foundation[foundation].max;
        totalMin += foundationMin;
        totalMax += foundationMax;
        details.push(`Фундамент ${foundation} (${floorArea.toFixed(1)} м²): ${formatCurrency(foundationMin)} - ${formatCurrency(foundationMax)}`);
    }
    
    // Утепление
    if (wallArea > 0 || floorArea > 0) {
        const insulationMin = wallArea * prices.insulation[insulation].min;
        const insulationMax = wallArea * prices.insulation[insulation].max + floorArea * prices.insulation[insulation].max;
        const roofMin =  floorArea * prices.insulation[insulation].min * 1.1;
        const roofMax =  floorArea * prices.insulation[insulation].max * 1.1;
        totalMin += insulationMin;
        totalMax += insulationMax;
        totalMin += roofMin;
        totalMax += roofMax;
        if (wallArea > 0)
            details.push(`Стены '${insulation}' (${wallArea} м²): ${formatCurrency(insulationMin)} - ${formatCurrency(insulationMax)}`);
        if (floorArea > 0)
            details.push(`Крыша '${insulation}' (${floorArea * 1.1} м²): ${formatCurrency(roofMin)} - ${formatCurrency(roofMax)}`);
    }
    
    // Окна
    if (windowCount > 0) {
        const windowMin = windowCount * prices.window.min;
        const windowMax = windowCount * prices.window.max;
        totalMin += windowMin;
        totalMax += windowMax;
        details.push(`Окна (${windowCount} шт): ${formatCurrency(windowMin)} - ${formatCurrency(windowMax)}`);
    }
    
    // Дверь
    if (door) {
        totalMin += prices.door.min;
        totalMax += prices.door.max;
        details.push(`Дверь: ${formatCurrency(prices.door.min)} - ${formatCurrency(prices.door.max)}`);
    }

    // транспорт
    if (floorArea > 0) {
        totalMin += prices.transport.min;
        totalMax += prices.transport.max;
        details.push(`Транспорт: ${formatCurrency(prices.transport.max * floorArea)}`);
    }

    // Метизы
    if (floorArea > 0) {
        totalMin += prices.metises.min;
        totalMax += prices.metises.max;
        details.push(`Метизы и расходные материалы: ${formatCurrency(prices.metises.max * floorArea)}`);
    }
    
    // Обновляем интерфейс
    const minPriceElement = summary.querySelector('.price-min');
    const maxPriceElement = summary.querySelector('.price-max');
    
    minPriceElement.textContent = `Минимальная стоимость: ${formatCurrency(totalMin)}`;
    maxPriceElement.textContent = `Максимальная стоимость: ${formatCurrency(totalMax)}`;
    
    // Обновляем детали расчета
    priceDetails.innerHTML = '';
    if (details.length === 0) {
        details.push('Заполните параметры гаража для расчета: стоимости');
    }
    details.forEach(detail => {
        const li = document.createElement('li');
        let parts = detail.split(':');
        li.innerHTML = parts[0] + ': <span>' + parts[1] + '</span>';
        priceDetails.appendChild(li);
    });

    // Обновляем кнопку Telegram
    if (tg) 
        if (totalMin > 0) tg.MainButton.setText(`Отправить расчет: ${formatCurrency(totalMin)} - ${formatCurrency(totalMax)}`);
            else tg.MainButton.setText("Нет данных");
        
    
}

// Форматируем валюту
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Сбрасываем все значения
function resetValues() {

    // Сбрасываем числовые поля
    const fields = [ 'valWidth', 'valLength', 'valHeight' ];
    
    fields.forEach(field => {
        document.getElementById(field).value = '';
        localStorage.setItem(field, '');
    });
    document.getElementById('valGateCount').value = '';
    document.getElementById('valWindowCount').value = '0';

    
    // Сбрасываем чекбоксы
    const checkboxes = [ 'valLighting', 'valWaterSystem', 'valDoor' ];
    
    checkboxes.forEach(checkbox => {
        document.getElementById(checkbox).checked = false;
        localStorage.setItem(checkbox, false);
    });
    
    // Сбрасываем радиокнопки к значениям по умолчанию
    document.getElementById('valRoofType1').checked = true;
    document.getElementById('valFoundation1').checked = true;
    document.getElementById('valInsulation1').checked = true;
    document.getElementById('valGateElectric2').checked = true;
    
    localStorage.setItem('valRoofType', 'Двухскатная');
    localStorage.setItem('valFoundation', 'нет');
    localStorage.setItem('valInsulation', 'Профилированный лист');
    localStorage.setItem('valGateElectric', 'нет');
    
    // Обновляем состояние электропривода ворот
    updateGateElectricState();
    calculate();
}

// Назначаем обработчики событий
const inputFields = [ valWidth, valLength, valHeight, valGateCount, valWindowCount ];

inputFields.forEach(field => {
    field.addEventListener('input', () => {
        saveValue(field.id, field.value);
        // Обновляем состояние электропривода ворот при изменении количества ворот
        if (field.id === 'valGateCount') {
            updateGateElectricState();
        }
        calculate();
    });
});

const checkboxFields = [valLighting, valWaterSystem, valDoor];
checkboxFields.forEach(field => {
    field.addEventListener('change', () => {
        saveValue(field.id, field.checked);
        calculate();
    });
});

// Обработчики для радиокнопок
valRoofType.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.checked) {
            saveValue('valRoofType', radio.value);
            calculate();
        }
    });
});

valFoundation.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.checked) {
            saveValue('valFoundation', radio.value);
            calculate();
        }
    });
});

valInsulation.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.checked) {
            saveValue('valInsulation', radio.value);
            calculate();
        }
    });
});

valGateElectric.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.checked) {
            saveValue('valGateElectric', radio.value);
            calculate();
        }
    });
});

resetBtn.addEventListener('click', resetValues);

// Обработчик для кнопки отправки в Telegram
if (tg) {

    tg.MainButton.onClick(function() {
        
        const width = parseFloat(valWidth.value) || 0;
        const length = parseFloat(valLength.value) || 0;
        const height = parseFloat(valHeight.value) || 0;
        const gateCount = parseInt(valGateCount.value) || 0;
        const windowCount = parseInt(valWindowCount.value) || 0;
        
        const data = {
            width: width,
            length: length,
            height: height,
            gateCount: gateCount,
            windowCount: windowCount,
            roofType: getSelectedRadioValue('valRoofType'),
            gateElectric: getSelectedRadioValue('valGateElectric'),
            lighting: valLighting.checked,
            waterSystem: valWaterSystem.checked,
            foundation: getSelectedRadioValue('valFoundation'),
            insulation: getSelectedRadioValue('valInsulation'),
            door: valDoor.checked,
            totalMin: document.querySelector('.price-min').textContent,
            totalMax: document.querySelector('.price-max').textContent,
            timestamp: new Date().toISOString(),
            // Добавляем информацию о пользователе
            user_id: tg.initDataUnsafe?.user?.id || '',
            user_name: tg.initDataUnsafe?.user?.first_name || 'Пользователь',
            user_username: tg.initDataUnsafe?.user?.username || ''
        };

        // Формируем данные для отправки
        const dataToSend = {
            action: 'send_calculation',
            details: data
        };
        
        // Отправляем данные через Telegram WebApp API
        sendViaFetch(dataToSend);
        
        // Показываем уведомление
        Telegram.WebApp.showAlert('Расчет отправлен! Скоро вы увидите его в чате.');
        
        // Закрываем Mini App через 3 секунды
        setTimeout(() => {
            Telegram.WebApp.close();
        }, 3000);
    });
}

function sendViaFetch(dataToSend) {
    // Получаем данные пользователя из Telegram
    const initData = tg.initData;
    const user = tg.initDataUnsafe?.user;
    
    // Формируем запрос
    fetch('bot.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            web_app_data: {
                data: JSON.stringify(dataToSend),
                user: user,
                initData: initData
            }
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Data sent successfully via fetch:', data);
    })
    .catch(error => {
        console.error('Error sending data via fetch:', error);
    });
}

// Альтернативная кнопка для тестирования вне Telegram
// telegramBtn.addEventListener('click', function() {
//     const width = parseFloat(valWidth.value) || 0;
//     const length = parseFloat(valLength.value) || 0;
//     const height = parseFloat(valHeight.value) || 0;
//     const gateCount = parseInt(valGateCount.value) || 0;
//     const windowCount = parseInt(valWindowCount.value) || 0;
    
//     const data = {
//         width: width,
//         length: length,
//         height: height,
//         gateCount: gateCount,
//         windowCount: windowCount,
//         roofType: getSelectedRadioValue('valRoofType'),
//         gateElectric: getSelectedRadioValue('valGateElectric'),
//         lighting: valLighting.checked,
//         waterSystem: valWaterSystem.checked,
//         foundation: getSelectedRadioValue('valFoundation'),
//         insulation: getSelectedRadioValue('valInsulation'),
//         door: valDoor.checked,
//         totalMin: document.querySelector('.price-min').textContent,
//         totalMax: document.querySelector('.price-max').textContent,
//         timestamp: new Date().toISOString()
//     };
    
//     alert('Данные для отправки в Telegram:\n' + JSON.stringify(data, null, 2));
//     console.log('Данные для отправки в Telegram:\n' + JSON.stringify(data, null, 2));
// });

// Загружаем сохраненные значения при загрузке страницы
document.addEventListener('DOMContentLoaded', loadSavedValues);


