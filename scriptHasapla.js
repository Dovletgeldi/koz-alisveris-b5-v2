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

    // Use vertical stacking for better fit of large numbers
    const suffix = '<span style="display: block; font-size: 0.75em; font-weight: 500; opacity: 0.8; margin-top: 2px;">TMT</span>';

    resAfter.innerHTML = Math.ceil(amount * conversionRates.after) + suffix;
    resHalf.innerHTML = Math.ceil(amount * conversionRates.half) + suffix;
    resPre.innerHTML = Math.ceil(amount * conversionRates.pre) + suffix;
}

if (tlInput) {
    tlInput.addEventListener('input', () => {
        if (tlInput.value.length > 5) {
            tlInput.value = tlInput.value.slice(0, 5);
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