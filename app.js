const topRuler = document.getElementById('topRuler');
const bottomRuler = document.getElementById('bottomRuler');
const cursor = document.getElementById('cursor');
const rulerBox = document.getElementById('rulerBox');
const RULER_WIDTH = 800;

let bottomOffset = 0;
let isDraggingRuler = false;
let rulerHasMoved = false;
let rulerStartX = 0;
let isDraggingCursor = false;
let cursorHasMoved = false;
let cursorStartX = 0;
let cursorOffsetInCursor = 0;
let currentMode = 1; // 1 = умножение, 2 = квадрат, 3 = куб

// Универсальная функция получения X-координаты (мышь или касание)
function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
}

const buttonNames = ["CD_1", "AB_2", "K_3"];

function generateTicks(rulerElement, buttonMode) {
    rulerElement.innerHTML = '';
    const cycleWidth = RULER_WIDTH / buttonMode;
    const showMedium = cycleWidth >= 300;
    const showMicro = cycleWidth >= 600;

    for (let c = 0; c < buttonMode; c++) {
        const startX = c * cycleWidth;
        const multiplier = Math.pow(10, c);

        for (let i = 1; i <= 10; i++) {
            const mainX = Math.log10(i) * cycleWidth + startX;
            createTick(rulerElement, mainX, 'major', i * multiplier);

            if (i === 10) break;

            if (showMedium) {
                for (let j = 0; j < 10; j++) {
                    const subVal = i + (j * 0.1);
                    const subX = Math.log10(subVal) * cycleWidth + startX;

                    if (j > 0) {
                        if (i === 1 || i === 2) {
                            createTick(rulerElement, subX, 'medium', subVal.toFixed(1) * multiplier);
                        } else {
                            createTick(rulerElement, subX, 'medium');
                        }
                    }

                    if (showMicro && (i === 1 || i === 2)) {
                        for (let k = 1; k < 10; k++) {
                            const microVal = subVal + (k * 0.01);
                            const microX = Math.log10(microVal) * cycleWidth + startX;
                            createTick(rulerElement, microX, 'minor');
                        }
                    }
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

    if (type === 'major') {
        const label = document.createElement('div');
        label.className = 'label';
        label.style.left = `${x}px`;
        label.innerText = labelText;
        parent.appendChild(label);
    } else if (type === 'medium' && parent === topRuler) {
        const val = parseFloat(labelText);
        const labelStr = String(labelText);
        if ((val === 1.5 || val === 2.5) && labelStr.includes('.5')) {
            const label = document.createElement('div');
            label.className = 'label';
            label.style.left = `${x}px`;
            label.style.fontSize = '10px';
            label.style.opacity = '0.7';
            label.innerText = labelText;
            parent.appendChild(label);
        }
    }
}

generateTicks(topRuler, 1);
generateTicks(bottomRuler, 1);

// Универсальные обработчики для мыши и касания
function handleStart(e) {
    const clientX = getClientX(e);
    
    if (e.target === bottomRuler || bottomRuler.contains(e.target)) {
        if (currentMode !== 1) return;
        isDraggingRuler = true;
        rulerHasMoved = false;
        rulerStartX = clientX - bottomOffset;
        e.preventDefault();
    } else if (e.target === cursor || cursor.contains(e.target)) {
        isDraggingCursor = true;
        cursorHasMoved = false;
        const rect = rulerBox.getBoundingClientRect();
        cursorStartX = clientX;
        cursorOffsetInCursor = clientX - rect.left - parseFloat(cursor.style.left);
        e.stopPropagation();
        e.preventDefault();
    }
}

function handleMove(e) {
    if (!isDraggingCursor && !isDraggingRuler) return;
    
    const clientX = getClientX(e);
    
    if (isDraggingCursor) {
        cursorHasMoved = true;
        const rect = rulerBox.getBoundingClientRect();
        let cursorX = clientX - rect.left - cursorOffsetInCursor;
        if (cursorX < 0) cursorX = 0;
        if (cursorX > RULER_WIDTH) cursorX = RULER_WIDTH;
        cursor.style.left = `${cursorX}px`;
        calculateValues();
        e.preventDefault();
    }
    
    if (isDraggingRuler) {
        rulerHasMoved = true;
        bottomOffset = clientX - rulerStartX;
        if (bottomOffset < -RULER_WIDTH) bottomOffset = -RULER_WIDTH;
        if (bottomOffset > RULER_WIDTH) bottomOffset = RULER_WIDTH;
        bottomRuler.style.transform = `translateX(${bottomOffset}px)`;
        calculateValues();
        e.preventDefault();
    }
}

function handleEnd() {
    isDraggingRuler = false;
    isDraggingCursor = false;
}

window.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT') return;
    
    const step = e.shiftKey ? 10 : 1; // Shift = быстрый шаг
    
    if (e.key === 'ArrowLeft') {
        const cursorX = Math.max(0, parseFloat(cursor.style.left) - step);
        cursor.style.left = `${cursorX}px`;
        calculateValues();
    } else if (e.key === 'ArrowRight') {
        const cursorX = Math.min(RULER_WIDTH, parseFloat(cursor.style.left) + step);
        cursor.style.left = `${cursorX}px`;
        calculateValues();
    }
});

// Mouse events
bottomRuler.addEventListener('mousedown', handleStart);
cursor.addEventListener('mousedown', handleStart);
window.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);

// Touch events
bottomRuler.addEventListener('touchstart', handleStart, { passive: false });
cursor.addEventListener('touchstart', handleStart, { passive: false });
window.addEventListener('touchmove', handleMove, { passive: false });
window.addEventListener('touchend', handleEnd);
window.addEventListener('touchcancel', handleEnd);
function setCursorByValue(value) {
    if (value < 1 || value > 10) return;
    const logB = Math.log10(value);
    const cursorX = (logB * RULER_WIDTH) + bottomOffset;
    if (cursorX < 0) cursorX = 0;
    if (cursorX > RULER_WIDTH) cursorX = RULER_WIDTH;
    cursor.style.left = `${cursorX}px`;
}

function setRulerByValueA(value) {
    if (value < 1 || value > 10) return;
    const logA = Math.log10(value);
    bottomOffset = logA * RULER_WIDTH;
    if (bottomOffset < -RULER_WIDTH) bottomOffset = -RULER_WIDTH;
    if (bottomOffset > RULER_WIDTH) bottomOffset = RULER_WIDTH;
    bottomRuler.style.transform = `translateX(${bottomOffset}px)`;
}

// Обработчики для режима 1 (умножение)
const valA = document.getElementById('valA');
const valB = document.getElementById('valB');
const valResult = document.getElementById('valResult');

valA.addEventListener('input', function() {
    if (currentMode !== 1) return;
    const value = parseFloat(this.value);
    if (isNaN(value) || value < 1 || value > 10) return;
    setRulerByValueA(value);
    calculateValues();
});

valB.addEventListener('input', function() {
    if (currentMode !== 1) return;
    const value = parseFloat(this.value);
    if (isNaN(value) || value < 1 || value > 10) return;
    setCursorByValue(value);
    calculateValues();
});

// Обработчики для режима 2 (квадрат)
const valA_sq = document.getElementById('valA_sq');
const valResult_sq = document.getElementById('valResult_sq');

valA_sq.addEventListener('input', function() {
    if (currentMode !== 2) return;
    const value = parseFloat(this.value);
    if (isNaN(value) || value < 1 || value > 10) return;
    setCursorByValue(value);
    calculateValues();
});

// Обработчики для режима 3 (куб)
const valA_cb = document.getElementById('valA_cb');
const valResult_cb = document.getElementById('valResult_cb');

valA_cb.addEventListener('input', function() {
    if (currentMode !== 3) return;
    const value = parseFloat(this.value);
    if (isNaN(value) || value < 1 || value > 10) return;
    setCursorByValue(value);
    calculateValues();
});

// 06.06.2026
// --- НОВЫЕ ФУНКЦИИ ОТРИСОВКИ СПЕЦИАЛЬНЫХ ШКАЛ ---
// --- РЕЖИМЫ 4 - 13 ---
function drawS_Scale(element) {
    element.innerHTML = '';
    const angles = [90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5.73];
    angles.forEach(deg => {
        const val = Math.sin(deg * Math.PI / 180);
        const x = RULER_WIDTH * (Math.log10(val) + 1); // Сдвиг +1, чтобы 0.1 было на позиции 0
        createTick(element, x, 'major', deg + '°');
    });
}

function drawT_Scale(element) {
    element.innerHTML = '';
    const angles = [45, 40, 30, 20, 10, 9, 8, 7, 6, 5.73];
    angles.forEach(deg => {
        const val = Math.tan(deg * Math.PI / 180);
        const x = RULER_WIDTH * (Math.log10(val) + 1);
        createTick(element, x, 'major', deg + '°');
    });
}

function drawST_Scale(element) {
    element.innerHTML = '';
    const angles = [5.73, 5, 4, 3, 2, 1, 0.573];
    angles.forEach(deg => {
        const val = Math.sin(deg * Math.PI / 180);
        const x = RULER_WIDTH * (Math.log10(val) + 2); // Сдвиг +2, чтобы 0.01 было на позиции 0
        createTick(element, x, 'major', deg + '°');
    });
}

function drawCI_Scale(element) {
    element.innerHTML = '';
    for (let i = 10; i >= 1; i--) {
        const x = RULER_WIDTH * (1 - Math.log10(i)); // Обратное направление
        createTick(element, x, 'major', i);
        if (i > 1) {
            for (let j = 1; j < 10; j++) {
                const subNum = i - (j * 0.1);
                if (subNum >= 1) {
                    const subX = RULER_WIDTH * (1 - Math.log10(subNum));
                    let label = (j === 5) ? subNum.toFixed(1) : null;
                    createTick(element, subX, 'medium', label);
                }
            }
        }
    }
}

function drawL_Scale(element) {
    element.innerHTML = '';
    for (let i = 0; i <= 10; i++) {
        const val = i / 10;
        const x = val * RULER_WIDTH; // Линейная шкала
        createTick(element, x, 'major', val.toFixed(1));
        if (i < 10) {
            for (let j = 1; j < 10; j++) {
                const subVal = val + (j * 0.01);
                const subX = subVal * RULER_WIDTH;
                let label = (j === 5) ? subVal.toFixed(2) : null;
                createTick(element, subX, 'medium', label);
            }
        }
    }
}

// --- НОВЫЕ ФУНКЦИИ ОТРИСОВКИ ---
function drawLL_Scale(element) {
    element.innerHTML = '';
    // LL шкала: от e^0=1 до e^2.302≈10
    // Позиция: x = RULER_WIDTH * log10(v), где v от 1 до 10
    const values = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10];
    values.forEach(v => {
        const x = RULER_WIDTH * Math.log10(v);
        createTick(element, x, 'major', v.toFixed(v < 2 ? 2 : 1));
    });
}

function drawP_Scale(element) {
    element.innerHTML = '';
    // P шкала: sqrt(1-x^2), x от 0 до 1
    // Позиция: x = RULER_WIDTH * (log10(p) + 1), где p от 0.1 до 1
    const values = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
    values.forEach(p => {
        const x = RULER_WIDTH * (Math.log10(p) + 1);
        createTick(element, x, 'major', p.toFixed(1));
    });
}

function drawDF_Scale(element) {
    element.innerHTML = '';
    // DF шкала: π*d^2/4, d от 1 до 10
    // Позиция: x = RULER_WIDTH * log10(d)
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    values.forEach(d => {
        const area = Math.PI * d * d / 4;
        const x = RULER_WIDTH * Math.log10(d);
        const label = area < 10 ? area.toFixed(2) : area.toFixed(1);
        createTick(element, x, 'major', label);
    });
}

function drawCF_Scale(element) {
    element.innerHTML = '';
    // CF шкала: π*v, v от 1 до 10
    // Позиция: x = RULER_WIDTH * log10(v/π) = RULER_WIDTH * (log10(v) - log10(π))
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    values.forEach(v => {
        const cfVal = Math.PI * v;
        const x = RULER_WIDTH * Math.log10(v);
        const label = cfVal < 10 ? cfVal.toFixed(2) : cfVal.toFixed(1);
        createTick(element, x, 'major', label);
    });
}

function drawCIF_Scale(element) {
    element.innerHTML = '';
    // CIF шкала: π/v, v от 1 до 10 (обратная)
    // Позиция: x = RULER_WIDTH * (1 - log10(v))
    const values = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    values.forEach(v => {
        const cifVal = Math.PI / v;
        const x = RULER_WIDTH * (1 - Math.log10(v));
        const label = cifVal < 1 ? cifVal.toFixed(3) : cifVal.toFixed(2);
        createTick(element, x, 'major', label);
    });
}

function renderSpecialScales(mode) {
    bottomOffset = 0;
    bottomRuler.style.transform = `translateX(0px)`;
    cursor.style.left = `0px`;

    // Верхняя шкала рисуется в зависимости от режима от режима
    if (mode === 8) {
        drawL_Scale(topRuler);
    } else if (mode === 9) {
        drawLL_Scale(topRuler);
    } else if (mode === 10) {
        drawP_Scale(topRuler);
    } else if (mode === 11) {
        drawDF_Scale(topRuler);
    } else if (mode === 12) {
        drawCF_Scale(topRuler);
    } else if (mode === 13) {
        drawCIF_Scale(topRuler);
    } else {
        generateTicks(topRuler, 1);
    }

    // Нижняя шкала в зависимости и от режима
    if (mode === 4) drawS_Scale(bottomRuler);
    else if (mode === 5) drawT_Scale(bottomRuler);
    else if (mode === 6) drawST_Scale(bottomRuler);
    else if (mode === 7 || mode === 13) drawCI_Scale(bottomRuler);
    else if (mode === 8 || mode === 9 || mode === 10 || mode === 11 || mode === 12) {
        generateTicks(bottomRuler, 1);
    }
}

function calculateValues() {
    const cursorX = parseFloat(cursor.style.left);
    const bottomLog = (cursorX - bottomOffset) / RULER_WIDTH;
    const bottomValue = Math.pow(10, bottomLog);
    const topLog = cursorX / RULER_WIDTH;
    const topValue = Math.pow(10, topLog);

    if (currentMode === 1) {
        const aLog = -bottomOffset / RULER_WIDTH;
        const valueA = 1 / Math.pow(10, aLog);
        if (document.activeElement !== valA) valA.value = valueA.toFixed(3);
        if (document.activeElement !== valB) valB.value = bottomValue.toFixed(3);
        valResult.value = topValue.toFixed(3);
    } else if (currentMode === 2) {
        const squareValue = bottomValue * bottomValue;
        if (document.activeElement !== valA_sq) valA_sq.value = bottomValue.toFixed(3);
        valResult_sq.value = squareValue.toFixed(3);
    } else if (currentMode === 3) {
        const cubeValue = bottomValue * bottomValue * bottomValue;
        if (document.activeElement !== valA_cb) valA_cb.value = bottomValue.toFixed(3);
        valResult_cb.value = cubeValue.toFixed(3);
    }

    // --- НОВЫЕ РЕЖИМЫ С КОММИТА 06.06 ---
    else if (currentMode === 4) { // Синус
        const valD = Math.pow(10, (cursorX / RULER_WIDTH) - 1);
        const angle = Math.asin(valD) * 180 / Math.PI;
        if (document.activeElement !== valAngle_S) valAngle_S.value = angle.toFixed(2);
        valResult_S.value = valD.toFixed(4);
    }
    else if (currentMode === 5) { // Тангенс
        const valD = Math.pow(10, (cursorX / RULER_WIDTH) - 1);
        const angle = Math.atan(valD) * 180 / Math.PI;
        if (document.activeElement !== valAngle_T) valAngle_T.value = angle.toFixed(2);
        valResult_T.value = valD.toFixed(4);
    }
    else if (currentMode === 6) { // Малые углы
        const valD = Math.pow(10, (cursorX / RULER_WIDTH) - 2);
        const angle = Math.asin(valD) * 180 / Math.PI;
        if (document.activeElement !== valAngle_ST) valAngle_ST.value = angle.toFixed(2);
        valResult_ST.value = valD.toFixed(4);
    }
    else if (currentMode === 7) { // Обратные числа
        const valCI_val = Math.pow(10, 1 - (cursorX / RULER_WIDTH));
        const valD_CI = Math.pow(10, (cursorX / RULER_WIDTH) - 1);
        if (document.activeElement !== valCI) valCI.value = valCI_val.toFixed(3);
        valResult_CI.value = valD_CI.toFixed(4);
    }
    else if (currentMode === 8) { // Логарифм
        const valD_L = Math.pow(10, cursorX / RULER_WIDTH);
        const valL = cursorX / RULER_WIDTH;
        if (document.activeElement !== valL_D) valL_D.value = valD_L.toFixed(3);
        valResult_L.value = valL.toFixed(4);
    }
    else if (currentMode === 9) { // Степень логарифма
        const exp = (cursorX / RULER_WIDTH) * Math.LN10;
        const result = Math.exp(exp);
        if (document.activeElement !== valLL_exp) valLL_exp.value = exp.toFixed(2);
        valResult_LL.value = result.toFixed(3);
    } else if (currentMode === 10) { // Пифагорова шкала
        const p = Math.pow(10, (cursorX / RULER_WIDTH) - 1);
        const x = Math.sqrt(1 - p*p);
        if (document.activeElement !== valP_x) valP_x.value = x.toFixed(3);
        valResult_P.value = p.toFixed(4);
    } else if (currentMode === 11) { // Площадь круга
        const d = Math.pow(10, cursorX / RULER_WIDTH);
        const result = Math.PI * d * d / 4;
        if (document.activeElement !== valDF_d) valDF_d.value = d.toFixed(3);
        valResult_DF.value = result.toFixed(3);
    } else if (currentMode === 12) { // Смещённая
        const c = Math.pow(10, cursorX / RULER_WIDTH);
        const result = Math.PI * c;
        if (document.activeElement !== valCF_c) valCF_c.value = c.toFixed(3);
        valResult_CF.value = result.toFixed(3);
    } else if (currentMode === 13) { // Обратная смещённая
        const c = Math.pow(10, 1 - (cursorX / RULER_WIDTH));
        const result = Math.PI / c;
        if (document.activeElement !== valCIF_c) valCIF_c.value = c.toFixed(3);
        valResult_CIF.value = result.toFixed(3);
    }
}

// --- НОВЫЕ ОБРАБОТЧИКИ ВВОДА С КОММИТА 06.06 ---
const valAngle_S = document.getElementById('valAngle_S');
valAngle_S?.addEventListener('input', function() {
    if (currentMode !== 4) return;
    let deg = parseFloat(this.value);
    if (isNaN(deg) || deg < 5.73 || deg > 90) return;
    const val = Math.sin(deg * Math.PI / 180);
    cursor.style.left = `${RULER_WIDTH * (Math.log10(val) + 1)}px`;
    calculateValues();
});

const valAngle_T = document.getElementById('valAngle_T');
valAngle_T?.addEventListener('input', function() {
    if (currentMode !== 5) return;
    let deg = parseFloat(this.value);
    if (isNaN(deg) || deg < 5.73 || deg > 45) return;
    const val = Math.tan(deg * Math.PI / 180);
    cursor.style.left = `${RULER_WIDTH * (Math.log10(val) + 1)}px`;
    calculateValues();
});

const valAngle_ST = document.getElementById('valAngle_ST');
valAngle_ST?.addEventListener('input', function() {
    if (currentMode !== 6) return;
    let deg = parseFloat(this.value);
    if (isNaN(deg) || deg < 0.57 || deg > 5.73) return;
    const val = Math.sin(deg * Math.PI / 180);
    cursor.style.left = `${RULER_WIDTH * (Math.log10(val) + 2)}px`;
    calculateValues();
});

const valCI = document.getElementById('valCI');
valCI?.addEventListener('input', function() {
    if (currentMode !== 7) return;
    const value = parseFloat(this.value);
    if (isNaN(value) || value < 1 || value > 10) return;
    cursor.style.left = `${RULER_WIDTH * (1 - Math.log10(value))}px`;
    calculateValues();
});

const valL_D = document.getElementById('valL_D');
valL_D?.addEventListener('input', function() {
    if (currentMode !== 8) return;
    const value = parseFloat(this.value);
    if (isNaN(value) || value < 1 || value > 10) return;
    cursor.style.left = `${Math.log10(value) * RULER_WIDTH}px`;
    calculateValues();
});

const valLL_exp = document.getElementById('valLL_exp');
const valResult_LL = document.getElementById('valResult_LL');
valLL_exp?.addEventListener('input', function() {
    if (currentMode !== 9) return;
    const exp = parseFloat(this.value);
    if (isNaN(exp) || exp < 0 || exp > 2.3) return;
    const cursorX = (exp / 2.3026) * RULER_WIDTH;
    cursor.style.left = `${cursorX}px`;
    calculateValues();
});

const valP_x = document.getElementById('valP_x');
const valResult_P = document.getElementById('valResult_P');
valP_x?.addEventListener('input', function() {
    if (currentMode !== 10) return;
    const x = parseFloat(this.value);
    if (isNaN(x) || x < 0 || x > 1) return;
    const p = Math.sqrt(1 - x*x);
    const cursorX = RULER_WIDTH * (Math.log10(p) + 1);
    cursor.style.left = `${cursorX}px`;
    calculateValues();
});

const valDF_d = document.getElementById('valDF_d');
const valResult_DF = document.getElementById('valResult_DF');
valDF_d?.addEventListener('input', function() {
    if (currentMode !== 11) return;
    const d = parseFloat(this.value);
    if (isNaN(d) || d < 1 || d > 10) return;
    const cursorX = RULER_WIDTH * Math.log10(d);
    cursor.style.left = `${cursorX}px`;
    calculateValues();
});

const valCF_c = document.getElementById('valCF_c');
const valResult_CF = document.getElementById('valResult_CF');
valCF_c?.addEventListener('input', function() {
    if (currentMode !== 12) return;
    const c = parseFloat(this.value);
    if (isNaN(c) || c < 1 || c > 10) return;
    const cursorX = RULER_WIDTH * Math.log10(c);
    cursor.style.left = `${cursorX}px`;
    calculateValues();
});

const valCIF_c = document.getElementById('valCIF_c');
const valResult_CIF = document.getElementById('valResult_CIF');
valCIF_c?.addEventListener('input', function() {
    if (currentMode !== 13) return;
    const c = parseFloat(this.value);
    if (isNaN(c) || c < 1 || c > 10) return;
    const cursorX = RULER_WIDTH * (1 - Math.log10(c));
    cursor.style.left = `${cursorX}px`;
    calculateValues();
});

const scaleButtons = document.querySelectorAll('.scale-btn');

scaleButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        document.querySelector('.scale-btn.active')?.classList.remove('active');
        button.classList.add('active');
        
        // Поддержка и старых (data-cycles), и новых (data-mode) кнопок
        const cycles = event.target.dataset.cycles ? Number(event.target.dataset.cycles) : null;
        const mode = event.target.dataset.mode ? Number(event.target.dataset.mode) : cycles;
        
        currentMode = mode;

        if (currentMode !== 1) {
            bottomOffset = 0;
            bottomRuler.style.transform = `translateX(0px)`;
        }

        document.querySelectorAll('.formula-block').forEach(b => b.classList.remove('active'));
        document.querySelector(`.formula-block[data-mode="${currentMode}"]`)?.classList.add('active');
        
        document.querySelectorAll('.instruction-block').forEach(b => b.classList.remove('active'));
        document.querySelector(`.instruction-block[data-mode="${currentMode}"]`)?.classList.add('active');

        // Если это режим 1, 2 или 3, то через старую логику отрисовки
        if (cycles !== null) {
            generateTicks(topRuler, cycles);
            generateTicks(bottomRuler, 1);
        } else {
            // Иначе новую логику для спец. шкал
            renderSpecialScales(currentMode);
        }
        calculateValues();
    });
});

calculateValues();