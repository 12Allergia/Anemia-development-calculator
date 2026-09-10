'use strict';
const INTERCEPT = 53.172;
const THRESHOLD = 0.5;
const FIELDS = [
    { id: 'mch',  label: 'MCH',             unit: 'пг',       coef: -0.740, min: 0, max: 300  },
    { id: 'gp1b', label: 'гликопротеин 1b', unit: 'нг/мл',    coef: -0.565, min: 0,  max: 500 },
    { id: 'nox',  label: 'NOx',             unit: 'мкмоль/л', coef: -0.078, min: 0,  max: 500 },
    { id: 'rbc',  label: 'RBC-0',           unit: '×10¹²/л',  coef: -5.724, min: 0,  max: 100   },
];
const RISK_LEVELS = [
    { from: 0.7, cls: 'risk-high' },
    { from: 0.5, cls: 'risk-elevated' },
    { from: 0.3, cls: 'risk-moderate' },
    { from: 0,   cls: 'risk-low' },
];
const $ = id => document.getElementById(id);
function readFields() {
    const values = {};
    const errors = {};
    for (const field of FIELDS) {
        const raw = $(field.id).value.trim();
        const x = Number(raw);
        if (raw === '') {
            errors[field.id] = `Укажите ${field.label}`;
        } else if (!Number.isFinite(x)) {
            errors[field.id] = 'Введите число';
        } else if (x < field.min || x > field.max) {
            errors[field.id] = `Допустимо от ${field.min} до ${field.max} ${field.unit}`;
        } else {
            values[field.id] = x;
        }
    }

    return { values, errors };
}

function predict(values) {
    const z = FIELDS.reduce((sum, field) => sum + field.coef * values[field.id], INTERCEPT);
    return { z, p: 1 / (1 + Math.exp(-z)) };
}

function setFieldError(field, message) {
    const input = $(field.id);
    input.classList.toggle('error', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');

    let hint = input.parentElement.querySelector('.field-error');
    if (!hint) {
        hint = document.createElement('p');
        hint.className = 'field-error';
        input.insertAdjacentElement('afterend', hint);
    }
    hint.textContent = message || '';
}

function showResult(z, p) {
    $('result').style.display = 'none';
    $('result-content').style.display = 'block';

    const value = $('probability-value');
    value.textContent = p.toFixed(3);
    value.className = RISK_LEVELS.find(level => p >= level.from).cls;

    $('z-value').textContent = z.toFixed(2);

    const anemia = p > THRESHOLD;
    $('diagnosis').className = anemia ? 'diagnosis anemia' : 'diagnosis no-anemia';
      const verdict = document.createElement('strong');
    verdict.textContent = anemia ? 'Прогнозируется развитие анемии' : 'Анемия не прогнозируется';

    const note = document.createElement('span');
    note.className = 'diagnosis-note';
    note.textContent = ' во II–III триместрах беременности';

    $('diagnosis-text').replaceChildren(verdict, note);
}

function calculate() {
    const { values, errors } = readFields();
    FIELDS.forEach(field => setFieldError(field, errors[field.id]));

    const invalid = FIELDS.find(field => errors[field.id]);
    if (invalid) {
        $(invalid.id).focus();
        return;
    }

    const { z, p } = predict(values);
    showResult(z, p);

    if (window.matchMedia('(max-width: 850px)').matches) {
        $('result-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function resetForm() {
    for (const field of FIELDS) {
        $(field.id).value = '';
        setFieldError(field, '');
    }

    $('result').style.display = 'flex';
    $('result-content').style.display = 'none';
    $(FIELDS[0].id).focus();
}

document.addEventListener('DOMContentLoaded', () => {
    for (const field of FIELDS) {
        const input = $(field.id);
        input.min = field.min;
        input.max = field.max;

        input.addEventListener('input', () => setFieldError(field, ''));
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') calculate();
        });
    }
});
