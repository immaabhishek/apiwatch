# APIWatch

APIWatch is a full-stack API monitoring application built with React, Node.js, Express, and MongoDB. It allows users to monitor REST APIs, track response times, view uptime statistics, and receive email notifications whenever an API becomes unavailable.

The project was built to understand backend development concepts such as authentication, scheduled background jobs, REST API design, and database integration while also creating a responsive frontend dashboard.

---

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Password hashing using bcryptjs
- Protected routes

### API Monitoring
- Create API monitors
- Support for GET, POST, PUT, and DELETE requests
- Manual API health checks
- Automatic monitoring using Cron Jobs (runs every minute)
- Custom expected HTTP status codes

### Dashboard
- View all monitored APIs
- Current API status (UP / DOWN)
- Total monitors
- Total health checks
- Average response time
- Overall uptime percentage

### Monitoring History
- Response time history
- Status code history
- Last checked timestamp
- Historical monitoring records

### Email Notifications
- Email alerts when an API changes from UP to DOWN
- Prevents duplicate notifications while an API remains unavailable

---

## Tech Stack

### Frontend
- React
- Vite
- CSS3

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JSON Web Token (JWT)
- bcryptjs

### Monitoring & Utilities
- Axios
- Node Cron
- Nodemailer
- dotenv
- CORS

---

## Folder Structure

```text
apiwatch/
│
├── backend/
│   ├── config/
│   ├── models/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/immaabhishek/APIWatch.git
cd apiwatch
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside the `backend` directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

EMAIL_USER=your_email@gmail.com

EMAIL_PASS=your_gmail_app_password
```

---

## Running the Project

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:5000
```

---

## API Endpoints

### Authentication

| Method | Endpoint |
|---------|----------|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| GET | `/api/auth/me` |

### Monitors

| Method | Endpoint |
|---------|----------|
| POST | `/api/monitors` |
| GET | `/api/monitors` |
| DELETE | `/api/monitors/:id` |
| POST | `/api/monitors/:id/check` |

### Analytics

| Method | Endpoint |
|---------|----------|
| GET | `/api/monitors/:id/history` |
| GET | `/api/monitors/:id/stats` |
| GET | `/api/dashboard/summary` |

---

## How It Works

1. A user creates an account and logs in.
2. The user adds an API endpoint to monitor.
3. APIWatch periodically checks the endpoint using Axios.
4. Each check stores the response time, HTTP status code, and current status.
5. If an API becomes unavailable, an email notification is sent.
6. Monitoring history and statistics are available through the dashboard.

---

## Future Improvements

Some features that can be added in future versions:

- Docker support
- Deployment using Render or Railway
- Charts for response time trends
- Slack and Discord notifications
- Custom monitoring intervals
- Team workspaces
- Role-based access control
- Dark mode

---

## Learning Outcomes

While building this project, I gained practical experience with:

- Building REST APIs using Express.js
- JWT authentication and route protection
- Password hashing with bcryptjs
- MongoDB schema design using Mongoose
- Scheduled background jobs using node-cron
- Email notifications using Nodemailer
- React state management and API integration
- Measuring API response times using Axios

---

## Author

**Abhishek Kumar**

If you have suggestions or feedback, feel free to open an issue or submit a pull request.