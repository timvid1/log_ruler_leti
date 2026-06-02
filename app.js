const topRuler = document.getElementById('topRuler');
const bottomRuler = document.getElementById('bottomRuler');
const cursor = document.getElementById('cursor');
const rulerBox = document.getElementById('rulerBox');

const valA = document.getElementById('valA');
const valB = document.getElementById('valB');
const valResult = document.getElementById('valResult');

const RULER_WIDTH = 800; // Длина одного логарифмического цикла (от 1 до 10) в пикселях
let bottomOffset = 0;    // Текущий сдвиг нижней линейки в пикселях

let isDraggingRuler = false;
let rulerHasMoved = false;
let rulerStartX = 0;
    
let isDraggingCursor = false;
let cursorHasMoved = false;
let cursorStartX = 0;
let cursorOffsetInCursor = 0;

// Функция генерации делений для шкалы
function generateTicks(rulerElement) {
    // Цикл по цифрам от 1 до 10
    for (let i = 1; i <= 10; i++) {
        const mainX = Math.log10(i) * RULER_WIDTH;

        // Генерация главной отметки с цифрой
        createTick(rulerElement, mainX, 'major', i);

        if (i === 10) break;

        // Второстепенные деления (по типу 1.1, 1.2... или 2.1, 2.2...)
        for (let j = 0; j < 10; j++) {
            const subVal = i + (j * 0.1);
            const subX = Math.log10(subVal) * RULER_WIDTH;

            if (j > 0) {
                if (i === 1 || i === 2) {
                    createTick(rulerElement, subX, 'medium', subVal.toFixed(1));
                } else {
                    createTick(rulerElement, subX, 'medium');
                }
            }
            // Для мелких участков (между 1 и 2) еще более мелкие 
            if (i === 1 || i === 2) {
                for (let k = 1; k < 10; k++) {
                    const microVal = subVal + (k * 0.01);
                    const microX = Math.log10(microVal) * RULER_WIDTH;
                    createTick(rulerElement, microX, 'minor');
                }
            }
        }
    }
}

function createTick(parent, x, type, labelText = null) {
    const tick = document.createElement('div');
    tick.className = `tick ${type}`;
    tick.style.left = `${x}px`;
    parent.appendChild(tick);

    if (!labelText) return;

    // Главные деления (1, 2, 3...)
    if (type === 'major') {
        const label = document.createElement('div');
        label.className = 'label';
        label.style.left = `${x}px`;
        label.innerText = labelText;
        parent.appendChild(label);
    }
    // Средние деления (1.5, 2.5 и т.д.)
    else if (type === 'medium' && parent === topRuler) {
        const val = parseFloat(labelText);
        // Только для участков 1-2
        if ((val === 1.5 || val === 2.5) && labelText.includes('.5')) {
            const label = document.createElement('div');
            label.className = 'label';
            label.style.left = `${x}px`;
            label.style.fontSize = '10px'; // Меньше шрифт
            label.style.opacity = '0.7';    // Тусклее
            label.innerText = labelText;
            parent.appendChild(label);
        }
    }
}

// Инициализация шкал
generateTicks(topRuler);
generateTicks(bottomRuler);

// Логика движения нижней линейки
bottomRuler.addEventListener('mousedown', (e) => {
    isDraggingRuler = true;
    rulerHasMoved = false;
    rulerStartX = e.clientX - bottomOffset;
});

// Логика движения бегунка
cursor.addEventListener('mousedown', (e) => {
    isDraggingCursor = true;
    cursorHasMoved = false;
    const rect = rulerBox.getBoundingClientRect();
    cursorStartX = e.clientX;
    cursorOffsetInCursor = e.clientX - rect.left - parseFloat(cursor.style.left);
    e.stopPropagation();
    e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
    // Перетаскивание бегунка
    if (isDraggingCursor) {
        cursorHasMoved = true;
        const rect = rulerBox.getBoundingClientRect();
        let cursorX = e.clientX - rect.left - cursorOffsetInCursor;

        // Ограничение бегунка пределами контейнера
        if (cursorX < 0) cursorX = 0;
        if (cursorX > RULER_WIDTH) cursorX = RULER_WIDTH;

        cursor.style.left = `${cursorX}px`;
        calculateValues();
        return;
    }

    // Перетаскивание нижней линейки
    if (isDraggingRuler) {
        rulerHasMoved = true;
        bottomOffset = e.clientX - rulerStartX;

    // Ограничение движения, чтобы не улетала
        if (bottomOffset < -RULER_WIDTH) bottomOffset = -RULER_WIDTH;
        if (bottomOffset > RULER_WIDTH) bottomOffset = RULER_WIDTH;

        bottomRuler.style.transform = `translateX(${bottomOffset}px)`;
        calculateValues();
    }
});

window.addEventListener('mouseup', () => {
    isDraggingRuler = false;
    isDraggingCursor = false;
});

// Математика
function calculateValues() {
    const cursorX = parseFloat(cursor.style.left);

    // Значение на верхней шкале под курсором
    const topLog = cursorX / RULER_WIDTH;
    const topValue = Math.pow(10, topLog);
    // Значение на нижней шкале под курсором с учетом сдвига линейки
    const bottomLog = (cursorX - bottomOffset) / RULER_WIDTH;
    let bottomValue = Math.pow(10, bottomLog);
    // Расчет множителей для вывода на экран
    const aLog = -bottomOffset / RULER_WIDTH;
    const valueA = 1 / Math.pow(10, aLog);
    valA.innerText = valueA.toFixed(3);
    valB.innerText = bottomValue.toFixed(3);
    valResult.innerText = topValue.toFixed(3);
}

// Первичный расчет при старте
calculateValues();