// Калькулятор прогнозирования развития анемии у женщин во 2-3 триместрах беременности
 // Константы формулы
const CONSTANTS = {
    EULER: 2.71828182845904, 
    INTERCEPT: 53.1720,     
    COEF_MCH: -0.74,    
    COEF_GP1B: -0.565,
    COEF_NOX: -0.078,
    COEF_RBC: -5.724, 
    THRESHOLD: 0.5  };
// Допустимые диапазоны значений для валидации
const RANGES = {
    mch: { min: 0, max: 100, name: 'MCH' },
    gp1b: { min: 0, max: 1000, name: 'Гликопротеин 1b' },
    nox: { min: 0, max: 500, name: 'NOX' },
    rbc: { min: 0, max: 100, name: 'RBC-0' }
};
function calculate() {
// Сброс предыдущих ошибок
    clearErrors();
    // Получение значений
    const mch = parseFloat(document.getElementById('mch').value);
    const gp1b = parseFloat(document.getElementById('gp1b').value);
    const nox = parseFloat(document.getElementById('nox').value);
    const rbc = parseFloat(document.getElementById('rbc').value);
    // Валидация
    const errors = validateInputs(mch, gp1b, nox, rbc);
    if (errors.length > 0) {
        showErrors(errors);
        return;    }
    // Расчёт z
    const z = CONSTANTS.COEF_MCH * mch +
              CONSTANTS.COEF_GP1B * gp1b +
              CONSTANTS.COEF_NOX * nox +
              CONSTANTS.COEF_RBC * rbc +
              CONSTANTS.INTERCEPT;
        // Расчёт P
    const P = 1 / (1 + Math.pow(CONSTANTS.EULER, -z));
    // Отображение результата
    displayResult(P, z);
}
// Валидация входных данных

function validateInputs(mch, gp1b, nox, rbc) {
    const errors = [];
    
    if (isNaN(mch)) {
        errors.push({ field: 'mch', message: 'Введите значение MCH' });
    } else if (mch < RANGES.mch.min || mch > RANGES.mch.max) {
        errors.push({ 
            field: 'mch', 
            message: `MCH должен быть от ${RANGES.mch.min} до ${RANGES.mch.max} пг` 
        });
    }
    
    if (isNaN(gp1b)) {
        errors.push({ field: 'gp1b', message: 'Введите концентрацию гликопротеина 1b' });
    } else if (gp1b < RANGES.gp1b.min || gp1b > RANGES.gp1b.max) {
        errors.push({ 
            field: 'gp1b', 
            message: `Гликопротеин 1b должен быть от ${RANGES.gp1b.min} до ${RANGES.gp1b.max} нг/мл` 
        });
    }
    
    if (isNaN(nox)) {
        errors.push({ field: 'nox', message: 'Введите концентрацию NOX' });
    } else if (nox < RANGES.nox.min || nox > RANGES.nox.max) {
        errors.push({ 
            field: 'nox', 
            message: `NOX должен быть от ${RANGES.nox.min} до ${RANGES.nox.max} мкмоль/л` 
        });
    }
    
    if (isNaN(rbc)) {
        errors.push({ field: 'rbc', message: 'Введите количество эритроцитов (RBC-0)' });
    } else if (rbc < RANGES.rbc.min || rbc > RANGES.rbc.max) {
        errors.push({ 
            field: 'rbc', 
            message: `RBC-0 должен быть от ${RANGES.rbc.min} до ${RANGES.rbc.max} ×10¹²/л` 
        });
    }
    
    return errors;}
// Отображение ошибок валидации
function showErrors(errors) {
    errors.forEach(err => {
        const input = document.getElementById(err.field);
        input.classList.add('error');
        input.title = err.message;    });
        // Показать первую ошибку в alert
    alert('Ошибка ввода:\n\n' + errors.map(e => '• ' + e.message).join('\n'));
}

// Сброс стилей ошибок
function clearErrors() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.classList.remove('error');
        input.title = '';
    });}

//Отображение результата 
function displayResult(P, z) {
    const placeholder = document.getElementById('result');
    const content = document.getElementById('result-content');
    
    // Скрыть placeholder, показать результат
    placeholder.style.display = 'none';
    content.style.display = 'block';
    
    // Значение P
    const probabilityValue = document.getElementById('probability-value');
    probabilityValue.textContent = P.toFixed(4);
    
   // Цвет в зависимости от значения P
    if (P > 0.7) {
        probabilityValue.style.color = '#dc2626';
    } else if (P > 0.5) {
        probabilityValue.style.color = '#ea580c';
    } else if (P > 0.3) {
        probabilityValue.style.color = '#ca8a04';
    } else {
        probabilityValue.style.color = '#16a34a';}
        // Линейный предиктор
    document.getElementById('z-value').textContent = z.toFixed(4);
        // Диагноз
    const diagnosis = document.getElementById('diagnosis');
    const diagnosisIcon = document.getElementById('diagnosis-icon');
    const diagnosisText = document.getElementById('diagnosis-text');
    
    if (P > CONSTANTS.THRESHOLD) {
        // Прогнозируется анемия
        diagnosis.className = 'diagnosis anemia';
        diagnosisIcon.textContent = '⚠️';
        diagnosisText.innerHTML = `
            <div>Прогнозируется РАЗВИТИЕ АНЕМИИ</div>
            <div style="font-size: 13px; font-weight: 400; margin-top: 5px;">
                во 2-3 триместрах беременности
            </div>
        `;
    } else {
        // Анемия не прогнозируется
        diagnosis.className = 'diagnosis no-anemia';
        diagnosisIcon.textContent = '✅';
        diagnosisText.innerHTML = `
            <div>Анемия НЕ прогнозируется</div>
            <div style="font-size: 13px; font-weight: 400; margin-top: 5px;">
                во 2-3 триместрах беременности
            </div>
        `;
    }
    
    // Плавная прокрутка к результату на мобильных
    if (window.innerWidth < 850) {
        content.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

//Сброс 
function resetForm() {
    // Очистка полей
    document.getElementById('mch').value = '';
    document.getElementById('gp1b').value = '';
    document.getElementById('nox').value = '';
    document.getElementById('rbc').value = '';
    
    // Сброс ошибок
    clearErrors();
    
    // Возврат к placeholder
    document.getElementById('result').style.display = 'flex';
    document.getElementById('result-content').style.display = 'none';
    
    // Прокрутка наверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Добавление обработки клавиши Enter для удобства
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculate();
            }
        });
    });});
