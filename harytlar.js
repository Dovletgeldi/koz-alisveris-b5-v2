import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let products = []
const searchBtn = document.getElementById('search-btn')
const searchBarInput = document.getElementById('search-bar')

async function loadProductsFromFirebase() {
    const productsArea = document.getElementById('products-area')
    productsArea.innerHTML = '<p style="text-align: center; padding: 40px;">Ýüklenýär...</p>'

    try {
        const db = window.firestoreDB
        const querySnapshot = await getDocs(collection(db, 'products'))

        products = []
        querySnapshot.forEach((doc) => {
            products.push({
                ...doc.data(),
                id: doc.id
            })
        })
        console.log(`✅ Loaded ${products.length} products from Firebase`)
        renderProducts(shuffle(products))
    } catch (error) {
        console.error('❌ Error loading products:', error)
        productsArea.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Gynansakda ýüklenmedi. Täzeden synanyşyň.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadProductsFromFirebase)


const productsArea = document.getElementById('products-area')
const cartBtn = document.getElementById('cart-btn')
const cartQty = document.getElementById('cart-qty')
let viewMoreBtn

let currentOverlay = null;

document.addEventListener('click', function (e) {
    if (e.target.matches('.filter-btn')) {
        filterCheck(e.target.dataset.city)
    } if (e.target.matches('.add-cart-btn')) {
        addToCart(e.target.dataset.item)
    } if (e.target.matches('.remove-item')) {
        removeItemFromCart(e.target.dataset.item)
    } if (e.target.matches('.increase-item')) {
        quantityControl(e.target, 'increase')
    } if (e.target.matches('.decrease-item')) {
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

function shuffle(array) {
    let currentIndex = array.length;

    while (currentIndex != 0) {

        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

let visibleCount = 11

function renderProducts(productList = products) {
    // Keep the full list for logic
    const totalProducts = productList.filter(p => p.quantity > 0);
    const visibleProducts = totalProducts.slice(0, visibleCount);

    const itemsHTML = visibleProducts.map(product => `
        <div class="product-box">
            <div class="product-photo">
                <img src="${product.photo}" alt="Kitabyň suraty">
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
    `).join('');

    // Show either products or "no results" message
    if (totalProducts.length === 0) {
        productsArea.innerHTML = `<p style="text-align: center; padding: 40px; color: red;">
            Gynansakda haryt tapylmady. Başgarak söz bilen gözledip görüň.
        </p>`;
        return;
    }

    productsArea.innerHTML = `
        ${itemsHTML}
        <button id="view-more" style="display: none;">Has köp gör</button>
    `;

    const viewMoreBtn = document.getElementById('view-more');

    // ✅ Show button only if there are more items to show
    if (totalProducts.length > visibleCount) {
        viewMoreBtn.style.display = 'block';
        viewMoreBtn.onclick = () => {
            visibleCount += 9;
            renderProducts(totalProducts); // keep same filtered list
        };
    }
}



function viewMoreFunction() {
    if (products.length > visibleCount) {
        viewMoreBtn.style.display = 'block'
        viewMoreBtn.addEventListener('click', () => {
            visibleCount += 9
            console.log(visibleCount)
            renderProducts()
        })
    }
}

const DIACRITICS_MAP = {
    "ü": "u", "Ü": "u",
    "ö": "o", "Ö": "o",
    "ğ": "g", "Ğ": "g",
    "ç": "c", "Ç": "c",
    "ş": "s", "Ş": "s",
    "ı": "i", "İ": "i"
};

function removeDiacritics(str) {
    return str.replace(/[üÜöÖğĞçÇşŞıİ]/g, (char) => DIACRITICS_MAP[char] || char);
}

const normalize = (s) =>
    removeDiacritics(
        String(s ?? "")
            .normalize("NFC")
            .trim()
            .toLocaleLowerCase("tr")
    );


searchBtn.addEventListener('click', (e) => {
    e.preventDefault()
    console.log(typeof (searchBarInput.value))

    renderProducts(performSearch(searchBarInput.value))
})

function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => []);

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;

            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,       // deletion
                matrix[i][j - 1] + 1,       // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return matrix[a.length][b.length];
}

function fuzzyMatch(a, b) {
    const dist = levenshtein(a, b);
    return dist <= 2; // allow up to 2 mistakes
}


function performSearch(value) {
    const val = normalize(value);

    const results = products
        .map((item) => {
            const nameNorm = normalize(item?.name);
            const altNorm = normalize(item?.altName);

            let score = -1;
            const fields = [nameNorm, altNorm];

            for (const field of fields) {
                if (!field) continue;

                if (field === val) score = Math.max(score, 100);            // exact
                else if (field.startsWith(val)) score = Math.max(score, 80); // word starts
                else if (field.includes(val)) score = Math.max(score, 60);   // contains
                else if (fuzzyMatch(field, val)) score = Math.max(score, 40); // fuzzy
            }

            return { item, score };
        })
        .filter((x) => x.score > 0)                   // remove non-matches
        .sort((a, b) => b.score - a.score)           // sort by best match
        .map((x) => x.item);                         // return only product list

    return results;
}

function filterCheck(city) {
    document.querySelectorAll('.filter-btn').forEach(function (btn) { btn.classList.remove('active') })
    document.querySelector(`[data-city="${city}"`).classList.add('active')

    if (city == "hemmesi") {
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
    return products.filter(function (product) {
        return convertCityToEnglishName[product.city] === city
    })
}

// Modified cart structure to include quantity for each item
let myCart = JSON.parse(localStorage.getItem('myCart')) || []
cartQty.textContent = myCart.length

function addToCart(item) {
    const found = products.find(function (product) {
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
            cartBtn.click()
        } else {
            alert('Haryt sebediňizde öňdenem bar.')
            document.body.classList.remove('no-scroll')
            cartBtn.click()
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

cartBtn.addEventListener('click', function () {
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
    myCart = myCart.filter(function (product) {
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

let deliveryPrice = 0

function getOverlayContent() {
    const cities = {
        Aşgabat: [
            { city: 'Gelip aljak (9 mkr)', price: 0 },
            { city: 'Aşgabat şäheri', price: 20 },
            { city: 'Gämi', price: 40 },
            { city: 'Änew', price: 40 },
            { city: 'Garadamak', price: 40 },
            { city: 'Çoganly', price: 30 },
            { city: 'Bekrewe', price: 40 },
            { city: 'Abadan', price: 50 },
            { city: 'Arkadag', price: 50 },
            { city: 'Şäherim bellenmedik', price: 50 },

        ],

        Balkan: [
            { city: 'Türkmenbaşy', price: 50 },
            { city: 'Mikraýon', price: 50 },
            { city: 'Janga', price: 60 },
            { city: 'Ufra', price: 60 },
            { city: 'Awaza', price: 100 },
            { city: 'Gyýanly', price: 70 },
            { city: 'Guwlymaýak', price: 70 },
            { city: 'Belek', price: 60 },
            { city: 'Jebel', price: 70 },
            { city: 'Nebitdag', price: 70 },
            { city: 'Gyzylarbat', price: 70 },
            { city: 'Bizmergen', price: 80 },
            { city: 'Çeleken / Hazar', price: 80 },
            { city: 'Bekdaş / Garabogaz', price: 80 },
            { city: 'Gumdag', price: 80 },
            { city: 'Gazanjyk / Bereket', price: 90 },
            { city: 'Serdar', price: 90 },
            { city: 'Esenguly', price: 90 },
            { city: 'Etrek', price: 100 },
            { city: 'Şäherim bellenmedik', price: 100 }
        ],

        Lebap: [
            { city: 'Türkmenabat', price: 50 },
            { city: 'Serdarabat', price: 70 },
            { city: 'Dänev', price: 70 },
            { city: 'Sakar', price: 70 },
            { city: 'Seýdi', price: 70 },
            { city: 'Garabekewül', price: 80 },
            { city: 'Farap', price: 80 },
            { city: 'Darganata', price: 80 },
            { city: 'Halaç', price: 80 },
            { city: 'Kerki', price: 80 },
            { city: 'Hojambaz', price: 90 },
            { city: 'Amyderýa', price: 90 },
            { city: 'Köýtendag', price: 100 },
            { city: 'Gazojak', price: 100 },
            { city: 'Magdanly', price: 100 },
            { city: 'Döwletli', price: 100 },
            { city: 'Şäherim bellenmedik', price: 100 }
        ],

        Mary: [
            { city: 'Gelip aljak (Murgap magazin)', price: 10 },
            { city: 'Mary şäheri', price: 20 },
            { city: 'Ýolöten', price: 70 },
            { city: 'Murgap', price: 70 },
            { city: 'Türkmengala', price: 70 },
            { city: 'Baýramaly', price: 50 },
            { city: 'Wekilbazar', price: 50 },
            { city: 'Garagum', price: 80 },
            { city: 'Sakarçäge', price: 50 },
            { city: 'Oguzhan', price: 80 },
            { city: 'Şatlyk', price: 60 },
            { city: 'Tagtabazar', price: 100 },
            { city: 'Guşgy', price: 100 },
            { city: 'Şäherim bellenmedik', price: 100 }
        ],

        Daşoguz: [
            { city: 'Daşoguz şäheri', price: 50 },
            { city: 'Akdepe', price: 70 },
            { city: 'Gurbansoltan', price: 70 },
            { city: 'Gubadag', price: 70 },
            { city: 'S. A. Nyýazow', price: 70 },
            { city: 'Şabat', price: 70 },
            { city: 'Türkmenbaşy etr. / Oktýabr', price: 80 },
            { city: 'Boldumsaz', price: 80 },
            { city: 'Görogly', price: 70 },
            { city: 'Köneürgenç', price: 80 },
            { city: 'Ruhybelent', price: 100 },
            { city: 'Täze oba', price: 60 },
            { city: 'Gülistan', price: 60 },
            { city: 'Şäherim bellenmedik', price: 100 }
        ],

        Ahal: [
            { city: 'Tejen', price: 80 },
            { city: 'Şäherim bellenmedik', price: 100 }
        ]
    };

    // Calculate total using individual item quantities
    const itemsTotal = myCart.reduce((sum, item) => {
        const quantity = item.cartQuantity || 1;
        return sum + (parseInt(item.price) * quantity);
    }, 0);

    let grandTotal = 0

    const html = `
    <div class="sticky-wrapper">
            <div class="header-area">
                <div class="text-center leading-tight text-sm py-2 bg-black text-white">
                    <span class="block">250 TMT üsti eltip bermek MUGT ýa-da 20 TMT arzanlaşyk</span>
                </div>
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
                        </div>
                    </div>
                ` : ''}
            </div>
            
            ${myCart.length > 0 ? `
                <div class="complete-order">
                    <button id="show-order-form">Dowam et</button>
                </div>


                <!-- CUSTOMER FORM   HIDDEN BY DEFAULT -->
                <div class="customer-form-container container" id="customer-form" style="display: none"">
                    <h3>Sargyt Maglumatlary</h3>

                    <form id="order-form">
                        <!-- Name field -->
                        <div class="form-group">
                            <label for="customer-name">Adyňyz we Familiýaňyz *</label>
                            <input
                                type="text"
                                id="customer-name"
                                placeholder="Meselem: Selbi Ataýewa"
                                required
                            >
                        </div>

                        <!-- Phone Field with Flag -->
                        <div class="form-group">
                            <label for="customer-phone">Telefon belgisi *</label>
                            <div class="phone-input-wrapper">
                                <span class="phone-prefix">🇹🇲 +993</span>
                                <input
                                    type=""
                                    id="customer-phone"
                                    placeholder=" Meselem: 63 684707"
                                    maxlength="8"
                                    required
                                >
                            </div>
                        </div>

                        <!-- Province Dropdown -->
                        <div class="form-group">
                            <label for="customer-province">Welaýatyňyz *</label>
                            <select id="customer-province" required>
                                <option value="" disabled selected>Welaýat saýlaň</option>
                                <option value="Aşgabat">Aşgabat</option>
                                <option value="Mary">Mary</option>
                                <option value="Daşoguz">Daşoguz</option>
                                <option value="Balkan">Balkan</option>
                                <option value="Lebap">Lebap</option>
                                <option value="Ahal">Ahal</option>
                            </select>
                        </div>

                        <!-- City Dropdown -->
                        <div class="form-group">
                            <label for="customer-city">Şäher ýa-da etrap saýlaň *</label>
                            <select id="customer-city" required>
                                <option value="" disabled selected>Ilki welaýat saýlaň</option>
                            </select>
                        </div>

                        <!-- Address Field -->
                        <div class="form-group">
                            <label>Doly salgyňyz *</label>
                            <textarea
                                id="customer-address"
                                rows="3"
                                placeholder="Köçe, bina, öý belgisi..."
                                required
                            ></textarea>
                        </div>

                        <!-- Payment Option -->
                        <div class="form-group">
                            <label>Töleg görnüşi saýlaň *</label>
                            <select required>
                                <option value="" disabled selected>Töleg görnüşi</option>
                                <option value="">Sargydy alaňyzda nagt töleg</option>
                            </select>
                        </div>

                        ${myCart.length > 0 ? `
                            <div class="order-total-area">
                                <div class="order-total-last">
                                    
                                </div>
                            </div>
                        ` : ''}

                        <button type="submit" class="submit-order-btn">Sargydy Tassykla</button>
                        <button type="button" class="cancel-order-btn" id="cancel-form">Goýbolsun Et</button>
                    </form>
                </div>

            `
            : ''}
        </div>
    `




    setTimeout(() => {
        const provinceSelect = document.getElementById('customer-province');
        const citySelect = document.getElementById('customer-city');

        if (!provinceSelect || !citySelect) return;

        provinceSelect.addEventListener('change', function () {
            const selectedProvince = this.value;

            // Custom sorting logic
            let rawOptions = (cities[selectedProvince] || []).slice();

            // First, sort all alphabetically
            rawOptions.sort((a, b) => a.city.localeCompare(b.city, 'tk', { sensitivity: 'base' }));

            // Then organize by priority groups
            const pickups = rawOptions.filter(o => o.city.toLowerCase().includes('gelip aljak'));
            const unknowns = rawOptions.filter(o => o.city === 'Şäherim bellenmedik');
            const others = rawOptions.filter(o => !o.city.toLowerCase().includes('gelip aljak') && o.city !== 'Şäherim bellenmedik');

            let options = [...pickups, ...others, ...unknowns];

            // Clear and populate dropdown
            citySelect.innerHTML = `<option value="" disabled selected>Şäher saýlaň</option>`;

            options.forEach(({ city, price }) => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = `${city} (${price} TMT)`;
                option.dataset.price = price;
                citySelect.appendChild(option);
            });
        });


        citySelect.addEventListener('change', function () {
            const normalDeliveryPrice = Number(this.options[this.selectedIndex].dataset.price) || 0;
            let discount = 0;

            if (itemsTotal > 249) {
                // Discount is max 20, but not more than normal delivery price
                discount = Math.min(normalDeliveryPrice, 20);
            }

            deliveryPrice = normalDeliveryPrice - discount;
            grandTotal = Number(itemsTotal) + Number(deliveryPrice);

            let deliveryHTML = `
                <span class="text-black font-bold">${deliveryPrice} TMT</span>
            `;

            if (discount > 0) {
                deliveryHTML = `
                    <span class="text-gray-400 line-through text-sm">${normalDeliveryPrice} TMT</span>
                    <span class="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">-${discount} TMT</span>
                    <span class="text-green-600 font-bold">${deliveryPrice} TMT</span>
                `;
            }

            document.querySelector('.order-total-last').innerHTML = `
                <div class="cost">
                    <span>Harytlar:</span>
                    <span id="added-items">${itemsTotal} TMT</span>
                </div>
                <div class="cost">
                    <span>Eltip bermek:</span>
                    <span class="flex items-center gap-2">
                        ${deliveryHTML}
                    </span>
                </div>
                <div class="cost">
                    <span><strong>Jemi:</strong></span>
                    <span><strong>${grandTotal} TMT</strong></span>
                </div>
            `;
            document.querySelector('.order-total').innerHTML = '';
        });
    }, 0);


    return html
}

document.addEventListener('click', (e) => {
    if (e.target.matches('#show-order-form')) {
        const form = document.getElementById('customer-form')
        const button = document.getElementById('show-order-form')

        if (form && button) {
            form.style.display = "block"
            button.style.display = "none"

            form.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    if (e.target.matches('#cancel-form')) {
        const form = document.getElementById('customer-form');
        const button = document.getElementById('show-order-form');

        if (form && button) {
            form.style.display = 'none'
            button.style.display = 'block'

            document.getElementById('order-form').reset()
        }
    }


    // PHONE NUMBER AUTO FORMAT
    if (e.target.matches('#customer-phone')) {
        let value = e.target.value.replace(/\D/g, '')

        if (value.length > 2) {
            value = value.slice(0, 2) + ' ' + value.slice(2);
        }
        e.target.value = value
    }
});

document.addEventListener('submit', async (e) => {
    if (e.target.matches('#order-form')) {
        e.preventDefault()

        const submitBtn = document.querySelector('.submit-order-btn')
        const originalText = submitBtn.textContent

        submitBtn.disabled = true
        submitBtn.textContent = 'Iberilýär...'

        try {
            const customerName = document.getElementById('customer-name').value.trim()
            const customerPhone = document.getElementById('customer-phone').value.trim()
            const customerProvince = document.getElementById('customer-province').value
            const customerCity = document.getElementById('customer-city').value
            const customerAddress = document.getElementById('customer-address').value.trim()

            if (!myCart || myCart.length === 0) {
                alert('Sebediňiz boş!')
                submitBtn.disabled = false
                submitBtn.textContent = originalText
                return;
            }

            const itemsTotal = myCart.reduce((sum, item) => {
                const quantity = item.cartQuantity || 1
                return sum + (parseInt(item.price) * quantity)
            }, 0)

            const citySel = document.getElementById('customer-city')
            const cityOption = citySel ? citySel.options[citySel.selectedIndex] : null
            const baseDeliveryFee = cityOption ? (Number(cityOption.dataset.price) || 0) : 0

            let deliveryDiscount = 0
            if (itemsTotal > 249) {
                deliveryDiscount = Math.min(baseDeliveryFee, 20)
            }

            const finalDeliveryFee = baseDeliveryFee - deliveryDiscount
            const grandTotal = Number(itemsTotal) + finalDeliveryFee

            const orderItems = myCart.map(item => ({
                id: item.id,
                name: item.name,
                altName: item.altName,
                photo: item.photo,
                city: item.city,
                price: item.price,
                cartQuantity: item.cartQuantity || 1,
                stockQuantity: item.quantity,
                subtotal: parseInt(item.price) * (item.cartQuantity || 1)
            }))

            const orderNumber = await generateOrderNumber()

            // ============================================
            // NEW: DECREASE STOCK IMMEDIATELY
            // ============================================
            const db = window.firestoreDB

            for (const item of myCart) {
                const productRef = doc(db, 'products', item.id)
                const productSnap = await getDoc(productRef)

                if (productSnap.exists()) {
                    const currentStock = productSnap.data().quantity
                    const orderedQty = item.cartQuantity || 1
                    const newStock = currentStock - orderedQty

                    // Update stock immediately
                    await updateDoc(productRef, {
                        quantity: Math.max(0, newStock)
                    })

                    console.log(`📦 Stock updated: ${item.name} (${currentStock} → ${newStock})`)
                }
            }
            // ============================================

            const orderData = {
                customerName: customerName,
                customerPhone: "+993 " + customerPhone,
                customerProvince: customerProvince,
                customerCity: customerCity,
                customerAddress: customerAddress,

                items: orderItems,

                itemsTotal: Number(itemsTotal),
                deliveryFee: finalDeliveryFee,
                originalDeliveryFee: baseDeliveryFee,
                deliveryDiscount: deliveryDiscount,
                grandTotal: Number(grandTotal),

                orderNumber: orderNumber,
                status: "pending",
                createdAt: new Date().toISOString()
            }

            await saveOrderToFirebase(orderData)

            alert(`Sargyt kabul edildi! Sargyt belgisi: ${orderNumber}`)

            myCart = []
            localStorage.setItem('myCart', JSON.stringify(myCart))
            cartQty.textContent = myCart.length

            if (currentOverlay) {
                currentOverlay.remove()
                currentOverlay = null
                document.body.classList.remove('no-scroll')
            }
        } catch (error) {
            console.error('Order submission error:', error)
            alert('Ýalňyşlyk ýüze çykdy. Täzeden synanyşyň.')
        } finally {
            submitBtn.disabled = false
            submitBtn.textContent = originalText
        }
    }
})

async function generateOrderNumber() {
    try {
        const db = window.firestoreDB
        const ordersRef = collection(db, 'orders')
        const snapshot = await getDocs(ordersRef)

        const orderCount = snapshot.size + 1

        const paddedNumber = orderCount.toString().padStart(3, '0')

        return `KOZ-${paddedNumber}`
    } catch (error) {
        console.error("Error generating order number:", error)
        return `KOZ-${Date.now()}`
    }
}

async function saveOrderToFirebase(orderData) {
    try {
        const db = window.firestoreDB
        const ordersRef = collection(db, 'orders')

        const docRef = await addDoc(ordersRef, orderData)

        console.log('✅ Order saved with ID:', docRef.id)
        return docRef.id
    } catch (error) {
        console.error('❌ Error saving order:', error);
        throw error;
    }
}