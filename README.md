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

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Python, Django, Django REST Framework |
| Database | MySQL |
| Animation (Optional) | GSAP |

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v16.x or higher)
- npm or Yarn
- [Python](https://www.python.org/) (v3.9 or higher)
- [pip](https://pip.pypa.io/en/stable/)
- [MySQL](https://www.mysql.com/) (v8.x or higher)

---

### Installation

**1. Clone the repository:**

```bash
git clone https://github.com/RaiUmerFarooq/electrashare.git
cd electrashare
```

---

**2. Backend Setup (Django):**

```bash
cd backend
```

Create and activate a virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

**3. Configure environment variables:**

Create a `.env` file in the root of your `backend` directory:

```env
SECRET_KEY=your_django_secret_key
DEBUG=True
DB_NAME=electrashare_db
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

**4. Set up the MySQL database:**

Log in to MySQL and create the database:

```sql
CREATE DATABASE electrashare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run Django migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

Create a superuser (optional, for admin access):

```bash
python manage.py createsuperuser
```

---

**5. Frontend Setup (Next.js):**

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

**6. Run the application:**

Open two terminal windows to run the frontend and backend concurrently.

_Terminal 1 — Backend:_

```bash
cd backend
source venv/bin/activate   # or venv\Scripts\activate on Windows
python manage.py runserver
```

_Terminal 2 — Frontend:_

```bash
cd frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| Django Admin | http://localhost:8000/admin |

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
