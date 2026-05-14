# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KöZ Alışveriş (`kozalisveris.com`) is a Turkmen e-commerce/cargo-forwarding website that lets customers order products from Turkey and track their shipments. The site is in Turkmen language.

## Architecture

This repo has three distinct layers:

### 1. Static Frontend (root)
Plain HTML/CSS/JS files deployed to `kozalisveris.com/public_html/` via FTP on push to `main`. No build step required for these files.
- `index.html` — main landing page
- `dukan.html` — product/store page
- `order-track.html` — order tracking page (uses Firebase directly via CDN)
- `scriptV03.js` — shared JS module; contains configurable business rates (`postRate`, `halfRate`, `preRate`, `expressShippingRate`, `contactPhone`) that are rendered into the page
- `harytlar.js` / `data-harytlar.js` — product data files
- `scriptHasapla.js` — price calculator logic
- `assets/css/style.css` — compiled from SCSS (do not edit directly)
- `assets/css/tailwind.css` — compiled from `src/tailwind.css` (do not edit directly)

### 2. Firebase Backend (`functions/`)
Cloud Functions (Node.js 22, region: `europe-central2`, Firebase project: `kozalisveris-23966`):
- `sendOrderEmail` — triggers on new Firestore `orders` doc; sends HTML email via Nodemailer/Gmail
- `confirmOrder` / `rejectOrder` — HTTP endpoints called from admin emails to accept/reject orders; reject restores product stock in `products` collection
- `checkOrder` — HTTP proxy that queries `tracking_orders` collection by phone number
- `scheduledOrderSync` — runs every 12 hours; reads Google Sheet `Genel!A:R`, clears and rewrites the `tracking_orders` Firestore collection

**Firestore collections:**
- `orders` — customer orders placed through the site
- `products` — product catalog with `quantity` stock field
- `tracking_orders` — synced from Google Sheets; queried by `phone` field; doc ID = column C order number (e.g. `S134`)

**Google Sheet column mapping (0-indexed):** B=status, C=orderNumber, D=productDate, F=quantity, H=productName, I=photo, J=productLink, L=priceTL, M=weightPrice, N=priceTMT, O=totalPrice, P=customerName, Q=phone, R=detailStatus

**Order status logic** (in `scriptV03.js` and `sync.js`): phone numbers are normalized to 8-digit Turkmen format by stripping `+993`/`993` prefix or leading `8`.

### 3. React App (`koz-react/`)
An in-progress Vite + React 19 + Tailwind CSS 4 app. Currently only contains a `Navbar` component. Not yet integrated with the main site or deployed.

### 4. Sync Scripts (`scripts/sync-orders/`)
Local Node.js scripts for manual Firestore operations. Use `service-account.json` + dotenv for auth. Run from within the `scripts/sync-orders/` directory.

## Commands

### Root (static site)
```bash
# Compile SCSS to assets/css/style.css (watch mode)
npm run compile:sass

# Build Tailwind CSS once
npm run tw:build

# Build Tailwind CSS (watch mode)
npm run tw:watch
```

### React App (`koz-react/`)
```bash
cd koz-react
npm run dev        # start Vite dev server
npm run build      # production build
npm run lint       # ESLint
npm run preview    # preview production build
```

### Firebase Functions (`functions/`)
```bash
cd functions
npm run serve      # start local emulator
npm run deploy     # deploy to Firebase (firebase deploy --only functions)
npm run logs       # tail function logs
```

### Sync Scripts (`scripts/sync-orders/`)
```bash
cd scripts/sync-orders
npm install
npm start          # runs sync.js — syncs Google Sheet → Firestore tracking_orders
```

## Deployment

- **Static site**: Auto-deployed via GitHub Actions FTP on push to `main` branch. The workflow excludes `node_modules`, `functions/`, `scss/`, `src/`, and utility scripts.
- **Firebase Functions**: Deploy manually with `firebase deploy --only functions` from `functions/` or via `npm run deploy`.
- The `koz-react/` app is not yet deployed.

## Key Config

- Business rates and contact phone are set as exports at the top of `scriptV03.js` and referenced site-wide via CSS class selectors (`.post-tl-rate`, `.half-tl-rate`, `.pre-tl-rate`, `.express-shipping`, `.contact-person-phone`).
- Firebase env vars for functions live in `functions/.env` (`MAIL_USER`, `MAIL_PASS`, `SHEET_ID_1`).
- Sync script env vars live in `scripts/sync-orders/.env`.
- The `service-account.json` in `scripts/sync-orders/` is gitignored and required for local sync runs.
