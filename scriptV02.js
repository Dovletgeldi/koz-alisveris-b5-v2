const information = document.getElementById("information");
const telInput = document.getElementById("tel-input");
const telMessage = document.getElementById("tel-message");
const telSubmit = document.getElementById("tel-submit");

// Reset the form
function resetForm() {
  telMessage.innerHTML = "";
  const tableElement = document.querySelector(".order-table");
  if (tableElement) {
    tableElement.remove();
  }
}

// when telSubmit is clicked
telSubmit.addEventListener("click", function () {
  resetForm();

  telMessage.innerHTML = "Aranıyor...";
  const phoneNumber = telInput.value;
  getDataFromSheet(phoneNumber);
});

// Fetch data from Google Sheets

async function getDataFromSheet(phoneNumber) {
  try {
    const response = await fetch("google-sheets-cache/cached_data.json");

    if (!response.ok) {
      throw new Error("Network response was not ok");
    } else {
      const response = await fetch("google-sheets-cache/cached_data.json");

      if (response.ok) {
        const combinedData = await response.json();
        const values = combinedData.values;
        const phoneNumberColumnIndex = 16;

        // Find data for the entered phone number
        const foundData = values.filter(
          (row) => row[phoneNumberColumnIndex] === phoneNumber
        );

        if (foundData.length > 0) {
          telMessage.innerHTML = `Hormatly müşderimiz ${foundData[0][15]}, sargytlaryňyz şu şekildedir:`;

          foundData.forEach((row) => {
            let status;
            const productDate = row[3];
            const productName = row[7];
            const productNumber = row[5];
            const productPrice = Math.ceil(row[11]);
            const productWeight = Math.ceil(row[12]);
            const totalProductPrice = Math.ceil(row[14]);
            let productLink;

            if (!row[8] || row[8] === "") {
              productLink = "images/hazirki wagtda surat mumkin dal.png";
            } else {
              productLink = row[8];
            }

            const productPriceTMT = Math.ceil(row[13]);

            if (row[17] == "habar edildi") {
              status = `Sargydyňyz geldi, "${row[15]}" atly kişä habar berildi.`;
            } else if (row[17] == "G  owşuryldy" || row[17] == "gowushdy") {
              status = `Sargydyňyz geldi, "${row[15]}" atly kişä gowşuryldy.`;
            } else if (row[1] == "iade") {
              status =
                "Gynansakda sargydyňyz gowy ýagdaýda gelmedigi üçin yzyna tabşyryldy.";
            } else if (row[1] == "iptal") {
              status = "Sargydyňyz goý bolsun edildi.";
            } else if (
              row[1] === "ucak1" ||
              row[1] === "ucak2" ||
              row[1] === "ucak3" ||
              row[1] === "ucak4"
            ) {
              status =
                "Sargydyňyz Istanbuldan Aşgabada dogry ýola çykdy. Takmynan geljek wagty iň gysga wagtda şu ýerde ýazar.";
            } else if (
              row[1] == 1 ||
              row[1] == 2 ||
              row[1] == 3 ||
              row[1] == 4
            ) {
              status =
                "Sargydyňyz Istanbuldan Aşgabada dogry ýola çykdy. Takmynan geljek wagty iň gysga wagtda şu ýerde ýazar.";
            } else if (
              row[1] === "" ||
              (row[1] === "ucak" && typeof row[17] === "undefined")
            ) {
              status =
                "Sargydyňyz kabul edildi. Barlamak üçin gelmegine garaşylýar.";
            } else if (row[12] != 0) {
              status = "Sargydyňyz geldi, habarlaşyp alyp bilersiňiz.";
            } else {
              function checker() {
                var pattern = /^[0-9\-.]{8}$/;
                let a = row[1];
                return pattern.test(a);
              }
              if (checker() === true) {
                status = `Sargydyňyz ýolda. Takmynan ${row[1]} aralygynda geler.`;
              } else {
                status = "Haryt barada biz bilen habarlaşmagyňyzy soraýarys.";
              }
            }

            telMessage.innerHTML += `
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
                  <span>${productPriceTMT}  TMT</span>
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
        } else {
          telMessage.innerHTML =
            'Maalesef girdiğiniz telefon numarasına ait sipariş bulunamadı. Girdiğiniz numaranın doğruluğundan ve başında "8" veya "+993" olmadığından emin olun.<br><br>YA DA<br><br>Hemen sipariş verin:<br>IMO: +90 541 942 0722<br>Link: +90 541 942 0722, ID: kozalisveris<br> Instagram: @koz.tm  <br><br> *Değerli müşterimiz siparişleriniz sistemimize sipariş verkdikten 24 saat sonra düşmektedir. ';
        }
      }
    }
  } catch (error) {
    telMessage.innerHTML = "Bir hata oluştu. Lütfen tekrar deneyiniz.";
    console.error("Fetch error:", error);
  }
}

// function shuffleArray(array) {
//   const startIndex = 3; // Start shuffling from the fourth element (index 3)
//   for (let i = array.length - 1; i > startIndex; i--) {
//     // Generate a random index from startIndex to i
//     const j = Math.floor(Math.random() * (i - startIndex + 1)) + startIndex;
//     // Swap elements at indices i and j
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// }

// (async () => {
//   const adsSheet = await fetch(
//     "https://sheets.googleapis.com/v4/spreadsheets/1oj6CSda05eOaSpYyOGl2WrwH-1-3TGQoQJwTO5FLmzU/values/ads!B:S?key=AIzaSyCVdAOP5Sq6_2TsvgViEvHLC_hrrQJYCTo"
//   );

//   if (adsSheet.ok) {
//     const data = await adsSheet.json();
//     let filteredValues = data.values;

//     filteredValues = shuffleArray(filteredValues);

//     filteredValues.forEach((row, index) => {
//       if (index < 3) return; // Skip the first three rows if they contain headers or irrelevant data

//       const [
//         prdctCode,
//         prdctName,
//         ,
//         prdctPrice,
//         ,
//         ,
//         prdctStock,
//         prdctDescription,
//         prdctBrand,
//         ...prdctPhoto
//       ] = row;

//       // Create a container for each product
//       const productContainer = document.createElement("div");
//       productContainer.classList.add("product-box");
//       productContainer.innerHTML = `<!-- product box -->

//         <span class="p-discount">-20%</span>
//         <!-- image container -->
//         <div class="p-img-container">
//           <div class="p-img">
//             <a href="#">
//               <img id="imageURL" alt="photo" />
//             </a>
//             <div id="prevButton" onclick="prevImage()"></div>
//             <div id="nextButton" onclick="nextImage()"></div>
//           </div>
//         </div>

//         <!-- text----------------->
//         <div class="p-box-text">
//           <!--category-->

//           <div class="product-category">
//             <span id="product-brand"></span>
//             <a href="#" class="product-title" id="product-name"> </a>
//           </div>
//           <!--Title-->

//           <span id="product-code"></span>
//           <!--Product Price-->
//           <div class="price-buy">
//             <span class="p-price" id="price"></span>
//           </div>
//         </div>`; // the product HTML string goes here

//       const imageElement = productContainer.querySelector("#imageURL");

//       imageElement.addEventListener("click", function (event) {
//         event.preventDefault(); // Prevent the default anchor click behavior
//         const rect = imageElement.getBoundingClientRect();
//         const x = event.clientX - rect.left;

//         if (x < rect.width / 2) {
//           prevImage();
//         } else {
//           nextImage();
//         }
//       });

//       // Set the content for each product
//       const productCodeElement =
//         productContainer.querySelector("#product-code");
//       productCodeElement.textContent = `Ürün kodu: ${prdctCode}`;

//       const productNameElement =
//         productContainer.querySelector("#product-name");
//       productNameElement.textContent = prdctName;

//       const productPriceElement = productContainer.querySelector("#price");
//       productPriceElement.textContent = prdctPrice;

//       const productBrandElement =
//         productContainer.querySelector("#product-brand");
//       productBrandElement.textContent = prdctBrand;

//       // Append the product container to the main section
//       document.querySelector(".p-slider").appendChild(productContainer);

//       // Image navigation functions
//       let currentImageIndex = 0;

//       function updateImage() {
//         const imageUrlElement = productContainer.querySelector("#imageURL");
//         imageUrlElement.src = prdctPhoto[currentImageIndex];
//       }

//       function nextImage() {
//         currentImageIndex = (currentImageIndex + 1) % prdctPhoto.length;
//         updateImage();
//       }

//       function prevImage() {
//         currentImageIndex =
//           (currentImageIndex - 1 + prdctPhoto.length) % prdctPhoto.length;
//         updateImage();
//       }

//       // Event listeners for next/prev buttons
//       const nextButton = productContainer.querySelector("#nextButton");
//       nextButton.onclick = nextImage;

//       const prevButton = productContainer.querySelector("#prevButton");
//       prevButton.onclick = prevImage;

//       // Preload images
//       prdctPhoto.forEach((url) => {
//         const img = new Image();
//         img.src = url;
//       });

//       // Update the image initially
//       updateImage();
//     });
//   } else {
//     console.error("Failed to fetch the ads sheet.");
//   }
//   console.log();
// })();
