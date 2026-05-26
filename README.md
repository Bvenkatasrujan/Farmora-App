# Farmora — Smart Agriculture Companion App

Farmora is a modern, cross-platform mobile application designed to empower farmers and agricultural experts. Built with **React Native (Expo)**, **TypeScript**, and **Supabase**, the app provides weather insights, AI-driven crop disease detection, personalized crop calendars, peer-to-peer crop listing marketplaces, and an agricultural store.

---

## 📱 Screens & Features Breakdown

Farmora's architecture is divided into three key areas: Onboarding, Main Tab Navigation, and Specialized Sub-screens.

### 🔐 1. Authentication & Onboarding Flow
These screens handle language customization, location configuration, and account registration.

| Screen Name / File Route | Purpose & UI Features | Integrations & Device APIs |
| :--- | :--- | :--- |
| **Language Selection**<br>[language.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/(auth)/language.tsx) | Prompts user to select preferred language (English, Telugu, Hindi, etc.) using custom button selectors. | Stores user choice locally via custom translation context (`useTranslation` hook) and syncs it with Supabase. |
| **Welcome Slides**<br>[welcome.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/(auth)/welcome.tsx) | Beautiful onboarding screens showcasing app benefits (disease scan, P2P sales) with sliding screens. | Conditional navigation checking if onboarding has been completed previously. |
| **Intro Splash**<br>[splash.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/(auth)/splash.tsx) | Smooth loading animation with app branding to transition into auth state. | Authentication state listener checks if an active token exists. |
| **Location Setup**<br>[location.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/(auth)/location.tsx) | Prompts coordinates configuration. Supports automatic GPS capture or manual Mandal, District, and State search. | Integrates with `expo-location` to fetch real-time latitude/longitude coordinates. Saves to local store. |
| **User Sign-up**<br>[signup.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/(auth)/signup.tsx) | Secure registry form checking email formatting, passwords validation, and full name matching. | Connects to `supabase.auth.signUp()`. Activates database trigger to automatically seed profiles in the database. |
| **User Login**<br>[login.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/(auth)/login.tsx) | Secure credential entry interface. | Calls `supabase.auth.signInWithPassword()` to authenticate users. |
| **User Details Profile**<br>[user-details.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/(auth)/user-details.tsx) | Secondary onboarding questionnaire saving user role (Farmer, Buyer, Expert) and custom details. | Executes Supabase profile upsert to update user details. |

### 🗂️ 2. Main Navigation Tabs
The core application tabs configured in the tab bar for fast switching.

| Screen Name / File Route | Purpose & UI Features | Integrations & Device APIs |
| :--- | :--- | :--- |
| **Home Dashboard**<br>[index.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/(tabs)/index.tsx) | Command center. Shows local temperature, agricultural warnings, task widgets, and floating chatbot access. | Fetches live weather using cached coords. Aggregates data from `scan_logs` and `calendar_tasks` tables. |
| **AI Disease Detect**<br>[detect.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/(tabs)/detect.tsx) | Lets users diagnose leaf issues. Includes camera viewports, gallery uploads, simulation loader, and history logs. | Integrates `expo-image-picker` and Camera APIs. Stores scan results in the `scan_logs` database table. |
| **Crop Calendar**<br>[calendar.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/(tabs)/calendar.tsx) | Lists agricultural milestones (Sowing, Irrigation, Pest Control) grouped by day cycle for Rice/Wheat. | Full CRUD (Read/Write/Update/Delete) operations on the `calendar_tasks` table. |
| **P2P Marketplace**<br>[find-buyers.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/(tabs)/find-buyers.tsx) | P2P trading boards listing crops, prices, stock amount, distance coordinates, and seller numbers. | Queries the `buyers_sellers` table to retrieve matching seller listings. |
| **Profile Settings**<br>[profile.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/(tabs)/profile.tsx) | Settings hub. Edit details, change app language, update locations, and manage app session. | Updates user settings inside the `profiles` table. Handles local session teardown and sign out. |

### 🌾 3. Specialized Application Screens
Deeper feature screens navigated from the Home Dashboard or Agri-shop.

| Screen Name / File Route | Purpose & UI Features | Integrations & Device APIs |
| :--- | :--- | :--- |
| **Crop Advisory**<br>[crop-recommendation.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/crop-recommendation.tsx) | Farm input form evaluating soil type, pH levels, water accessibility, and rainfall to recommend suitable crops. | Incorporates multi-language translation and advises on seed selection. |
| **Detailed Weather**<br>[weather-report.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/weather-report.tsx) | Complete meteorological readout showing weekly forecasts, UV index, wind speeds, and rain warnings. | Queries local/mock weather API feeds with latitude/longitude inputs. |
| **Market Stock Trends**<br>[market-stocks.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/market-stocks.tsx) & [market-trendings.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/market-trendings.tsx) | Detailed stock tables and price fluctuation indicators tracking Indian agriculture indices. | Connects to mock data structures aligned with current market rates. |
| **Agri Products Shop**<br>[products.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/products.tsx) | Fertilizer, seed, pesticide, and hardware catalog with pricing and in-stock badges. | Retrieves inventory lists from the `products` Supabase table. |
| **Seller Detail Card**<br>[seller-details.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/seller-details.tsx) | Supplier information card featuring verification indicators, crop catalogs, and direct phone/SMS/WhatsApp hotlinks. | Selects data from `buyers_sellers` table. Uses `expo-linking` for quick dialing. |
| **Government Schemes**<br>[updates-schemes.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/updates-schemes.tsx) | Dashboard displaying state/national subsidies, insurance claims, and news articles for farmers. | Direct data feeds from regional update lists. |
| **Notifications**<br>[notifications.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/notifications.tsx) | Log list showing system notices, security logs, weather warnings, and local push notifications history. | Queries the `notifications` database table. Integrates `expo-notifications`. |
| **Security & Privacy**<br>[security.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/security.tsx) | Privacy configurations containing login logs, device authorizations, and account deletion options. | Interacts with Supabase Auth schema. |
| **Support Helpdesk**<br>[support.tsx](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/app/support.tsx) | Customer service interface, ticketing submissions, and FAQ lists. | Submits customer feedback and questions. |

---

## 🛠️ Technology Stack

- **Framework**: Expo SDK 54 (React Native)
- **Routing**: Expo Router v6 (File-based navigation)
- **Language**: TypeScript
- **Styling**: TailwindCSS via NativeWind v4 & CSS Interop
- **Backend & Auth**: Supabase (PostgreSQL Database, RLS Policies, and GoTrue Auth)
- **State Management**: Zustand
- **Local Storage**: AsyncStorage
- **Icons**: Lucide React Native

---

## ⚙️ Environment Setup

Before starting the app, you must configure your backend credentials.

### 1. Create a `.env` File
Create a file named `.env` in the root directory of your project:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-api-key
```

### 2. Database Schema Setup (Supabase)
Login to your Supabase Dashboard, select your project, go to the **SQL Editor**, paste the contents of [supabase_schema.sql](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/supabase_schema.sql), and run it. This script:
- Creates the `profiles`, `buyers_sellers`, `products`, `calendar_tasks`, and `scan_logs` tables.
- Automatically handles new user sign-ups with PostgreSQL triggers to auto-create profiles.
- Configures Row Level Security (RLS) policies to keep user data secure.
- Seeds mock marketplace listings and agri-shop products.

---

## 🚀 Running the App Locally

### 1. Install Dependencies
Run the following command in the root folder of your project to install the node packages:
```bash
npm install
```

### 2. Start the Metro Bundler
Start the development server:
```bash
npx expo start
```
From the interactive terminal window, you can press:
- `a` to run on a connected Android device or emulator.
- `i` to run on an iOS simulator (requires Xcode on macOS).
- `w` to run the web version.
- Scan the QR code on screen using the **Expo Go** app on your physical iOS/Android phone to run it directly on your mobile device.

---

## 📦 Building the Android APK

Because building an APK locally requires the full Android SDK and Java JDK configured, the simplest, recommended way is to build using **EAS Build** in the cloud.

### Step 1: Install EAS CLI
To avoid system permission errors on macOS, install EAS CLI locally as a project developer dependency:
```bash
npm install -D eas-cli
```
*(Alternatively, you can install it globally via `sudo npm install -g eas-cli` if you have administrator rights).*

### Step 2: Log into your Expo Account
Authenticate with your Expo account (you will be prompted to create one if you don't have it):
```bash
npx eas login
```

### Step 3: Trigger the APK Build
Run the following build command which uses the `preview` profile configured in `eas.json` to generate a downloadable `.apk` file:
```bash
npx eas build --platform android --profile preview
```
1. When prompted to configure credentials, choose **Yes** (Expo will handle key generators).
2. Follow the printed dashboard link to monitor progress.
3. Once completed, scan the QR code or click the download link to download the APK directly onto your Android device!

---

## 📤 Pushing to Git & GitHub

We have configured `.gitignore` to safely exclude your local `.env` variables containing Supabase keys. Follow these commands to push the project to your GitHub:

1. **Create a Repository**: Go to [github.com/new](https://github.com/new), type `Farmora-App`, leave "README" and "gitignore" **unchecked**, and create the repository.
2. **Execute Terminal Commands**:
   ```bash
   # Stage files
   git add .
   
   # Commit changes
   git commit -m "feat: complete project setup with Supabase and build fixes"
   
   # Add remote URL (replace URL if repository name is different)
   git remote add origin https://github.com/Bvenkatasrujan/Farmora-App.git
   
   # Select main branch
   git branch -M main
   
   # Push files
   git push -u origin main
   ```

---

## 🐛 Troubleshooting & Solved Build Blockers

If you encounter previous failures, here are the three major issues that were resolved in this codebase to make building successful:

### 1. Hermes Compiler Crash (`exit code: 2` on `@supabase/supabase-js`)
- **The Issue**: Supabase's ES Module uses dynamic `import()` statements (with Webpack comments) to import telemetry components. The React Native Hermes bytecode compiler (`hermesc`) does not support dynamic import statements and crashes when processing it.
- **The Fix**: In [metro.config.js](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/metro.config.js#L54-L61), we intercept `@supabase/supabase-js` imports and redirect them to the CommonJS build (`dist/index.cjs`) which uses standard `require()` calls and compiles perfectly.

### 2. Node.js Static Rendering Crash (`window is not defined` on `AsyncStorage`)
- **The Issue**: Web static pre-rendering compiles the screen files inside a Node.js compiler environment at build time. During this compile, Node.js does not have a `window` object. Since `AsyncStorage` tries to access `window` when initialized by Supabase auth, the pre-rendering crashed.
- **The Fix**: In [src/services/supabase.ts](file:///Users/venkatasrujanbellamkonda/Farmora%20App%20Project/src/services/supabase.ts#L14-L31), we wrapped `AsyncStorage` with an SSR-safe check: `Platform.OS === 'web' && typeof window === 'undefined'`. It returns `null` safely during build time and functions normally during runtime on devices.

### 3. Android Resource Compilation Crash (`Aapt2CompileRunnable` failed)
- **The Issue**: Illustration image files (`camera_permission_illustration.png`, `location_permission_illustration.png`, `media_permission_illustration.png`, and `seedlings_illustration.png`) inside `assets/images/` were JPEGs renamed to end in `.png`. The Android asset packaging compiler (`AAPT2`) strictly checks binary headers and threw compilation errors due to file mismatches.
- **The Fix**: Decoded and re-encoded all four assets as true PNG images using the macOS `sips` image processing tool.
