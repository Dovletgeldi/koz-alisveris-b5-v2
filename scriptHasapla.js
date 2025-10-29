import { postRate, preRate, halfRate, expressShippingRate } from "./scriptV02.js";

const converterBtn = document.getElementById('converter-btn');
const tlInputeValue = document.getElementById('tl-price')
const paymentOption = document.getElementById('payment-option')
const convertedPriceP = document.getElementById('converted-price-p')

const conversionRates = {
    after: Number(postRate),
    "half-pre": Number(halfRate),
    pre: Number(preRate) 
}

function clearHiglight() {
    tlInputeValue.style.border = ''
    paymentOption.style.border = ''
}

function highlightError(element) {
    element.style.border = '2px solid red'
}

converterBtn.addEventListener('click', function (e){
    e.preventDefault()

    let hasError = false
    clearHiglight()

    if(paymentOption.value === '') {
        highlightError(paymentOption)
        hasError = true
    }

    const amount = parseFloat(tlInputeValue.value)

    if (isNaN(amount) || amount <= 0 || tlInputeValue.value.trim() === '')  {
        highlightError(tlInputeValue)
        hasError = true
        
    } 

    if (hasError) {
        alert("Ähli zerur ýerleri dolduryň ýa-da saýlaň.")
        return
    }

    const convertedAmount = Math.ceil(amount * conversionRates[paymentOption.value]) 



    convertedPriceP.textContent = `Harydyňyzyň bahasy ${convertedAmount} TMT bolar. KG mugt bolar.`

})

tlInputeValue.addEventListener('input', function() {
    if(this.value.trim() !== '') {
        this.style.border = ''
    }
})

paymentOption.addEventListener('change', function(){
    if(this.value !== ''){
        this.style.border = ''
    }
})