# APIWatch

APIWatch is a full-stack API monitoring platform that helps developers monitor API uptime, response time, failures, and receive alerts when services go down.

## Features

- User registration and login
- JWT-based authentication
- Add API monitors
- View all monitors
- Delete monitors
- Manual API health check
- Automatic API checking every minute
- API status tracking: UP, DOWN, UNKNOWN
- Response time tracking
- Check history storage
- Dashboard summary
- Email alert when API goes DOWN
- React frontend dashboard

## Tech Stack

### Frontend

- React
- Vite
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Axios
- Node-cron
- Nodemailer
- CORS

## Project Structure

```txt
apiwatch/
├── backend/
│   ├── config/
│   ├── models/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    ├── package.json
    └── index.html
```

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

## Environment Variables

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/apiwatch
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## API Endpoints

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Monitors

```txt
POST   /api/monitors
GET    /api/monitors
DELETE /api/monitors/:id
POST   /api/monitors/:id/check
GET    /api/monitors/:id/history
GET    /api/monitors/:id/stats
```

### Dashboard

```txt
GET /api/dashboard/summary
```

## Resume Description

Built APIWatch, a full-stack API monitoring platform using React, Node.js, Express.js, MongoDB, JWT, Axios, Node-cron, and Nodemailer. The platform allows users to monitor API uptime, response time, failures, and receive automated email alerts when services go down.

## Resume Bullet

- Developed APIWatch, a full-stack API monitoring SaaS platform with JWT authentication, API health checks, auto-monitoring using node-cron, email alerts using Nodemailer, and a React dashboard for uptime and response-time analytics.