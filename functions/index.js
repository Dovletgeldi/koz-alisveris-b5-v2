const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

setGlobalOptions({ region: 'europe-central2' });

// Initialize Firebase Admin
admin.initializeApp();

// Email configuration
const EMAIL_CONFIG = {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,  // Using environment variables
    recipient: 'kozalisveris@gmail.com'
};

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_CONFIG.user,
        pass: EMAIL_CONFIG.pass
    }
});

// This function triggers when a new order is created
exports.sendOrderEmail = onDocumentCreated('orders/{orderId}', async (event) => {
    try {
        const orderData = event.data.data();
        const orderId = event.params.orderId;

        console.log('New order detected:', orderData.orderNumber);

        // Build email HTML
        const emailHTML = buildOrderEmail(orderData, orderId);

        // Email options
        const mailOptions = {
            from: `KöZ Alışveriş <${EMAIL_CONFIG.user}>`,
            to: EMAIL_CONFIG.recipient,
            subject: `🛍️ Täze Sargyt: ${orderData.orderNumber}`,
            html: emailHTML
        };

        // Send email
        await transporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully for:', orderData.orderNumber);

    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
});

// ============================================
// FUNCTION: Confirm Order (Kabul et)
// ============================================
exports.confirmOrder = onRequest({
    region: 'europe-central2',
    cors: true
}, async (req, res) => {
    try {
        const orderId = req.query.orderId;

        if (!orderId) {
            return res.status(400).send('Order ID gerekli');
        }

        const db = admin.firestore();
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return res.status(404).send('Sargyt tapylmady');
        }

        const orderData = orderDoc.data();

        // Check if already confirmed
        if (orderData.status === 'confirmed') {
            return res.send(`
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 50px;
                            background: #f0f0f0;
                        }
                        .message { 
                            background: #fff3cd; 
                            padding: 30px; 
                            border-radius: 10px; 
                            display: inline-block;
                            border: 2px solid #ffc107;
                        }
                    </style>
                </head>
                <body>
                    <div class="message">
                        <h2>⚠️ Bu sargyt öň kabul edildi!</h2>
                        <p>Sargyt belgisi: <strong>${orderData.orderNumber}</strong></p>
                        <p style="margin-top: 20px;">
                            <a href="https://console.firebase.google.com/project/kozalisveris-23966/firestore/data/orders/${orderId}" 
                               style="padding: 10px 20px; background: #f27a1a; color: white; text-decoration: none; border-radius: 5px;">
                                Firebase'de Gör
                            </a>
                        </p>
                    </div>
                </body>
                </html>
            `);
        }

        // Check if rejected
        if (orderData.status === 'rejected') {
            return res.send(`
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 50px;
                            background: #f0f0f0;
                        }
                        .message { 
                            background: #f8d7da; 
                            padding: 30px; 
                            border-radius: 10px; 
                            display: inline-block;
                            border: 2px solid #dc3545;
                        }
                    </style>
                </head>
                <body>
                    <div class="message">
                        <h2>⚠️ Bu sargyt ret edildi!</h2>
                        <p>Sargyt belgisi: <strong>${orderData.orderNumber}</strong></p>
                        <p>Ret edilen sargydy kabul edip bilmersiňiz.</p>
                    </div>
                </body>
                </html>
            `);
        }

        // ============================================
        // REMOVED: Stock decrease (already done when order placed)
        // Just update order status
        // ============================================

        await orderRef.update({
            status: 'confirmed',
            confirmedAt: new Date().toISOString()
        });

        console.log(`✅ Order ${orderData.orderNumber} confirmed!`);

        // Send success response
        res.send(`
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: #f0f0f0; 
                    }
                    .success { 
                        background: #d4edda; 
                        padding: 30px; 
                        border-radius: 10px; 
                        display: inline-block; 
                        border: 2px solid #28a745;
                        max-width: 600px;
                    }
                    .details { 
                        background: white; 
                        padding: 15px; 
                        margin-top: 20px; 
                        border-radius: 5px; 
                        text-align: left; 
                    }
                </style>
            </head>
            <body>
                <div class="success">
                    <h1>✅ Sargyt Kabul Edildi!</h1>
                    <p style="font-size: 1.2em;">Sargyt belgisi: <strong>${orderData.orderNumber}</strong></p>
                    
                    <div class="details">
                        <h3>📦 Sargyt Harytlary:</h3>
                        <ul style="text-align: left;">
                            ${orderData.items.map(item => `
                                <li>${item.name} - <strong>${item.cartQuantity} sany</strong></li>
                            `).join('')}
                        </ul>
                        <p style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 5px;">
                            💡 Harytlaryň mukdary sargyt berlen wagtynda eýýäm täzelenipdir.
                        </p>
                    </div>
                    
                    <div class="details" style="margin-top: 15px;">
                        <h3>👤 Müşderi:</h3>
                        <p><strong>Ady:</strong> ${orderData.customerName}</p>
                        <p><strong>Telefon:</strong> ${orderData.customerPhone}</p>
                        <p><strong>Şäher:</strong> ${orderData.customerCity}</p>
                    </div>
                    
                    <p style="margin-top: 20px;">
                        <a href="https://console.firebase.google.com/project/kozalisveris-23966/firestore/data/orders/${orderId}" 
                           style="padding: 12px 30px; background: #f27a1a; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            📋 Firebase'de Gör
                        </a>
                    </p>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('❌ Error confirming order:', error);
        res.status(500).send(`
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h2>❌ Ýalňyşlyk ýüze çykdy</h2>
                <p>${error.message}</p>
            </body>
            </html>
        `);
    }
});

exports.rejectOrder = onRequest({
    region: 'europe-central2',
    cors: true
}, async (req, res) => {
    try {
        const orderId = req.query.orderId;

        if (!orderId) {
            return res.status(400).send('Order ID gerekli');
        }

        const db = admin.firestore();
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return res.status(404).send('Sargyt tapylmady');
        }

        const orderData = orderDoc.data();

        // Check if already rejected
        if (orderData.status === 'rejected') {
            return res.send(`
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 50px;
                            background: #f0f0f0;
                        }
                        .message { 
                            background: #f8d7da; 
                            padding: 30px; 
                            border-radius: 10px; 
                            display: inline-block;
                            border: 2px solid #dc3545;
                        }
                    </style>
                </head>
                <body>
                    <div class="message">
                        <h2>⚠️ Bu sargyt öň ret edildi!</h2>
                        <p>Sargyt belgisi: <strong>${orderData.orderNumber}</strong></p>
                    </div>
                </body>
                </html>
            `);
        }

        // Check if confirmed
        if (orderData.status === 'confirmed') {
            return res.send(`
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 50px;
                            background: #f0f0f0;
                        }
                        .message { 
                            background: #fff3cd; 
                            padding: 30px; 
                            border-radius: 10px; 
                            display: inline-block;
                            border: 2px solid #ffc107;
                        }
                    </style>
                </head>
                <body>
                    <div class="message">
                        <h2>⚠️ Bu sargyt öň kabul edildi!</h2>
                        <p>Sargyt belgisi: <strong>${orderData.orderNumber}</strong></p>
                        <p>Kabul edilen sargydy ret edip bilmersiňiz.</p>
                    </div>
                </body>
                </html>
            `);
        }

        // ============================================
        // NEW: INCREASE STOCK BACK (Return items to inventory)
        // ============================================
        const stockUpdates = [];
        for (const item of orderData.items) {
            const productRef = db.collection('products').doc(item.id);
            const productDoc = await productRef.get();

            if (productDoc.exists) {
                const currentStock = productDoc.data().quantity;
                const orderedQuantity = item.cartQuantity || 1;
                const newStock = currentStock + orderedQuantity;

                await productRef.update({
                    quantity: newStock
                });

                stockUpdates.push({
                    name: item.name,
                    returned: orderedQuantity,
                    oldStock: currentStock,
                    newStock: newStock
                });

                console.log(`↩️ Stock returned: ${item.name} (${currentStock} → ${newStock})`);
            }
        }
        // ============================================

        // Update order status to rejected
        await orderRef.update({
            status: 'rejected',
            rejectedAt: new Date().toISOString()
        });

        console.log(`❌ Order ${orderData.orderNumber} rejected!`);

        // Send success response
        res.send(`
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: #f0f0f0; 
                    }
                    .rejected { 
                        background: #f8d7da; 
                        padding: 30px; 
                        border-radius: 10px; 
                        display: inline-block; 
                        border: 2px solid #dc3545;
                        max-width: 600px;
                    }
                    .details { 
                        background: white; 
                        padding: 15px; 
                        margin-top: 20px; 
                        border-radius: 5px; 
                        text-align: left; 
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        background: #f8f9fa;
                        font-weight: 600;
                    }
                </style>
            </head>
            <body>
                <div class="rejected">
                    <h1>❌ Sargyt Ret Edildi</h1>
                    <p style="font-size: 1.2em;">Sargyt belgisi: <strong>${orderData.orderNumber}</strong></p>
                    
                    <div class="details">
                        <h3>↩️ Yzyna Gaýtarylan Harytlar:</h3>
                        <table>
                            <tr>
                                <th>Haryt</th>
                                <th>Sargyt</th>
                                <th>Öňki</th>
                                <th>Täze</th>
                            </tr>
                            ${stockUpdates.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.returned} sany</td>
                                    <td>${item.oldStock}</td>
                                    <td><strong>${item.newStock}</strong></td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                    
                    <div class="details" style="margin-top: 15px;">
                        <h3>👤 Müşderi:</h3>
                        <p><strong>Ady:</strong> ${orderData.customerName}</p>
                        <p><strong>Telefon:</strong> ${orderData.customerPhone}</p>
                    </div>
                    
                    <p style="margin-top: 20px;">
                        <a href="https://console.firebase.google.com/project/kozalisveris-23966/firestore/data/orders/${orderId}" 
                           style="padding: 12px 30px; background: #f27a1a; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            📋 Firebase'de Gör
                        </a>
                    </p>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('❌ Error rejecting order:', error);
        res.status(500).send(`
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h2>❌ Ýalňyşlyk ýüze çykdy</h2>
                <p>${error.message}</p>
            </body>
            </html>
        `);
    }
});

// Function to build email HTML
function buildOrderEmail(order, orderId) {
    const WEBSITE_URL = 'https://kozalisveris.com';

    const itemsHTML = order.items.map(item => {
        // Convert relative paths to absolute URLs
        let imageUrl = item.photo;
        if (item.photo && !item.photo.startsWith('http')) {
            imageUrl = `${WEBSITE_URL}/${item.photo.replace('./', '')}`;
        }

        return `
        <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
            <h3 style="margin: 5px 0; color: #333;">📦 ${item.name}</h3>
            <p style="margin: 5px 0; color: #666;">Ýazyjy: ${item.altName}</p>
            <p style="margin: 5px 0; color: #666;">Harydyň ýerleşýän ýeri: ${item.city}</p>
            <p style="margin: 5px 0; color: #666;">Baha: ${item.price} TMT × ${item.cartQuantity} = ${item.subtotal} TMT</p>
            ${item.photo ? `<img src="${imageUrl}" alt="${item.name}" style="max-width: 150px; margin-top: 10px; border-radius: 8px; border: 1px solid #ddd;" onerror="this.style.display='none'" />` : ''}
        </div>
    `}).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
                .header { background: #19283b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                .info-section { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #f27a1a; }
                .total { font-size: 1.3em; font-weight: bold; color: #f27a1a; margin-top: 10px; }
                .delivery-highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #f27a1a; }
                .timestamp { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🛍️ Täze Sargyt</h1>
                    <h2 style="margin: 10px 0 0 0; color: #f27a1a;">${order.orderNumber}</h2>
                </div>
                
                <div class="content">
                    <div class="info-section">
                        <h2 style="margin-top: 0;">👤 Müşderi Maglumatlary</h2>
                        <p><strong>Ady:</strong> ${order.customerName}</p>
                        <p><strong>Telefon:</strong> ${order.customerPhone}</p>
                        
                        <div class="delivery-highlight">
                            <p style="margin: 5px 0;"><strong>📍 Eltip bermek ýeri:</strong></p>
                            <p style="margin: 5px 0; padding-left: 10px;">• Welaýat: <strong>${order.customerProvince || 'Bellenmedik'}</strong></p>
                            <p style="margin: 5px 0; padding-left: 10px;">• Şäher/Etrap: <strong>${order.customerCity}</strong></p>
                            <p style="margin: 10px 0 5px 0;"><strong>💰 Eltip bermek bahasy:</strong> 
                                ${order.deliveryDiscount > 0
            ? `<span style="text-decoration: line-through; color: #6c757d; font-size: 0.9em;">${order.originalDeliveryFee} TMT</span> 
                                   <span style="color: #28a745; font-weight: bold; margin-left: 5px;">${order.deliveryFee} TMT</span> 
                                   <span style="background: #d4edda; color: #155724; font-size: 0.8em; padding: 2px 8px; border-radius: 10px; margin-left: 8px; font-weight: bold;">-${order.deliveryDiscount} TMT</span>`
            : `${order.deliveryFee} TMT`
        }
                            </p>
                        </div>
                        
                        <p><strong>Doly salgy:</strong> ${order.customerAddress}</p>
                    </div>
                    
                    <div class="info-section">
                        <h2 style="margin-top: 0;">📦 Sargyt Maglumatlary</h2>
                        ${itemsHTML}
                    </div>
                    
                    <div style="text-align: right; padding: 20px; background: white; border-radius: 8px; margin-top: 15px; border: 2px solid #f27a1a;">
                        <p style="margin: 5px 0;">Harytlar jemi: <strong>${order.itemsTotal} TMT</strong></p>
                        <p style="margin: 5px 0;">Eltip bermek: 
                            ${order.deliveryDiscount > 0
            ? `<span style="text-decoration: line-through; color: #6c757d; font-size: 0.9em;">${order.originalDeliveryFee} TMT</span> 
                                   <span style="color: #28a745; font-weight: bold; margin-left: 5px;">${order.deliveryFee} TMT</span>`
            : `<strong>${order.deliveryFee} TMT</strong>`
        }
                        </p>
                        <hr style="border: 1px solid #ddd; margin: 10px 0;">
                        <p class="total">JEMI: ${order.grandTotal} TMT</p>
                    </div>

                    <div style="text-align: center; margin-top: 30px; padding: 25px; background: #f8f9fa; border-radius: 10px; border: 2px dashed #dee2e6;">
                        <h3 style="margin-top: 0; color: #495057;">⚡ Sargydy Tassyklaň</h3>
                        <p style="color: #6c757d; font-size: 0.95em; margin-bottom: 20px;">
                            "Kabul et" basanyňyzdan soň, harytlaryň mukdary awtomatiki täzelener.
                        </p>
                        
                        <div style="margin-top: 20px;">
                            <a href="https://europe-central2-kozalisveris-23966.cloudfunctions.net/confirmOrder?orderId=${orderId}" 
                            style="display: inline-block; padding: 15px 40px; background: #28a745; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1.1em; margin: 10px; box-shadow: 0 2px 5px rgba(40,167,69,0.3);">
                                ✅ Kabul et
                            </a>
                            
                            <a href="https://europe-central2-kozalisveris-23966.cloudfunctions.net/rejectOrder?orderId=${orderId}" 
                            style="display: inline-block; padding: 15px 40px; background: #dc3545; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1.1em; margin: 10px; box-shadow: 0 2px 5px rgba(220,53,69,0.3);">
                                ❌ Red et
                            </a>
                        </div>
                    </div>

                    <hr style="margin: 30px 0; border: none; border-top: 2px dashed #ddd;">
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://console.firebase.google.com/project/kozalisveris-23966/firestore/data/orders/${orderId}" 
                           style="display: inline-block; padding: 12px 30px; background: #f27a1a; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;"
                           target="_blank">
                            📋 Firebase'de Gör
                        </a>
                    </div>
                    
                    <div class="timestamp">
                        <p>Sargyt wagty: ${new Date(order.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Ashgabat'
        })}</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
}




// ============================================
// FUNCTION: Check Order (Secure Proxy with Service Account)
// ============================================
// const { google } = require('googleapis'); // MOVED TO TOP

exports.checkOrder = onRequest({
    region: 'europe-central2',
    cors: true
}, async (req, res) => {
    try {
        const phoneNumber = req.query.phone;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Authenticate with Service Account (Default Firebase credential)
        const auth = new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const client = await auth.getClient();
        console.log('🤖 Auth Client Email:', client.email); // DEBUG LOG
        const sheets = google.sheets({ version: 'v4', auth: client });

        // ID from env (User confirmed only using the first one)
        const sheetId = process.env.SHEET_ID_1;

        // Fetch using Sheets API
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Genel!A:R',
        });

        // Get data
        const allValues = response.data.values || [];

        const phoneNumberColumnIndex = 16; // Column 16 is Phone Number

        // Filter by phone number
        const foundData = allValues.filter(row => row[phoneNumberColumnIndex] === phoneNumber);

        // Return strictly the filtered data
        res.json(foundData);

    } catch (error) {
        console.error('❌ Error in checkOrder:', error);
        // DEBUG: Return the email we TRIED to use, if available
        let authEmail = 'unknown';
        try {
            const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
            const client = await auth.getClient();
            authEmail = client.email;
        } catch (e) { authEmail = 'failed_to_get_client'; }

        res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            debug_auth_email: authEmail
        });
    }
});

// ============================================
// FUNCTION: Scheduled Order Sync (Every 12 Hours)
// ============================================
exports.scheduledOrderSync = onSchedule({
    schedule: "every 12 hours",
    region: 'europe-central2',
    memory: '256MiB',
    timeoutSeconds: 300 // Allow up to 5 minutes
}, async (event) => {
    try {
        const db = admin.firestore();
        // Sheet ID from environment variables
        const sheetId = process.env.SHEET_ID_1;

        if (!sheetId) {
            console.error('❌ SHEET_ID_1 environment variable is not set');
            return;
        }

        // Authenticate with Service Account (Default Firebase credential)
        const auth = new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        console.log(`⏳ Starting scheduled sync for sheet: ${sheetId}`);

        // Fetch using Sheets API
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Genel!A:R', // Adjust range if needed
        });

        const rows = response.data.values || [];
        if (rows.length <= 1) {
            console.log('⚠️ No data found in Google Sheet (or only header).');
            return;
        }

        console.log(`📊 Fetched ${rows.length - 1} rows from Google Sheet.`);

        const trackingCollection = db.collection('tracking_orders');

        // Delete existing tracking_orders in batches to clear the collection
        // This ensures removed rows from Sheets are removed from Firestore
        const existingSnapshot = await trackingCollection.get();
        if (!existingSnapshot.empty) {
            const deleteBatch = db.batch();
            existingSnapshot.docs.forEach((doc) => deleteBatch.delete(doc.ref));
            await deleteBatch.commit();
            console.log(`🗑️ Cleared ${existingSnapshot.size} existing orders from tracking_orders.`);
        }

        // Process in batches of 500 (Firestore limit)
        let batch = db.batch();
        let counter = 0;

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const orderNumber = row[5] || `AUTO-${Date.now()}-${i}`;
            
            const orderData = {
                status: row[0] || "",
                productDate: row[1] || "",
                productName: row[2] || "",
                productQuantity: row[3] || 1,
                productLink: row[4] || "",
                orderNumber: orderNumber,
                customerName: row[12] || "",
                priceTL: parseFloat(row[13]) || 0,
                priceTMT: parseFloat(row[14]) || 0,
                weightPrice: parseFloat(row[15]) || 0,
                phone: row[16]?.toString().trim() || "",
                detailStatus: row[17] || "",
                totalPrice: (parseFloat(row[14]) || 0) + (parseFloat(row[15]) || 0),
                syncedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            const docRef = trackingCollection.doc(orderNumber);
            batch.set(docRef, orderData);
            counter++;

            // If we hit Firestore 500 limit, commit and start new batch
            if (counter % 500 === 0) {
                await batch.commit();
                batch = db.batch();
                console.log(`📦 Committed batch of 500 orders...`);
            }
        }

        if (counter % 500 !== 0) {
            await batch.commit();
        }

        console.log(`✅ Successfully synced ${counter} orders to Firestore.`);

    } catch (error) {
        console.error('❌ Error in scheduledOrderSync:', error);
    }
});

