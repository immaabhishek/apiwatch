# 📡 APIWatch — Full-Stack API Monitoring Platform

APIWatch is a lightweight, real-time API uptime & performance monitoring tool. I built this project to monitor REST endpoints, track response latencies, receive automated email alerts when services go down, and visualize metrics on a clean dashboard.

---

## 💡 Why I Built This

I wanted to understand how tools like UptimeRobot or Pingdom work under the hood. Specifically, I wanted hands-on experience with:
- **Background Cron Jobs**: Scheduling automated health checks in Node.js without blocking the main event loop.
- **Database Integration**: Storing time-series health check results in MongoDB and connecting a production Node.js backend to **MongoDB Atlas**.
- **Real-time Alerting**: Triggering automated email notifications via SMTP (Nodemailer) when a service state changes from `UP` to `DOWN`.
- **JWT Authentication**: Protecting monitoring routes and user dashboards.

---

## ✨ Key Features

- **🛡️ JWT Authentication & Security**: Register, login, and secure API routes with hashed passwords (`bcryptjs`).
- **⏱️ Automated Health Checks**: Background worker powered by `node-cron` pings registered APIs every minute.
- **📊 Real-Time Analytics**: Monitor response time (ms), status codes (200, 404, 500, etc.), overall uptime percentage, and total health checks.
- **📧 Email Alerts**: Immediate email notifications sent via Nodemailer if an API goes down.
- **☁️ Cloud & Production Ready**: Seamlessly connects to MongoDB Atlas and deploys easily on Render or Railway.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Modern CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas, Mongoose
- **Scheduler**: Node-Cron
- **Alerting**: Nodemailer (Gmail SMTP)
- **Auth**: JSON Web Tokens (JWT), bcryptjs

---

## 📁 Project Structure

```text
apiwatch/
├── backend/
│   ├── config/
│   │   └── db.js            # MongoDB Mongoose connection handler
│   ├── models/
│   │   ├── User.js          # User schema
│   │   ├── Monitor.js       # Target API schema
│   │   └── CheckResult.js   # Historical logs schema
│   ├── server.js            # Express server, routes & cron job
│   ├── test-db.js           # CLI database connection tester
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React App & dashboard views
│   │   ├── App.css          # Modern dark-themed design system
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Clone the repository
```bash
git clone https://github.com/immaabhishek/apiwatch.git
cd apiwatch
```

### 2. Configure Backend Environment
Navigate to `backend` and create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/apiwatch?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **Tip:** You can test your MongoDB connection string at any time by running `npm run test-db` inside the `backend` folder!

### 3. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
*Backend runs on `http://localhost:5000`*

### 4. Start Frontend Client
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔌 API Endpoints

### 🔐 Auth Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT |
| `GET` | `/api/auth/me` | Fetch logged-in user info |

### 🎯 Monitor Routes *(Protected)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/monitors` | List all user monitors |
| `POST` | `/api/monitors` | Create a new API monitor |
| `POST` | `/api/monitors/:id/check` | Trigger an immediate manual health check |
| `DELETE` | `/api/monitors/:id` | Remove a monitor |

### 📈 Analytics Routes *(Protected)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/summary` | Get aggregated uptime %, avg response time, & monitor stats |
| `GET` | `/api/monitors/:id/history` | Get full ping history for a specific monitor |
| `GET` | `/api/monitors/:id/stats` | Get detailed stats for a specific monitor |

---

## 🤝 Contributing & Feedback

Suggestions, bug reports, and pull requests are always welcome! Feel free to open an issue or submit a PR.

**Author:** [Abhishek Kumar](https://github.com/immaabhishek)