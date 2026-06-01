# ⚡ ElectraShare

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)

**ElectraShare** is a modern web application designed to facilitate seamless energy sharing and management.

---

## ✨ Features

- **User Dashboard:** Intuitive interface for managing sharing preferences and monitoring usage.
- **Real-Time Data:** Live updates on energy distribution and availability.
- **Secure Authentication:** Robust user login and data protection.
- **Responsive Design:** Fully optimized for desktop, tablet, and mobile viewing.

---

## 🛠️ Technology Stack

This project is built using a modern JavaScript stack:

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Animation (Optional) | GSAP |

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v16.x or higher)
- npm or Yarn
- MongoDB (local or Atlas URI)

### Installation

**1. Clone the repository:**

```bash
git clone https://github.com/RaiUmerFarooq/electrashare.git
cd electrashare
```

**2. Install dependencies:**

Install the required packages for both the backend and frontend.

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

**3. Configure environment variables:**

Create a `.env` file in the root of your `backend` directory and add your configuration details:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**4. Run the application:**

Open two terminal windows to run the frontend and backend concurrently.

_Terminal 1 — Backend:_

```bash
cd backend
npm run dev
```

_Terminal 2 — Frontend:_

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`.

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
**Project Link:** [https://github.com/RaiUmerFarooq/electrashare](https://github.com/RaiUmerFarooq/electrashare)
