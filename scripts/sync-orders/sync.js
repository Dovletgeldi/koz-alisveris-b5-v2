const admin = require('firebase-admin');
const { google } = require('googleapis');
require('dotenv').config();
const path = require('path');

// Initialize Firebase Admin
const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH || './service-account.json';
const serviceAccount = require(path.resolve(__dirname, SERVICE_ACCOUNT_PATH));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const SHEET_ID = process.env.SHEET_ID_1 || '1oj6CSda05eOaSpYyOGl2WrwH-1-3TGQoQJwTO5FLmzU';

async function syncSheetsToFirestore() {
    try {
        console.log('🚀 Starting full column-based sync with photos...');

        const auth = new google.auth.GoogleAuth({
            keyFile: path.resolve(__dirname, SERVICE_ACCOUNT_PATH),
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const response = await sheets.spreadsheets.values.batchGet({
            spreadsheetId: SHEET_ID,
            ranges: [
                'Genel!A:A', // 0: Status
                'Genel!C:C', // 1: ID (No)
                'Genel!D:D', // 2: Date
                'Genel!F:F', // 3: Qty
                'Genel!H:H', // 4: Product Name
                'Genel!I:I', // 5: productLink (Resmi)
                'Genel!L:L', // 6: Price TL
                'Genel!N:N', // 7: Price TMT
                'Genel!M:M', // 8: Weight Price TMT
                'Genel!O:O', // 9: Total TMT
                'Genel!P:P', // 10: Customer Name
                'Genel!Q:Q', // 11: Phone
                'Genel!R:R'  // 12: Detail Status
            ],
        });

        const v = response.data.valueRanges || [];
        const getValue = (colIdx, rowIdx) => (v[colIdx] && v[colIdx].values && v[colIdx].values[rowIdx] && v[colIdx].values[rowIdx][0]) || '';

        const maxRows = Math.max(...v.map(r => (r.values ? r.values.length : 0)));
        console.log(`📦 Scanning ${maxRows} rows...`);

        const phoneCleaner = (p) => {
            let cleaned = String(p || '').replace(/\D/g, '');
            if (cleaned.startsWith('993') && cleaned.length > 10) cleaned = cleaned.slice(3);
            else if (cleaned.startsWith('8') && cleaned.length === 9) cleaned = cleaned.slice(1);
            return cleaned;
        };

        const orders = [];
        for (let i = 2; i < maxRows; i++) {
            const id = String(getValue(1, i)).trim();
            const phone = phoneCleaner(getValue(11, i));

            if (id && phone && id !== 'No') {
                orders.push({
                    id: id,
                    status: getValue(0, i),
                    productDate: getValue(2, i),
                    productQuantity: getValue(3, i) || '0',
                    productName: getValue(4, i),
                    productLink: getValue(5, i),
                    priceTL: parseFloat(String(getValue(6, i)).replace(',', '.')) || 0,
                    priceTMT: parseFloat(String(getValue(7, i)).replace(',', '.')) || 0,
                    weightPrice: parseFloat(String(getValue(8, i)).replace(',', '.')) || 0,
                    totalPrice: parseFloat(String(getValue(9, i)).replace(',', '.')) || 0,
                    customerName: getValue(10, i),
                    phone: phone,
                    detailStatus: getValue(12, i),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }

        console.log(`✅ Prepared ${orders.length} orders.`);

        const collectionRef = db.collection('tracking_orders');
        console.log('🗑️ Clearing...');
        const snapshot = await collectionRef.get();
        let batch = db.batch();
        let count = 0;
        for (const doc of snapshot.docs) {
            batch.delete(doc.ref);
            count++;
            if (count % 400 === 0) {
                await batch.commit();
                batch = db.batch();
            }
        }
        if (count % 400 !== 0 && count > 0) await batch.commit();

        console.log('📥 Adding...');
        batch = db.batch();
        count = 0;
        for (const order of orders) {
            const docRef = collectionRef.doc(order.id);
            batch.set(docRef, order);
            count++;
            if (count % 400 === 0) {
                await batch.commit();
                batch = db.batch();
            }
        }
        if (count % 400 !== 0 && count > 0) await batch.commit();

        console.log(`✨ Sync completed! Added ${count} records.`);

    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        process.exit();
    }
}

syncSheetsToFirestore();
