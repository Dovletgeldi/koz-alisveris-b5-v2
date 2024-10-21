import fetch from "node-fetch";
import fs from "fs";
import path from "path";

// Define the cache file path
const cacheFilePath = path.join(process.cwd(), "cached_data.json");

// URLs for Google Sheets API
const sheetUrl1 =
  "https://sheets.googleapis.com/v4/spreadsheets/1oj6CSda05eOaSpYyOGl2WrwH-1-3TGQoQJwTO5FLmzU/values/Genel!A:R?key=AIzaSyCVdAOP5Sq6_2TsvgViEvHLC_hrrQJYCTo";
const sheetUrl2 =
  "https://sheets.googleapis.com/v4/spreadsheets/1c0pAa8lyQWlLwIRcWwxxxcHMjnLJrn_MRcYEhV5U2U8/values/Genel!A:R?key=AIzaSyCVdAOP5Sq6_2TsvgViEvHLC_hrrQJYCTo";

// Fetch data from the Google Sheets API and update cache
async function fetchData() {
  try {
    const response1 = await fetch(sheetUrl1);
    const response2 = await fetch(sheetUrl2);

    if (response1.ok && response2.ok) {
      const data1 = await response1.json();
      const data2 = await response2.json();

      const combinedData = {
        values: [...data1.values, ...data2.values],
        timestamp: Date.now(),
      };

      // Write the combined data to the cache file
      fs.writeFileSync(cacheFilePath, JSON.stringify(combinedData), "utf8");
      console.log("Data cached successfully");
    } else {
      console.error("Failed to fetch data from Google Sheets");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Run the script to fetch new data and update cache
(async () => {
  await fetchData();
})();
