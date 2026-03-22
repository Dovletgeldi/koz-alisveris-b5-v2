const admin = require('firebase-admin');
const { google } = require('googleapis');
require('dotenv').config();
const path = require('path');

// Initialize Firebase Admin with Service Account
const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH || './service-account.json';
const serviceAccount = require(path.resolve(__dirname, SERVICE_ACCOUNT_PATH));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const SHEET_ID = process.env.SHEET_ID_1 || '1oj6CSda05eOaSpYyOGl2WrwH-1-3TGQoQJwTO5FLmzU';
const RANGE = 'Genel!A:R';

async function syncSheetsToFirestore() {
    try {
        console.log('🚀 Starting sync from Google Sheets to Firestore...');

        // 1. Authenticate with Google Sheets using Service Account
        const auth = new google.auth.GoogleAuth({
            keyFile: path.resolve(__dirname, SERVICE_ACCOUNT_PATH),
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        // 2. Fetch data from Sheets
        console.log(`📊 Fetching data from Sheet ID: ${SHEET_ID}`);
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: RANGE,
        });

        const allValues = response.data.values || [];
        if (allValues.length === 0) {
            console.warn('⚠️ No data found in the spreadsheet.');
            return;
        }

        // Skip header row
        const rows = allValues.slice(1); 
        console.log(`📦 Found ${rows.length} rows to sync.`);

        // 3. Prepare data for Firestore
        const trackingOrders = rows.map((row, index) => {
            return {
                status: row[1] || '',
                productDate: row[3] || '',
                productQuantity: row[5] || '0',
                productName: row[7] || '',
                productLink: row[8] || '',
                priceTL: row[11] || '0',
                weightPrice: row[12] || '0',
                priceTMT: row[13] || '0',
                totalPrice: row[14] || '0',
                customerName: row[15] || '',
                phone: (function(p) {
                    let cleaned = String(p || '').replace(/\D/g, '');
                    if (cleaned.startsWith('993') && cleaned.length > 10) cleaned = cleaned.slice(3);
                    else if (cleaned.startsWith('8') && cleaned.length === 9) cleaned = cleaned.slice(1);
                    return cleaned;
                })(row[16]),
                detailStatus: row[17] || '',
                rowIndex: index + 2,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            };
        }).filter(order => order.phone !== '');

        // 4. Update Firestore tracking_orders collection
        const collectionRef = db.collection('tracking_orders');
        
        console.log('🗑️ Clearing existing tracking_orders...');
        const snapshot = await collectionRef.get();
        const batchSize = 400;
        let currentBatch = db.batch();
        let count = 0;

        for (const doc of snapshot.docs) {
            currentBatch.delete(doc.ref);
            count++;
            if (count % batchSize === 0) {
                await currentBatch.commit();
                currentBatch = db.batch();
            }
        }
        if (count % batchSize !== 0 && count > 0) {
            await currentBatch.commit();
        }
        console.log(`✅ Deleted ${count} old records.`);

        console.log('📥 Adding new records...');
        currentBatch = db.batch();
        count = 0;
        for (const order of trackingOrders) {
            const docRef = collectionRef.doc();
            currentBatch.set(docRef, order);
            count++;
            if (count % batchSize === 0) {
                await currentBatch.commit();
                currentBatch = db.batch();
            }
        }
        if (count % batchSize !== 0 && count > 0) {
            await currentBatch.commit();
        }

        console.log(`✨ Sync completed successfully! Added ${count} records.`);

    } catch (error) {
        console.error('❌ Sync failed:', error);
        if (error.message.includes('permission_denied')) {
            console.error('👉 Suggestion: Check if the service account has Editor access to the Firestore collection and Viewer access to the Google Sheet.');
        }
    }
}

syncSheetsToFirestore();
