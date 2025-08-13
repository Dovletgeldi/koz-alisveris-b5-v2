import { products } from "./data-harytlar.js";

const productsArea = document.getElementById('products-area')
const filterBtn = document.getElementById('filter-btn')
const hemmesi = document.getElementById('hemmesi')


const convertCityToEnglishName = {
    "Hemmesi": "hemmesi",
    "Aşgabat": "asgabat",
    "Mary": "mary",
    "Daşoguz": "dasoguz",
    "Ahal": "ahal",
    "Lebap": "lebap"
}


productsArea.innerHTML = products.map(function(product){
    return `
        <div class="product-box">
            <div class="product-photo">
                <img src="${product.photo}" 
                    alt="Kitabyň suraty">
            </div>

            <div class="product-details">
                <h2 class="product-name">${product.name}</h2>
                <p class="product-alt-name">${product.altName}</p>

                <div class="product-meta">
                    <span class="product-seller">Satyjy: ${product.seller}</span>
                    <span class="product-city" data-city="${convertCityToEnglishName[product.city]}">Şäheri: ${product.city}</span>
                </div>

                <p class="product-price"><strong>${product.price} TMT</strong></p>
                <p class="available-quantity">Mukdary: ${product.quantity} sany galdy</p>

                <button class="add-cart-btn">Sebede Goş</button>
            </div>
        </div>
`
}).join('')

hemmesi.addEventListener('click', function() {
    productsArea.innerHTML = products.map(function(product){
    return `
        <div class="product-box">
            <div class="product-photo">
                <img src="${product.photo}" 
                    alt="Kitabyň suraty">
            </div>

            <div class="product-details">
                <h2 class="product-name">${product.name}</h2>
                <p class="product-alt-name">${product.altName}</p>

                <div class="product-meta">
                    <span class="product-seller">Satyjy: ${product.seller}</span>
                    <span class="product-city" data-city="${convertCityToEnglishName[product.city]}">Şäheri: ${product.city}</span>
                </div>

                <p class="product-price"><strong>${product.price} TMT</strong></p>
                <p class="available-quantity">Mukdary: ${product.quantity} sany galdy</p>

                <button class="add-cart-btn">Sebede Goş</button>
            </div>
        </div>
`
}).join('')

})



filterBtn.forEach(
    addEventListener('click', function(e){

        if(e.target.dataset.city == 'hemmesi') {
            productsArea.innerHTML = products.map(function(product){
    return `
        <div class="product-box">
            <div class="product-photo">
                <img src="${product.photo}" 
                    alt="Kitabyň suraty">
            </div>

            <div class="product-details">
                <h2 class="product-name">${product.name}</h2>
                <p class="product-alt-name">${product.altName}</p>

                <div class="product-meta">
                    <span class="product-seller">Satyjy: ${product.seller}</span>
                    <span class="product-city" data-city="${convertCityToEnglishName[product.city]}">Şäheri: ${product.city}</span>
                </div>

                <p class="product-price"><strong>${product.price} TMT</strong></p>
                <p class="available-quantity">Mukdary: ${product.quantity} sany galdy</p>

                <button class="add-cart-btn">Sebede Goş</button>
            </div>
        </div>
`
}).join('')
        }
        console.log(e.target.dataset.city)


        function filterCity(x) {



            return x.filter(function(product) {
                
                return e.target.dataset.city == convertCityToEnglishName[product.city]
                
            })
            
        }

        productsArea.innerHTML = filterCity(products).map(function(product){
            return`
                    <div class="product-box">
                        <div class="product-photo">
                            <img src="${product.photo}" 
                                alt="Kitabyň suraty">
                        </div>

                        <div class="product-details">
                            <h2 class="product-name">${product.name}</h2>
                            <p class="product-alt-name">${product.altName}</p>

                            <div class="product-meta">
                                <span class="product-seller">Satyjy: ${product.seller}</span>
                                <span class="product-city" data-city="${convertCityToEnglishName[product.city]}">Şäheri: ${product.city}</span>
                            </div>

                            <p class="product-price"><strong>${product.price} TMT</strong></p>
                            <p class="available-quantity">Mukdary: ${product.quantity} sany galdy</p>

                            <button class="add-cart-btn">Sebede Goş</button>
                        </div>
                    </div>
            `
        }).join('')

    })
)







function performSearch() {
    const searchBarInput = document.getElementById('search-bar').value.toLowerCase()
}