import { products } from "./data-harytlar.js";

const productsArea = document.getElementById('products-area')

productsArea.innerHTML = products.map(function(product){
    return `
        <div class="product-box">
            <!-- Product Image -->
            <div class="product-photo">
                <img src="${product.photo}" 
                    alt="Kitabyň suraty">
            </div>

            <!-- Product Info -->
            <div class="product-details">
                <h2 class="product-name">${product.name}</h2>
                <p class="product-alt-name">${product.altName}</p>

                <div class="product-meta">
                    <span class="product-seller">Satyjy: ${product.seller}</span>
                    <span class="product-city">Şäheri: ${product.city}</span>
                </div>

                <p class="product-price"><strong>${product.price} TMT</strong></p>
                <p class="available-quantity">Mukdary: ${product.quantity} sany galdy</p>

                <button class="add-cart-btn">Sebede Goş</button>
            </div>
        </div>
`
}).join('')


