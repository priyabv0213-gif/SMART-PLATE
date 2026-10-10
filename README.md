# SmartPlate — Smart Food Rescue and Redistribution Platform

This project is a food rescue and redistribution platform designed to reduce surplus food waste by connecting food donors with NGOs, shelters, and other recipient organisations. It uses the **SpoilClock Adaptive Rescue Engine** to evaluate food allocation, safety eligibility, mission timelines, and delivery feasibility.

The mobile application is built using **React Native**, **Expo**, and **TypeScript**. It connects to the shared backend, database, allocation engine, and Coimbatore geospatial data used by the web application. It does **not** wrap the website inside a WebView — it provides role-aware native mobile screens.

**Team Name:** NEXUS  
**Team Members:** PRIYA B,VAISHALIKA P,THANASHIVANI S

**Selected Problem Statement:** SMART FOOD WASTE REDISTRIBUTION SYSTEM

---

## 🛠️ Technologies & Tools Used

- **Programming Language:** TypeScript, JavaScript
- **Mobile Framework:** React Native
- **Development Platform:** Expo
- **Runtime Environment:** Node.js
- **Package Manager:** npm
- **Backend Communication:** HTTPS API
- **Core Engine:** SpoilClock Adaptive Rescue Engine
- **Routing and Feasibility:** Routing estimator, mission timeline calculation, and safety-gate checks
- **Geospatial Data:** Coimbatore geographical scenario data
- **Android Development:** Android Studio, Android Virtual Device (AVD), Gradle
- **Mobile Builds:** Expo Application Services (EAS)
- **Version Control:** Git and GitHub

---

## 📱 Mobile Roles & Features

### 1. Food Donors (`donor`)
- Manage verified restaurant/hotel profiles, including FSSAI licence information and location in Coimbatore.
- Register surplus food batches with quantity, food category, preparation time, and storage conditions (hot-holding / refrigeration).
- Attach food quality photographs for safety verification.
- Track donation status (`Available`, `Assigned`, `En Route`, `Delivered`).

### 2. NGOs & Shelters (`ngo`)
- View suitable surplus food batches in Coimbatore.
- Update requested meal demands and intake capacity dynamically.
- Accept or reject allocation proposals.
- View pickup instructions, route distance, travel ETA, and safe delivery margins.
- Confirm actual meals received or report intake closures and cancellations.

### 3. Dispatch Coordinators (`coordinator`)
- View operational metrics, including allocated meals, on-time percentage, Jain's fairness index, and CO₂ prevented.
- Run the SpoilClock adaptive allocation engine.
- Trigger mid-mission disruption simulations, including traffic jams, vehicle delays, and shelter cancellations.
- Inspect feasibility margins and algorithm explanations.

### 4. Competition Judge Sandbox (`judge_demo`)
- Explore a predefined 100-meal Coimbatore scenario involving The Grand Residency, Ukkadam Kitchen, Singanallur Shelter, and Asha Nivas.
- Simulate recipient cancellations and vehicle delays.
- Compare allocation results with Nearest-First and Static-Window baselines.
- Reset the demonstration scenario.

---

## 🚀 Running the App Locally

### Prerequisites
- Node.js (v18+)
- Android Studio with Android Virtual Device (AVD) **or** Expo Go installed on a compatible Android/iOS phone.

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

To generate standalone application builds without requiring Expo Go, use EAS (Expo Application Services) or local prebuild.

### Option A: Cloud EAS Build

1. Install EAS CLI and log in:

   ```bash
   npm install -g eas-cli
   eas login
   ```

2. Configure build profiles if required:

   ```bash
   eas build:configure
   ```

3. Build for Android:

   ```bash
   eas build -p android --profile preview
   ```

4. Build for iOS:

   ```bash
   eas build -p ios --profile preview
   ```

   *The output format and installation requirements depend on the configured build profile and platform signing settings.*

### Option B: Local Android Build

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

The expected APK output path is `android/app/build/outputs/apk/release/app-release.apk`.

---

## 🌐 Connecting to the Backend

By default, the mobile app connects to the deployed HTTPS backend:

`https://ec82ffb2f26a54.lhr.life`

To point to your local development server:

1. Open `mobile/src/api/client.ts`.
2. Update `DEFAULT_API_BASE` to your local machine IP, for example:

   `http://192.168.1.X:3001`

   **Note:** Android emulators can access the host machine using `http://10.0.2.2:3001`.

---

## 📚 External Resources Used

- React Native Documentation: https://reactnative.dev/docs/getting-started
- Expo Documentation: https://docs.expo.dev/
- Node.js Documentation: https://nodejs.org/docs/
- npm Documentation: https://docs.npmjs.com/
- GitHub Documentation: https://docs.github.com/

---

## 🤖 AI Tools Used

- **ChatGPT:** AI-assisted development support, technical explanations, debugging assistance, and documentation preparation.

Additional AI tools, APIs, datasets, and third-party libraries should be listed here if they were used in the actual implementation.

---

## 🌍 Expected Impact

- Reduce surplus food waste.
- Improve coordination between food donors and recipient organisations.
- Support time-feasible food delivery and food rescue.
- Improve the visibility of food allocation and mission status.
- Help organisations respond to vehicle delays and recipient cancellations.

---

**Project:** SmartPlate  
**Core Engine:** SpoilClock Adaptive Rescue Engine  
**Mobile Framework:** React Native + Expo  
**Programming Language:** TypeScript  
**Geographical Scenario:** Coimbatore, Tamil Nadu, India
