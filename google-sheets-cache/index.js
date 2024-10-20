import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cacheFilePath = path.join(__dirname, "cached_data.json");

const sheetUrl1 =
  "https://sheets.googleapis.com/v4/spreadsheets/1oj6CSda05eOaSpYyOGl2WrwH-1-3TGQoQJwTO5FLmzU/values/Genel!A:R?key=AIzaSyCVdAOP5Sq6_2TsvgViEvHLC_hrrQJYCTo";
const sheetUrl2 =
  "https://sheets.googleapis.com/v4/spreadsheets/1c0pAa8lyQWlLwIRcWwxxxcHMjnLJrn_MRcYEhV5U2U8/values/Genel!A:R?key=AIzaSyCVdAOP5Sq6_2TsvgViEvHLC_hrrQJYCTo";

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

      fs.writeFileSync(cacheFilePath, JSON.stringify(combinedData), "utf8");
      console.log("Data cached successfully");
    } else {
      console.error("Failed to fetch data from Google Sheets");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function isCacheValid() {
  if (fs.existsSync(cacheFilePath)) {
    const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return now - cachedData.timestamp < twentyFourHours;
  }
  return false;
}

async function getData() {
  if (isCacheValid()) {
    console.log("Using cached data");
    const cachedData = JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
    return cachedData.values;
  } else {
    console.log("Fetching new data from Google Sheets");
    await fetchData();
    return JSON.parse(fs.readFileSync(cacheFilePath, "utf8")).values;
  }
}

// Example usage
(async () => {
  const data = await getData();
  console.log("Fetched Data:", data);
})();
