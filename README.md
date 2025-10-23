# 🚀 LastMileTracker

## Overview
**LastMileTracker** is a cross-platform mobile application built with **React Native** and **Expo**, designed to simplify last-mile delivery tracking for customers and delivery agents.

The app supports **iOS, Android, and Web**, offering real-time location tracking, delivery code verification, and role-based access for users and delivery personnel.

---

## 🛠️ Tech Stack
- **Frontend:** React Native + Expo Router  
- **Backend:** Node.js + Express + MongoDB + JWT Authentication  
- **Language:** TypeScript  
- **State Management:** React Query  
- **Icons:** Lucide React Native  

---

## 📱 Features
- User & Delivery Boy login system  
- Real-time delivery status tracking on a map  
- Secure authentication using JWT  
- Simple, responsive, and modern UI  
- Cross-platform compatibility (Android, iOS, Web)

---

## 🧩 Project Structure
```
├── app/                 # Screens and navigation
├── assets/              # Images and static assets
├── backend/             # Express + MongoDB API server
├── constants/           # Config and constants
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/pinjarlamanideep/lastmiletracker-frontend.git
cd lastmiletracker-frontend
```

### 2. Install Dependencies
```bash
npm install
```
or (if using Bun)
```bash
bun install
```

### 3. Run the App
- For web:
  ```bash
  npm run web
  ```
- For mobile (Expo):
  ```bash
  npm start
  ```
  Then scan the QR code in **Expo Go** app.

### 4. Run Backend (if included)
```bash
cd backend
npm install
npm run dev
```
Make sure to set your `.env` file with:
```
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_secret_key>
```

### 5. Update frontend API URL (important for device testing)

When running the frontend on a physical phone (Expo Go) or on emulators, you must point the frontend to your PC's backend address.

- Edit `constants/api.ts` and set `API_URL` to the correct address for your environment. Examples:

  - Physical device on same Wi‑Fi as your PC:
    ```ts
    export const API_URL = 'http://<your-pc-lan-ip>:5000'; // e.g. http://10.35.87.47:5000
    ```

  - Android emulator (default Android emulator):
    ```ts
    export const API_URL = 'http://10.0.2.2:5000';
    ```

  - iOS simulator or web on same machine:
    ```ts
    export const API_URL = 'http://localhost:5000';
    ```

- After changing `constants/api.ts`, restart the Expo dev server (clear cache if needed):
  ```bash
  npx expo start -c
  ```

If your device can't reach the backend, check your PC firewall settings and ensure port 5000 is open for your private network.

#### Auto-detect your PC IP (convenience)

There's a helper script that detects your machine's LAN IPv4 and updates `constants/api.ts` automatically. Run it before starting the app on a device:

```bash
npm run set-api-url
# or to override port:
npm run set-api-url -- 4000
```

This writes the detected URL into `constants/api.ts` so the app on your phone can connect to the backend without manual edits.

---

## 🧠 Future Enhancements
- Push Notifications  
- In-app Payments  
- Delivery route optimization  
- Custom analytics dashboard  

---

## 🧑‍💻 Author
**Manideep Pinjarla**  
Passionate about building full-stack and AI-powered mobile applications.
