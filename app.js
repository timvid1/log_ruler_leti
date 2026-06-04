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

bottomRuler.addEventListener('mousedown', (e) => {
    if (currentMode !== 1) return;
    isDraggingRuler = true;
    rulerHasMoved = false;
    rulerStartX = e.clientX - bottomOffset;
});

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
    if (isDraggingCursor) {
        cursorHasMoved = true;
        const rect = rulerBox.getBoundingClientRect();
        let cursorX = e.clientX - rect.left - cursorOffsetInCursor;
        if (cursorX < 0) cursorX = 0;
        if (cursorX > RULER_WIDTH) cursorX = RULER_WIDTH;
        cursor.style.left = `${cursorX}px`;
        calculateValues();
        return;
    }

    if (isDraggingRuler) {
        rulerHasMoved = true;
        bottomOffset = e.clientX - rulerStartX;
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
}

const scaleButtons = document.querySelectorAll('.scale-btn');

scaleButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        document.querySelector('.scale-btn.active')?.classList.remove('active');
        button.classList.add('active');

        const cycles = Number(event.target.dataset.cycles);
        currentMode = cycles;

        if (currentMode !== 1) {
            bottomOffset = 0;
            bottomRuler.style.transform = `translateX(0px)`;
        }

        document.querySelectorAll('.formula-block').forEach(b => b.classList.remove('active'));
        document.querySelector(`.formula-block[data-mode="${currentMode}"]`)?.classList.add('active');
        
        document.querySelectorAll('.instruction-block').forEach(b => b.classList.remove('active'));
        document.querySelector(`.instruction-block[data-mode="${currentMode}"]`)?.classList.add('active');

        generateTicks(topRuler, cycles);
        generateTicks(bottomRuler, 1);
        calculateValues();
    });
});

calculateValues();