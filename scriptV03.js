const information = document.getElementById("information");
const telInput = document.getElementById("tel-input");
const telMessage = document.getElementById("tel-message");
const telSubmit = document.getElementById("tel-submit");


//////////////////////////////////////////////////////////////
/////////////////   CHANGABLE      ///////////////////////////
export const postRate = "0.67"
export const halfRate = "0.64"
export const preRate = "0.61"

export const expressShippingRate = "100"

export const contactPhone = "+993 62 069428"

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////


document.querySelectorAll('.post-tl-rate').forEach(el => {
  el.textContent = postRate;
});

document.querySelectorAll('.half-tl-rate').forEach(el => {
  el.textContent = halfRate;
});

document.querySelectorAll('.pre-tl-rate').forEach(el => {
  el.textContent = preRate;
});

document.querySelectorAll('.express-shipping').forEach(el => {
  el.textContent = expressShippingRate;
});

document.querySelectorAll('.contact-person-phone').forEach(el => {
  el.textContent = contactPhone;
});


// console.log(postTlRate)

console.log("Script V03.1 loaded at:", new Date().toLocaleTimeString());

// Reset the form
function resetForm() {
  console.log("Form reset requested");
  telMessage.innerHTML = "";
  const tableElement = document.querySelector(".order-table");
  if (tableElement) {
    tableElement.remove();
  }
}

// When telSubmit is clicked
if (telSubmit) {
  telSubmit.addEventListener("click", function (event) {
    event.preventDefault(); 
    event.stopPropagation();
    console.log("Search button clicked!");
    
    if (!telInput || !telMessage) {
      console.error("telInput or telMessage not found in DOM");
      return;
    }

    resetForm();

    telMessage.innerHTML = "Gözlenýär...";
    const phoneNumber = telInput.value;
    console.log("Querying for phoneNumber:", phoneNumber);
    getDataFromSheet(phoneNumber);
  });
}

// Fetch data from Firestore
async function getDataFromSheet(phoneNumber) {
  try {
    // Reference to Firestore (initialized in order-track.html)
    const db = firebase.firestore();
    
    // Normalize phone number: remove all non-digit characters
    let normalizedPhone = phoneNumber.replace(/\D/g, '');
    
    // Strip common prefixes if present (+993 or 8) 
    // Turkmen numbers are 8 digits starting with '6'
    if (normalizedPhone.startsWith('993') && normalizedPhone.length > 10) {
      normalizedPhone = normalizedPhone.slice(3); // Remove 993 prefix
    } else if (normalizedPhone.startsWith('8') && normalizedPhone.length === 9) {
      normalizedPhone = normalizedPhone.slice(1); // Remove leading 8
    }
    
    console.log("Final normalized phone for query:", normalizedPhone);

    // Query tracking_orders where phone matches
    const qSnapshot = await db.collection('tracking_orders')
      .where('phone', '==', normalizedPhone)
      .get();

    if (!qSnapshot.empty) {
      const foundData = qSnapshot.docs.map(doc => doc.data());
      
      // Build everything in a string first to avoid partial DOM updates
      let htmlContent = `<div class="customer-welcome">Hormatly müşderimiz ${foundData[0].customerName}, sargytlaryňyz şu şekildedir:</div>`;

      foundData.forEach((order) => {
        let status;
        const productName = order.productName;
        const productNumber = order.productQuantity;
        const productPrice = Math.ceil(order.priceTL);
        const productWeight = Math.ceil(order.weightPrice);
        const totalProductPrice = Math.ceil(order.totalPrice);
        let productLink;

        if (!order.productLink || order.productLink === "") {
          productLink = "images/hazirki wagtda surat mumkin dal.png";
        } else {
          productLink = order.productLink;
        }

        const productPriceTMT = Math.ceil(order.priceTMT);
        
        // Status determination logic
        const row1 = order.status;
        const row17 = order.detailStatus;

        if (row17 == "geldi") {
          status = `Sargydyňyz geldi, habarlaşyp alyp bilersiňiz: <br> +993 62 069428`;
        } else if (row17 == "habar edildi") {
          status = `Sargydyňyz geldi, "${order.customerName}" atly kişä habar berildi.`;
        } else if (row17 == "gowşuryldy" || row17 == "gowushdy") {
          status = `Sargydyňyz geldi, "${order.customerName}" atly kişä gowşuryldy.`;
        } else if (row1 == "iade") {
          status =
            "Gynansakda sargydyňyz gowy ýagdaýda gelmedigi üçin yzyna tabşyryldy.";
        } else if (row1 == "iptal") {
          status = "Sargydyňyz goý bolsun edildi.";
        } else if (
          row1 === "ucak1" ||
          row1 === "ucak2" ||
          row1 === "ucak3" ||
          row1 === "ucak4"
        ) {
          status =
            "Sargydyňyz Istanbuldan Aşgabada dogry ýola çykdy. Takmynan geljek wagty iň gysga wagtda şu ýerde ýazar.";
        } else if (row1 == 1 || row1 == 2 || row1 == 3 || row1 == 4) {
          status =
            "Sargydyňyz Istanbuldan Aşgabada dogry ýola çykdy. Takmynan geljek wagty iň gysga wagtda şu ýerde ýazar.";
        } else if (row1 === "" || row1 === "ucak") {
          status =
            "Sargydyňyz kabul edildi. Barlamak üçin gelmegine garaşylýar.";
        } else if (row17 === "yolda") {
          status = "Sargydyňyz ýolda. Aşgabada gelmegine garaşylýar.";

        } else if (Number(order.weightPrice) != 0) {
          status = "Sargydyňyz geldi, habarlaşyp alyp bilersiňiz.";
        } else {
          function checker() {
            var pattern = /^[0-9\-.]{8}$/;
            let a = row1;
            return pattern.test(a);
          }
          if (checker() === true) {
            status = `Sargydyňyz ýolda. Takmynan ${row1} aralygynda geler.`;
          } else {
            status = "Haryt barada biz bilen habarlaşmagyňyzy soraýarys.";
          }
        }

        htmlContent += `
          <div class="product-container">
            <div class="product">
              <span class="product-quantity">X${productNumber}</span>
              <a href="${productLink}" target="_blank">
                <img src="${productLink}" alt="Häzirki wagtda surat mümkin däl." class="product-image" />
              </a>
            </div>
            <div class="product-details">
              <div class="product-name">${productName}</div>
              <div class="product-prices">
                <div>
                  <h4>TL bahasy:</h4>
                  <span>${productPrice} TL</span>
                </div>
                <span id="sign">=></span>
                <div>
                  <h4>TMT bahasy:</h4>
                  <span>${productPriceTMT} TMT</span>
                </div>
                <span id="sign">+</span>
                <div>
                  <h4>KG bahasy:</h4>
                  <span>${productWeight} TMT</span>
                </div>
                <span id="sign">=</span>
                <div>
                  <h4>Jemi bahasy:</h4>
                  <span>${totalProductPrice} TMT</span>
                </div>
              </div>
              <div class="product-status">${status}</div>
            </div>
          </div>
          `;
      });

      htmlContent += `<div class="information-message">Bildiriş: Sargytlaryňyz sistemamyza sargyt edilen wagtyndan 24 sagat soň geçer.</div>`;
      
      // Set everything in ONE update
      telMessage.innerHTML = htmlContent;

    } else {
      telMessage.innerHTML =
        'Gynansakda giren belgiňiz üçin sargyt tapylmady. Giren belgiňiziň başynda "8" ýa-da "+993" bolmaly däldir.<br><br>*Bildiriş: Sargytlaryňyz sistemamyza sargyt edilen wagtyndan 24 sagat soň geçer.';
    }
  } catch (error) {
    console.error("Error fetching data from Firestore:", error);
    telMessage.innerHTML = "Bir ýalňyşlyk ýüze çykdy. Sonrak synanyşyň.";
  }
}