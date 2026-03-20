# How to run Order Sync locally (Web SDK Method)

This script synchronizes your Google Sheet data with Firebase Firestore. It uses your existing Firebase configuration, so no service account JSON file is required.

## 1. Setup Environment Variables
1. Open the `.env` file in this directory.
2. Ensure `SHEET_ID_1` and `SHEETS_API_KEY` are correct (I have pre-filled them for you).

## 2. Install Dependencies
Run the following command in your terminal within the `scripts/sync-orders` directory:
```bash
npm install
```

## 3. Run the Sync Script
Run the following command to start the synchronization:
```bash
npm start
```

## 4. Test the Website
1. Open `test-order-track.html` in your browser.
2. Enter a phone number that exists in your Google Sheet.
3. Verify that the order data is displayed correctly from Firestore.
