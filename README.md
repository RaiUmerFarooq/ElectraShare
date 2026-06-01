# ⚡ ElectraShare

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Django](https://img.shields.io/badge/django-5.1-green.svg)
![React Native](https://img.shields.io/badge/react--native-0.74-blue.svg)

**ElectraShare** is a peer-to-peer solar energy sharing platform that allows solar energy producers to share surplus electricity with consumers in real time. Built as a Final Year Project at FAST NUCES, it automates energy distribution, tracks solar readings, predicts electricity usage based on weather, and handles payments — all from a cross-platform mobile app.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#️-technology-stack)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## ✨ Features

- **Dual User Roles:** Separate flows for energy producers (solar panel owners) and consumers.
- **Real-Time Solar Tracking:** Live monitoring of solar power readings (watts) with weather context.
- **Weather-Based Prediction:** Electricity consumption forecasting using correlated weather data.
- **Peer-to-Peer Sharing:** Friend-request system for producers to connect with and share energy with consumers.
- **Stripe Payments:** Secure payment processing in PKR with automatic USD conversion.
- **JWT Authentication:** Stateless, token-based auth with email verification on signup.
- **Django Admin Panel:** Full back-office management of users, posts, readings, and payments.
- **Cross-Platform Mobile App:** Built with Expo (React Native) — runs on Android and iOS.

---

## 🏗️ Architecture

```
ElectraShare/
├── Backend/                  # Django REST API
│   ├── backend/              # Project config (settings, urls)
│   ├── core/                 # Users, posts, friend requests
│   ├── payments/             # Stripe payment processing
│   ├── sharing/              # Producer–consumer sharing relationships
│   ├── solar_readings/       # Solar power data ingestion
│   ├── prediction/           # Electricity usage prediction
│   ├── weather/              # Weather data models & endpoints
│   └── requirements.txt
│
└── final code/               # Expo (React Native) Mobile App
    ├── app/                  # Expo Router screens
    ├── components/           # Reusable UI components
    └── package.json
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Mobile Frontend | React Native, Expo (expo-router), NativeWind (Tailwind) |
| Backend | Python 3.9+, Django 5.1, Django REST Framework |
| Authentication | JWT (SimpleJWT), Email Verification, django-allauth |
| Database | MySQL |
| Payments | Stripe (stripe-react-native, stripe-js) |
| Weather / Prediction | Custom Django apps with weather data models |
| HTTP Client | Axios |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register/` | Register a new user (producer or consumer) |
| POST | `/api/login/` | Login and receive JWT tokens |
| GET | `/api/verify-email/<uid>/<token>/` | Email verification |
| GET/PUT | `/api/users/profile/` | View or update profile |
| PUT | `/api/edit-profile/` | Edit profile details |
| POST | `/api/post/` | Producer creates an energy sharing post |
| GET | `/api/users/find/` | Find available producers |
| POST | `/api/friend-request/send/` | Send a friend/sharing request |
| PUT | `/api/friend-request/manage/<id>/` | Accept or reject a request |
| GET | `/api/friend-requests/` | List incoming friend requests |
| GET | `/api/accepted-producers/` | List accepted producer connections |
| GET | `/api/show-producer-posts/` | View posts by connected producers |
| POST | `/api/payments/stripe/payment/` | Process a Stripe payment |
| GET | `/api/payments/list-all-producer-posts/` | List all producer posts for payment |
| GET | `/api/producer/connections/` | Producer's active consumer connections |
| PUT | `/api/producer/update-sharing/` | Toggle sharing on/off for a consumer |
| GET | `/api/consumer/shared-connections/` | Consumer's active sharing connections |
| GET | `/api/solar/` | Solar readings endpoints |
| GET | `/api/weather/` | Weather data endpoints |
| GET | `/api/prediction/` | Electricity usage prediction endpoints |

---

## 🚀 Getting Started

### Prerequisites

- [Python](https://www.python.org/) 3.9 or higher
- [pip](https://pip.pypa.io/)
- [MySQL](https://www.mysql.com/) 8.x or higher
- [Node.js](https://nodejs.org/) v18.x or higher
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/client) app on your phone (for testing)

---

### 1. Clone the repository

```bash
git clone https://github.com/RaiUmerFarooq/ElectraShare.git
cd ElectraShare
```

---

### 2. Backend Setup (Django)

```bash
cd Backend
```

**Create and activate a virtual environment:**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

**Install dependencies:**

```bash
pip install -r requirements.txt
```

**Configure environment variables:**

Create a `.env` file inside the `Backend/` directory:

```env
DJANGO_SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=*

# MySQL Database
DB_NAME=electrashare_db
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# Email (Gmail SMTP)
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=your_email@gmail.com

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
```

**Create the MySQL database:**

```sql
CREATE DATABASE electrashare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Run migrations:**

```bash
python manage.py makemigrations
python manage.py migrate
```

**Create a superuser (for Django admin):**

```bash
python manage.py createsuperuser
```

**Start the backend server:**

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/` and the admin panel at `http://localhost:8000/admin/`.

---

### 3. Mobile App Setup (Expo)

```bash
cd "../final code"
npm install
```

**Configure the API base URL:**

Open `constants/` or the relevant config file and set your backend URL:

```js
export const API_BASE_URL = "http://<your-local-ip>:8000/api";
```

> Use your machine's local IP (e.g. `192.168.1.x`), not `localhost`, so the phone can reach the backend.

**Start the Expo development server:**

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone, or press `a` for Android emulator / `i` for iOS simulator.

---

### Running Services Summary

| Service | URL / Command |
|---------|---------------|
| Django API | `http://localhost:8000/api/` |
| Django Admin | `http://localhost:8000/admin/` |
| Expo Dev Server | `npx expo start` → scan QR code |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 📞 Contact

**GitHub:** [RaiUmerFarooq](https://github.com/RaiUmerFarooq)  
**Project Link:** [https://github.com/RaiUmerFarooq/ElectraShare](https://github.com/RaiUmerFarooq/ElectraShare)
