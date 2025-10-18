import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore'
import { products } from './data-harytlar.js'

const firebaseConfig = {
  apiKey: "AIzaSyCiWNT1ANy2eUfQFH4j8zM0k0fKMv5NJu4",
  authDomain: "kozalisveris-23966.firebaseapp.com",
  projectId: "kozalisveris-23966",
  storageBucket: "kozalisveris-23966.firebasestorage.app",
  messagingSenderId: "940239687913",
  appId: "1:940239687913:web:8a9ca807b5270423862078",
  measurementId: "G-LXGF7KCZL4"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function uploadProducts() {
    console.log("Starting to upload products...");
    
    
    for (const product of products) {
        try {
            const productData = {
                ...product,
                quantity: parseInt(product.quantity) || 0,
                price: product.price
            };

            await setDoc(doc(db, 'products', product.id), productData);

            console.log(`✅ Uploaded: ${product.name}`);
        } catch (error) {
            console.error(`❌ Error uploading ${product.name}`);
        }
    }

    console.log("ALL PRODUCTS UPLOADED!")
}

uploadProducts()
