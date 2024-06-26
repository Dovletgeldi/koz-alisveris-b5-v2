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
  const response1 = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1oj6CSda05eOaSpYyOGl2WrwH-1-3TGQoQJwTO5FLmzU/values/Genel!A:R?key=AIzaSyCVdAOP5Sq6_2TsvgViEvHLC_hrrQJYCTo`
  );
  const response2 = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/1c0pAa8lyQWlLwIRcWwxxxcHMjnLJrn_MRcYEhV5U2U8/values/Genel!A:R?key=AIzaSyCVdAOP5Sq6_2TsvgViEvHLC_hrrQJYCTo`
  );

  if (response1.ok && response2.ok) {
    const data1 = await response1.json();
    const data2 = await response2.json();
    const combinedData = {
      values: [...data1.values, ...data2.values],
    };

    const values = combinedData.values;
    const phoneNumberColumnIndex = 15;

    // Find data for the entered phone number
    const foundData = values.filter(
      (row) => row[phoneNumberColumnIndex] === phoneNumber
    );

    if (foundData.length > 0) {
      telMessage.innerHTML = `Değerli müşterimiz ${foundData[0][14]}, siparişleriniz şu şekildedir:`;

      foundData.forEach((row) => {
        let status;
        const productDate = row[3];
        const productName = row[7];
        const productNumber = row[5];
        const productPrice = row[6];
        const productWeight = row[11];
        const totalProductPrice = row[13];
        const productLink = row[17];
        const productPriceTMT = row[12];

        if (row[16] == "habar edildi") {
          status = `Siparişiniz geldi, "${row[14]}" kişisine haber verildi.`;
        } else if (row[16] == "gowşuryldy" || row[16] == "gowushdy") {
          status = `Siparişiniz geldi, "${row[14]}" kişisine teslim edildi.`;
        } else if (row[1] == "iade") {
          status = "Maalesef siparişiniz kusurlu geldiği için iade edildi.";
        } else if (row[1] == "iptal") {
          status = "Siparişiniz iptal edilmiştir.";
        } else if (
          row[1] === "ucak1" ||
          row[1] === "ucak2" ||
          row[1] === "ucak3" ||
          row[1] === "ucak4"
        ) {
          status =
            "Siparişiniz İstanbul'dan Aşkabata doğru yola çıktı. Tahmini gelme süresi en kısa zamanda burada gözükecektir.";
        } else if (row[1] == 1 || row[1] == 2 || row[1] == 3 || row[1] == 4) {
          status =
            "Siparişiniz İstanbul'dan Aşkabata doğru yola çıktı. Tahmini gelme süresi en kısa zamanda burada gözükecektir.";
        } else if (
          row[1] === "" ||
          (row[1] === "ucak" && typeof row[16] === "undefined")
        ) {
          status = "Siparişiniz alındı. Kontrol için gelmesini bekliyoruz.";
        } else if (row[11] != 0) {
          status = "Siparişiniz geldi, hemen arayıp alabilirsiniz.";
        } else {
          function checker() {
            var pattern = /^[0-9\-.]{8}$/;
            let a = row[1];
            return pattern.test(a);
          }
          if (checker() === true) {
            status = `Siparişiniz İstanbul'dan Aşkabata doğru yola çıktı. Tahmini olarak ${row[1]} tarihleri arasında gelecektir.`;
          } else {
            status = "Ürün durumunda sıkıntı var, lütfen bize haber verin.";
          }
        }

        telMessage.innerHTML += `
          <div class="container">
            <div class="row mt-4">
              <div class="col-md-12">
                <div class="product-container">
                  <a href="${productLink}" target="_blank">
                    <img src="${productLink}" alt="photo" class="product-image"  />
                  </a>
                  <div class="product-details">
                    <div class="product-name">${productName}</div>
                    <div class="product-prices">
                      <span class="price-tl">${productPrice} TL</span>
                      <span class="arrow"> → </span>
                      <span class="price-tmt">${productPriceTMT} TMT</span>
                      <span class="price-cargo">${productWeight} TMT</span>
                      <span class="price-cargo">${totalProductPrice} TMT</span>
                    </div>
                    <div class="product-status">${status}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      telMessage.innerHTML += informationContent;
    } else {
      telMessage.innerHTML =
        'Maalesef girdiğiniz telefon numarasına ait sipariş bulunamadı. Girdiğiniz numaranın doğruluğundan ve başında "8" veya "+993" olmadığından emin olun.<br><br>YA DA<br><br>Hemen sipariş verin:<br>IMO: +90 541 942 0722<br>Link: +90 541 942 0722, ID: kozalisveris<br> Instagram: @koz.tm  <br><br> *Değerli müşterimiz siparişleriniz sistemimize sipariş verkdikten 24 saat sonra düşmektedir. ';
    }
  }
}

function shuffleArray(array) {
  const startIndex = 3; // Start shuffling from the fourth element (index 3)
  for (let i = array.length - 1; i > startIndex; i--) {
    // Generate a random index from startIndex to i
    const j = Math.floor(Math.random() * (i - startIndex + 1)) + startIndex;
    // Swap elements at indices i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

(async () => {
  const adsSheet = await fetch(
    "https://sheets.googleapis.com/v4/spreadsheets/1oj6CSda05eOaSpYyOGl2WrwH-1-3TGQoQJwTO5FLmzU/values/ads!B:S?key=AIzaSyCVdAOP5Sq6_2TsvgViEvHLC_hrrQJYCTo"
  );

  if (adsSheet.ok) {
    const data = await adsSheet.json();
    let filteredValues = data.values;

    filteredValues = shuffleArray(filteredValues);

    filteredValues.forEach((row, index) => {
      if (index < 3) return; // Skip the first three rows if they contain headers or irrelevant data

      const [
        prdctCode,
        prdctName,
        ,
        prdctPrice,
        ,
        ,
        prdctStock,
        prdctDescription,
        prdctBrand,
        ...prdctPhoto
      ] = row;

      // Create a container for each product
      const productContainer = document.createElement("div");
      productContainer.classList.add("product-box");
      productContainer.innerHTML = `<!-- product box -->
      
        <span class="p-discount">-20%</span>
        <!-- image container -->
        <div class="p-img-container">
          <div class="p-img">
            <a href="#">
              <img id="imageURL" alt="photo" />
            </a>
            <div id="prevButton" onclick="prevImage()"></div>
            <div id="nextButton" onclick="nextImage()"></div>
          </div>
        </div>
    
        <!-- text----------------->
        <div class="p-box-text">
          <!--category-->
    
          <div class="product-category">
            <span id="product-brand"></span>
            <a href="#" class="product-title" id="product-name"> </a>
          </div>
          <!--Title-->
    
          <span id="product-code"></span>
          <!--Product Price-->
          <div class="price-buy">
            <span class="p-price" id="price"></span>
          </div>
        </div>`; // the product HTML string goes here

      const imageElement = productContainer.querySelector("#imageURL");

      imageElement.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the default anchor click behavior
        const rect = imageElement.getBoundingClientRect();
        const x = event.clientX - rect.left;

        if (x < rect.width / 2) {
          prevImage();
        } else {
          nextImage();
        }
      });

      // Set the content for each product
      const productCodeElement =
        productContainer.querySelector("#product-code");
      productCodeElement.textContent = `Ürün kodu: ${prdctCode}`;

      const productNameElement =
        productContainer.querySelector("#product-name");
      productNameElement.textContent = prdctName;

      const productPriceElement = productContainer.querySelector("#price");
      productPriceElement.textContent = prdctPrice;

      const productBrandElement =
        productContainer.querySelector("#product-brand");
      productBrandElement.textContent = prdctBrand;

      // Append the product container to the main section
      document.querySelector(".p-slider").appendChild(productContainer);

      // Image navigation functions
      let currentImageIndex = 0;

      function updateImage() {
        const imageUrlElement = productContainer.querySelector("#imageURL");
        imageUrlElement.src = prdctPhoto[currentImageIndex];
      }

      function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % prdctPhoto.length;
        updateImage();
      }

      function prevImage() {
        currentImageIndex =
          (currentImageIndex - 1 + prdctPhoto.length) % prdctPhoto.length;
        updateImage();
      }

      // Event listeners for next/prev buttons
      const nextButton = productContainer.querySelector("#nextButton");
      nextButton.onclick = nextImage;

      const prevButton = productContainer.querySelector("#prevButton");
      prevButton.onclick = prevImage;

      // Preload images
      prdctPhoto.forEach((url) => {
        const img = new Image();
        img.src = url;
      });

      // Update the image initially
      updateImage();
    });
  } else {
    console.error("Failed to fetch the ads sheet.");
  }
  console.log();
})();
