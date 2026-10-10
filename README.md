# SpoilClock — Native React Native & Expo Mobile Application

This directory contains the separate, native mobile application for **SpoilClock**, built using **React Native**, **Expo**, and **TypeScript**.

It connects to the same shared backend, database, allocation engine, and Coimbatore geospatial data as the web application. It does **not** wrap the website inside a WebView — it provides authentic, role-aware native screens.

---

## 📱 Mobile Roles & Features

### 1. Food Donors (`donor`)
- Manage verified restaurant/hotel profile (FSSAI license, location in Coimbatore).
- Register surplus food batches with quantity, food category, preparation time, and storage conditions (hot-holding / refrigeration).
- Attach food quality photograph for safety verification.
- Real-time status tracking (`Available`, `Assigned`, `En Route`, `Delivered`).

### 2. NGOs & Shelters (`ngo`)
- View suitable surplus batches in Coimbatore.
- Update requested meal demands and intake capacity dynamically.
- Accept or reject allocation proposals.
- View pickup instructions, route distance, travel ETA, and safe delivery margins.
- Confirm actual meals received or report sudden intake closures/cancellations.

### 3. Dispatch Coordinators (`coordinator`)
- Live mobile operations deck with key metrics (allocated meals, on-time %, Jain's fairness index, CO₂ prevented).
- Run the SpoilClock adaptive allocation engine on demand.
- Trigger mid-mission disruption simulations (traffic jam, vehicle delay, shelter cancellations).
- Inspect feasibility margin and algorithm explanations.

### 4. Competition Judge Sandbox (`judge_demo`)
- Preloaded, self-contained 100-meal Coimbatore scenario (The Grand Residency to Ukkadam Kitchen, Singanallur Shelter, and Asha Nivas).
- Instant controls to simulate recipient cancellation or vehicle delay.
- Real-time comparison with Nearest-First and Static-Window baselines.
- Single-tap scenario reset.

---

## 🚀 Running the App Locally

### Prerequisites
- Node.js (v18+)
- Android Studio with Android Virtual Device (AVD) **or** Expo Go app installed on your physical Android/iOS phone.

### Quick Start
```bash
cd mobile
npm install
npx expo start
```

1. **Physical Phone (Android / iOS)**:
   - Open the **Expo Go** app on your phone.
   - Scan the QR code displayed in the terminal.
   - The app will bundle and run natively on your device.

2. **Android Emulator**:
   - Start an Android emulator in Android Studio.
   - In the terminal running `expo start`, press `a`.

3. **iOS Simulator** (macOS only):
   - In the terminal running `expo start`, press `i`.

---

## 📦 Generating Standalone Android APK & iOS Builds

To generate standalone production or preview binaries without requiring Expo Go, use EAS (Expo Application Services) or local prebuild:

### Option A: Cloud EAS Build (Recommended)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```
2. Configure build profiles (`eas build:configure`):
   ```bash
   eas build -p android --profile preview
   ```
   *This outputs a downloadable standalone `.apk` that can be installed on any Android phone.*
3. For iOS:
   ```bash
   eas build -p ios --profile preview
   ```
   *(Requires Apple Developer Account for ad-hoc or TestFlight signing).*

### Option B: Local Android Build
```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```
The output APK will be in `android/app/build/outputs/apk/release/app-release.apk`.

---

## 🌐 Connecting to the Backend

By default, the mobile app connects to the live HTTPS deployed backend:
`https://ec82ffb2f26a54.lhr.life`

To point to your local development server:
1. Open `mobile/src/api/client.ts`.
2. Update `DEFAULT_API_BASE` to your local machine IP, e.g., `http://192.168.1.X:3001`.
*(Note: Android emulators can access your host machine using `http://10.0.2.2:3001`)*.
