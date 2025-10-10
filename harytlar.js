import { products } from "./data-harytlar.js";

const productsArea = document.getElementById('products-area')
const cartBtn = document.getElementById('cart-btn')
const cartQty = document.getElementById('cart-qty')

let currentOverlay = null;

document.addEventListener('click', function(e) {
    if(e.target.matches('.filter-btn')){
        filterCheck(e.target.dataset.city) 
    } if(e.target.matches('.add-cart-btn')){
        addToCart(e.target.dataset.item)
    } if(e.target.matches('.remove-item')){
        removeItemFromCart(e.target.dataset.item)
    } if (e.target.matches('.increase-item')){
        quantityControl(e.target, 'increase')
    } if (e.target.matches('.decrease-item')){
        quantityControl(e.target, 'decrease')
    } 
})

const convertCityToEnglishName = {
    "Hemmesi": "hemmesi",
    "Aşgabat": "asgabat",
    "Mary": "mary",
    "Daşoguz": "dasoguz",
    "Ahal": "ahal",
    "Lebap": "lebap"
}

function renderProducts(productList = products) {
    productsArea.innerHTML = productList.map(function(product){
        if(product.quantity > 0) {
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

                        <p class="product-price">${product.price} TMT</p>
                        <p class="available-quantity">Mukdary: ${product.quantity} sany galdy</p>

                        <button class="add-cart-btn" data-item="${product.id}">Sebede Goş</button>
                    </div>
                </div>
            `
        }
    }).join('')
}

function filterCheck(city){
    document.querySelectorAll('.filter-btn').forEach(function(btn){btn.classList.remove('active')})
    document.querySelector(`[data-city="${city}"`).classList.add('active')

    if(city == "hemmesi") {
        renderProducts()
    } else {
        if (filterByCity(city).length === 0) {
            productsArea.innerHTML = `
                <div class="empty-search">
                    <img src="./images/search-result/Search-amico.svg">
                    <p class="empty-filter-text">Häzirki wagtda satlyk haryt ýok. Bu ýere haryt ýerleşdirmek isleýän bolsaňyz, bize IMO arkaly ýüz tutup bilersiňiz.</p>
                </div>
            `
        } else {
            renderProducts(filterByCity(city))
        }
    }
}

function filterByCity(city) {
    return products.filter(function(product){
        return convertCityToEnglishName[product.city] === city
    })
}

// Modified cart structure to include quantity for each item
let myCart = JSON.parse(localStorage.getItem('myCart')) || []
cartQty.textContent = myCart.length

function addToCart(item) {
    const found = products.find(function(product){
        return product.id.toString() === item.toString();
    });
    
    if (found) {
        const existingItem = myCart.find(cartItem => 
            cartItem.id.toString() === found.id.toString()
        );
        
        if (!existingItem) {
            // Add quantity property when adding to cart
            const cartItem = { ...found, cartQuantity: 1 };
            myCart.push(cartItem);
            localStorage.setItem('myCart', JSON.stringify(myCart))
            cartQty.textContent = myCart.length
            console.log('Item added to cart:', cartItem)
        } else {
            alert('Haryt sebediňizde öňdenem bar.')
            document.body.classList.remove('no-scroll')
        }
    }
}

function refreshOverlay() {
    if (currentOverlay) {
        currentOverlay.innerHTML = getOverlayContent()
        
        document.getElementById('close-cart-btn').addEventListener('click', () => {
            currentOverlay.remove()
            currentOverlay = null
            document.body.classList.remove('no-scroll')
        })
    }
}

cartBtn.addEventListener('click', function(){
    const overlay = document.createElement('div')
    overlay.id = "cart-overlay"
    currentOverlay = overlay
    document.body.classList.add('no-scroll')
    
    overlay.innerHTML = getOverlayContent()
    document.body.appendChild(overlay)

    document.getElementById('close-cart-btn').addEventListener('click', () => {
        overlay.remove()
        currentOverlay = null
        document.body.classList.remove('no-scroll')
    })
})

function removeItemFromCart(id) {
    myCart = myCart.filter(function(product){
        return product.id.toString() !== id.toString()
    })
    
    localStorage.setItem('myCart', JSON.stringify(myCart))
    cartQty.textContent = myCart.length
    refreshOverlay()
}

// Updated quantity control function
function quantityControl(buttonClicked, action) {
    const productBox = buttonClicked.closest('.product-box');
    const quantityEl = productBox.querySelector('.quantity');
    const availableQuantity = productBox.querySelector('.available-quantity');
    const productId = buttonClicked.dataset.item;

    // Find the item in cart
    const cartItem = myCart.find(item => item.id.toString() === productId.toString());
    if (!cartItem) return;

    let currentQty = cartItem.cartQuantity || 1;
    const stock = parseInt(availableQuantity.dataset.quantity, 10);

    if (action === 'increase' && currentQty < stock) {
        currentQty += 1;
    } else if (action === 'decrease' && currentQty > 1) {
        currentQty -= 1;
    }

    // Update the cart item quantity
    cartItem.cartQuantity = currentQty;
    
    // Update localStorage
    localStorage.setItem('myCart', JSON.stringify(myCart));
    
    // Update the display
    quantityEl.textContent = currentQty;
    
    // Update decrease button state
    const decreaseBtn = productBox.querySelector('.decrease-item');
    if (currentQty === 1) {
        decreaseBtn.classList.add('disabled');
    } else {
        decreaseBtn.classList.remove('disabled');
    }
    
    // Refresh the overlay to update totals
    refreshOverlay();
}

function getOverlayContent() {
    // Calculate total using individual item quantities
    const itemsTotal = myCart.reduce((sum, item) => {
        const quantity = item.cartQuantity || 1;
        return sum + (parseInt(item.price) * quantity);
    }, 0);

    const delivery = myCart.length > 0 ? 20 : 0;
    const grandTotal = itemsTotal + delivery;

    return `
        <div class="sticky-wrapper">
            <div class="header-area">
                <div class="container">
                    <div class="header">
                        <div class="left-icon" id="close-cart-btn">
                            <i class="fa-solid fa-angle-left"></i>
                        </div>
                        <div class="title">
                            <p>Sebedim (${myCart.length})</p>
                        </div>
                        <div class="right-icon"></div>
                    </div>
                </div>
            </div>

            <div class="container">
                <div id="products-container">
                    ${myCart.length === 0 ? 
                        '<p style="text-align: center; padding: 40px; color: #666;">Sebediňiz boş</p>' :
                        myCart.map(function (product) {
                            const quantity = product.cartQuantity || 1;
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

                                        <p class="product-price">${product.price} TMT</p>
                                        <p class="available-quantity" data-quantity="${product.quantity}">
                                            Mukdary: ${product.quantity} sany galdy
                                        </p>

                                        <div class="quantity-details">
                                            <i class="fa-solid fa-trash remove-item" data-item="${product.id}"></i>
                                            <div class="cart-quantity">
                                                <i class="fa-solid fa-minus decrease-item ${quantity === 1 ? 'disabled' : ''}" data-item="${product.id}"></i>
                                                <span class="quantity" data-item="${product.id}">${quantity}</span>
                                                <i class="fa-solid fa-plus increase-item" data-item="${product.id}"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `
                        }).join('')
                    }
                </div>

                ${myCart.length > 0 ? `
                    <div class="order-total-area">
                        <div class="order-total">
                            <div class="cost">
                                <span>Harytlar:</span>
                                <span id="added-items">${itemsTotal} TMT</span>
                            </div>
                            <div class="cost">
                                <span>Eltip bermek(AG şäher içi):</span>
                                <span>${delivery} TMT</span>
                            </div>
                            <div class="cost">
                                <span><strong>Jemi:</strong></span>
                                <span><strong>${grandTotal} TMT</strong></span>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            ${myCart.length > 0 ? `
                <div class="complete-order">
                    <div id="backdrop"></div>
                    <button id="confirm-order">Sargyt et</button>
                </div>
            ` : ''}
        </div>
    `
}

document.addEventListener('click', (e) => {
    if (e.target.matches('#confirm-order')) {


        let outerOverlay = document.getElementById('outer-overlay');
        if (!outerOverlay) {
            outerOverlay = document.createElement('div');
            outerOverlay.id = 'outer-overlay';
            currentOverlay.appendChild(outerOverlay);

            outerOverlay.innerHTML = `
                <p>Web sahypamyzyň häzirki wagtda kämilleşdirilýändigi sebäpli, sargyt etmek üçin sebediňiziň suratyny IMO ýa-da LINK arkaly ugratmagyňyzy haýyş edýäris. Aşakdaky logolaryň üstüne basyp biziň hasaplarymyzy tapyp bilersiňiz. Şeýle hem telefon belgimizden goşup bilersiňiz: <br> +90 541 942 0722</p>

                <div class="a-links">
                    <a href="https://linkm.me/users/kozalisveris" class="contact">
                        <img src="images/social media/link-white.png" alt="link-image">
                    </a>

                    <a href="https://s.imoim.net/xSZ5dO" class="contact">
                        <img src="images/social media/imo-white.png" alt="imo-image">
                    </a>
                </div>

                <button id="close-overlay">Çyk</button>
            `;
        }
    }

    if (e.target.matches('#close-overlay')) {
        const outerOverlay = document.getElementById('outer-overlay');
        if (outerOverlay) outerOverlay.remove();
        backdrop.style.display = 'none';
    }

    if (e.target.matches('#backdrop')) {
        const outerOverlay = document.getElementById('outer-overlay');
        if (outerOverlay) outerOverlay.remove();
        backdrop.style.display = 'none';
    }
});

renderProducts()