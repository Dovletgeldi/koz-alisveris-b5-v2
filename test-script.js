const information = document.getElementById("information");
const telInput = document.getElementById("tel-input");
const telMessage = document.getElementById("tel-message");
const telSubmit = document.getElementById("tel-submit");

// When telSubmit is clicked
if (telSubmit) {
  telSubmit.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent any default form/button behavior
    resetForm();
    telMessage.innerHTML = "Gözlenýär (Firestore)...";
    const phoneNumber = telInput.value;
    console.log("Searching for:", phoneNumber);
    getDataFromFirestore(phoneNumber);
  });
}

function resetForm() {
    telMessage.innerHTML = "";
    information.innerHTML = "";
}

async function getDataFromFirestore(phoneNumber) {
  try {
    // Reference to Firestore db (initialized in HTML)
    const db = firebase.firestore();
    
    // Query tracking_orders where phone matches
    const qSnapshot = await db.collection('tracking_orders')
      .where('phone', '==', phoneNumber)
      .get();

    if (!qSnapshot.empty) {
      const orders = qSnapshot.docs.map(doc => doc.data());
      
      let htmlContent = `<div class="customer-welcome">Hormatly müşderimiz ${orders[0].customerName}, sargytlaryňyz şu şekildedir:</div>`;

      orders.forEach((order) => {
        let status;
        const productName = order.productName;
        const productNumber = order.productQuantity;
        const productPrice = Math.ceil(order.priceTL);
        const productWeight = Math.ceil(order.weightPrice);
        const totalProductPrice = Math.ceil(order.totalPrice);
        let productLink = order.productLink || "images/hazirki wagtda surat mumkin dal.png";
        const productPriceTMT = Math.ceil(order.priceTMT);

        // Status Logic
        const row1 = order.status;
        const row17 = order.detailStatus;

        if (row17 == "geldi") {
          status = `Sargydyňyz geldi, habarlaşyp alyp bilersiňiz: <br> +993 62 069428`;
        } else if (row17 == "habar edildi") {
          status = `Sargydyňyz geldi, "${order.customerName}" atly kişä habar berildi.`;
        } else if (row17 == "gowşuryldy" || row17 == "gowushdy") {
          status = `Sargydyňyz geldi, "${order.customerName}" atly kişä gowşuryldy.`;
        } else if (row1 == "iade") {
          status = "Gynansakda sargydyňyz gowy ýagdaýda gelmedigi üçin yzyna tabşyryldy.";
        } else if (row1 == "iptal") {
          status = "Sargydyňyz goý bolsun edildi.";
        } else if (["ucak1", "ucak2", "ucak3", "ucak4"].includes(row1) || [1, 2, 3, 4].includes(Number(row1))) {
          status = "Sargydyňyz Istanbuldan Aşgabada dogry ýola çykdy. Takmynan geljek wagty iň gysga wagtda şu ýerde ýazar.";
        } else if (row1 === "" || row1 === "ucak") {
          status = "Sargydyňyz kabul edildi. Barlamak üçin gelmegine garaşylýar.";
        } else if (Number(order.weightPrice) != 0) {
          status = "Sargydyňyz geldi, habarlaşyp alyp bilersiňiz.";
        } else {
            const pattern = /^[0-9\-.]{8}$/;
            if (pattern.test(row1)) {
              status = `Sargydyňyz ýolda. Takmynan ${row1} aralygynda geler.`;
            } else {
              status = "Haryt barada biz bilen habarlaşmagyňyzy soraýarys.";
            }
        }

        htmlContent += `
          <div class="product-container" style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 8px; display: flex; align-items: center; gap: 20px;">
            <div class="product" style="position: relative;">
              <span class="product-quantity" style="position: absolute; top: -5px; right: -5px; background: #f27a1a; color: white; padding: 2px 6px; border-radius: 50%; font-size: 12px;">X${productNumber}</span>
              <img src="${productLink}" alt="Häzirki wagtda surat mümkin däl." style="max-width: 100px; border-radius: 4px;" />
            </div>
            <div class="product-details">
              <div class="product-name"><strong>${productName}</strong></div>
              <div class="product-prices" style="font-size: 14px; margin-top: 5px;">
                <span>TL: ${productPrice} | TMT: ${productPriceTMT} | KG: ${productWeight} | Jemi: ${totalProductPrice} TMT</span>
              </div>
              <div class="product-status" style="color: #f27a1a; margin-top: 5px; font-weight: 600;">${status}</div>
            </div>
          </div>
        `;
      });

      htmlContent += "<p style='margin-top: 1rem; font-style: italic;'>*Bildiriş: Sargytlaryňyz sistemamyza sargyt edilen wagtyndan 24 sagat soň geçer.</p>";
      
      telMessage.innerHTML = htmlContent;
    } else {
      telMessage.innerHTML = 'Gynansakda giren belgiňiz üçin sargyt tapylmady.';
    }
  } catch (error) {
    console.error("Error fetching from Firestore:", error);
    telMessage.innerHTML = "Ýalňyşlyk ýüze çykdy.";
  }
}
