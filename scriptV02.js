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

// Reset the form
function resetForm() {
  telMessage.innerHTML = "";
  const tableElement = document.querySelector(".order-table");
  if (tableElement) {
    tableElement.remove();
  }
}

// When telSubmit is clicked
if (telSubmit) {
  telSubmit.addEventListener("click", function () {
    resetForm();

    telMessage.innerHTML = "Gözlenýär...";
    const phoneNumber = telInput.value;
    getDataFromSheet(phoneNumber);
  });
}

// Fetch data from Google Sheets
async function getDataFromSheet(phoneNumber) {
  const sheetUrl1 =
    "https://sheets.googleapis.com/v4/spreadsheets/1oj6CSda05eOaSpYyOGl2WrwH-1-3TGQoQJwTO5FLmzU/values/Genel!A:R?key=AIzaSyCVdAOP5Sq6_2TsvgViEvHLC_hrrQJYCTo";
  const sheetUrl2 =
    "https://sheets.googleapis.com/v4/spreadsheets/1c0pAa8lyQWlLwIRcWwxxxcHMjnLJrn_MRcYEhV5U2U8/values/Genel!A:R?key=AIzaSyCVdAOP5Sq6_2TsvgViEvHLC_hrrQJYCTo";
  try {
    const response1 = await fetch(sheetUrl1);
    const response2 = await fetch(sheetUrl2);

    if (response1.ok && response2.ok) {
      const data1 = await response1.json();
      const data2 = await response2.json();

      // Combine the data from both Google Sheets
      const combinedData = {
        values: [...data1.values, ...data2.values],
      };

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
          } else if (row[17] == "gowşuryldy" || row[17] == "gowushdy") {
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
          } else if (row[1] == 1 || row[1] == 2 || row[1] == 3 || row[1] == 4) {
            status =
              "Sargydyňyz Istanbuldan Aşgabada dogry ýola çykdy. Takmynan geljek wagty iň gysga wagtda şu ýerde ýazar.";
          } else if (row[1] === "" || row[1] === "ucak") {
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

          // Corrected the use of backticks here
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

        const informationContent =
          "Bildiriş: Sargytlaryňyz sistemamyza sargyt edilen wagtyndan 24 sagat soň geçer.";
        telMessage.innerHTML += informationContent;
      } else {
        telMessage.innerHTML =
          'Gynansakda giren belgiňiz üçin sargyt tapylmady. Giren belgiňiziň başynda "8" ýa-da "+993" bolmaly däldir.<br><br>*Bildiriş: Sargytlaryňyz sistemamyza sargyt edilen wagtyndan 24 sagat soň geçer.';
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}