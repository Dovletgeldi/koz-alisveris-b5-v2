import { postRate, preRate, halfRate, expressShippingRate } from "./scriptV03.js";

const tlInput = document.getElementById('tl-price');
const clearBtn = document.getElementById('clear-tl-input');
const resAfter = document.getElementById('res-after');
const resHalf = document.getElementById('res-half');
const resPre = document.getElementById('res-pre');

const conversionRates = {
    after: Number(postRate),
    half: Number(halfRate),
    pre: Number(preRate)
};

function calculateAll() {
    const amount = parseFloat(tlInput.value);

    if (isNaN(amount) || amount <= 0) {
        resAfter.textContent = '-';
        resHalf.textContent = '-';
        resPre.textContent = '-';
        return;
    }

    resAfter.textContent = `${Math.ceil(amount * conversionRates.after)} TMT`;
    resHalf.textContent = `${Math.ceil(amount * conversionRates.half)} TMT`;
    resPre.textContent = `${Math.ceil(amount * conversionRates.pre)} TMT`;
}

if (tlInput) {
    tlInput.addEventListener('input', () => {
        if (tlInput.value.length > 6) {
            tlInput.value = tlInput.value.slice(0, 6);
        }
        calculateAll();
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        tlInput.value = '';
        calculateAll();
        tlInput.focus();
    });
}