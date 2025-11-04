# 🕒 Daily Routine Tracker

A cross-platform mobile app built with **React Native (Expo)** + SQLite backend** to help users plan, track, and reflect on their daily activities with reminders and statistics.

---

## 🚀 Features

- 📋 Add, edit, and delete daily routines  
- 🔔 Local notifications for reminders (Expo Notifications)  
- 📅 Date-wise activity tracking  
- 📊 Progress statistics and summaries  
- 💾 Offline data storage with **SQLite**  
- 🔐 User login and logout functionality  
- 🌓 Light/Dark mode support  

---

## 🏗️ Tech Stack

### Frontend
- **React Native (Expo SDK 53+)**
- **SQLite** for local storage  
- **Expo Notifications** for reminders  
- **React Navigation** for screen management  

---

## 📁 Folder Structure

```
DailyRoutineTracker/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── db/
│
├── frontend/
│   ├── App.js
│   ├── screens/
│   │   ├── ActivityScreen.js
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── HomeScreen.js
│   │   ├── SettingsScreen.js
│   │   ├── ProfileScreen.js
│   ├── components/
│   ├── database/
│   │   └── database.js
│   ├── assets/
│   └── utils/
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository
```bash
git clone https://github.com/shammi22000/DailyRoutineTrackerNew.git
```

---


## 📱 Building APK (Android)

```bash
npx expo build:android
```

For re-builds:
```bash
npx expo run:android
```

> Use a **development build** instead of Expo Go for push notifications (SDK 53+).

---

## 🧠 Usage

1. Register and log in.  
2. Add new daily activities with date and time.
3. Add new activity category 
4. Receive notifications at scheduled times.  
5. View past records and progress graphs.  
6. Log out securely to clear session data.


## 🧰 Tools

- Visual Studio Code  
- Expo CLI  
- Git
- Android Studio (for emulator/testing)
