<div align="center">

# APIWatch

A simple uptime monitoring tool built with React, Node.js and MongoDB.

I built APIWatch to understand how uptime monitoring services work behind the scenes. You can add an API endpoint, have it checked automatically every minute, and receive an email when it goes down.

![Node.js](https://img.shields.io/badge/Node.js-Express_5-3c873a?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Security](https://img.shields.io/badge/Security-SSRF%20Protection-d73a49?style=flat-square)

</div>

---

## About the Project

APIWatch started as a way for me to learn how services like UptimeRobot monitor APIs in the background.

The idea is straightforward: a user registers, adds an API endpoint, and APIWatch checks whether that endpoint is responding as expected. The results are stored in MongoDB and displayed on a dashboard.

While building it, I also worked on a few things beyond basic CRUD operations, including scheduled background jobs, authentication, email notifications, API response tracking and SSRF protection.

## Features

- **User authentication:** Register and log in using JWT authentication. Passwords are hashed with bcryptjs.
- **API monitoring:** Add endpoints with a name, URL, HTTP method and expected status code.
- **Automatic checks:** Active monitors are checked every 60 seconds using node-cron.
- **Manual checks:** Run a check immediately without waiting for the next scheduled run.
- **Dashboard:** View monitor counts, UP/DOWN status, total checks, uptime percentage and average response time.
- **Monitoring history:** View previous check results, response times and status codes for individual monitors.
- **Monitor statistics:** Track uptime percentage and average response time.
- **Email alerts:** Receive an email when a monitor changes from UP to DOWN.

## Security: SSRF Protection

One important part of building an uptime monitoring service is handling user-submitted URLs safely.

Since the backend makes HTTP requests to URLs provided by users, someone could try to use it to access internal services, private IP addresses or cloud metadata endpoints. This is known as Server-Side Request Forgery (SSRF).

I added URL validation and a safe request helper in [`backend/utils/ssrfProtection.js`](backend/utils/ssrfProtection.js) to reduce this risk.

The protection includes:

| Security check | Purpose |
|---|---|
| HTTP and HTTPS only | Prevents unsupported protocols such as `file://` and `ftp://` |
| URL credential validation | Rejects URLs containing embedded usernames or passwords |
| Hostname filtering | Blocks local and internal hostnames such as `localhost` and `.local` |
| DNS resolution and IP validation | Rejects hostnames that resolve to private or otherwise non-public IP addresses |
| IP pinning | Uses the validated IP for the actual request to help prevent DNS rebinding |
| Redirects disabled | Prevents a request from being redirected to an internal address |
| Method restrictions | Allows only GET and HEAD requests |
| Request limits | Applies a 10-second timeout and a 1 MB response size limit |

URLs are validated when a monitor is created and again before each scheduled or manual check.

## Tech Stack

| Part | Technologies |
|---|---|
| Frontend | React 19, Vite, CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| Scheduler | node-cron |
| Email notifications | Nodemailer, Gmail SMTP |
| HTTP requests | Axios |
| Security | ipaddr.js |

## Project Structure

```text
apiwatch/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Monitor.js
│   │   └── CheckResult.js
│   │
│   ├── utils/
│   │   └── ssrfProtection.js
│   │
│   ├── server.js
│   └── test-db.js
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
│
└── README.md
```

## Getting Started

To run APIWatch locally, you will need Node.js and a MongoDB Atlas connection.

### 1. Clone the repository

```bash
git clone https://github.com/immaabhishek/apiwatch.git
cd apiwatch
```

### 2. Set up the backend

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

For Gmail notifications, use a Gmail App Password rather than your regular account password.

Install dependencies and start the backend:

```bash
cd backend
npm install
npm run test-db
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

The database test is optional and can be used to check the MongoDB connection.

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

**Note:** APIWatch blocks localhost and private network addresses by design. Use a publicly accessible endpoint when testing a monitor.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/me` | Get the currently authenticated user |

### Monitors

All monitor endpoints require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/monitors` | Get the user's monitors |
| POST | `/api/monitors` | Create a monitor |
| POST | `/api/monitors/:id/check` | Run a manual check |
| DELETE | `/api/monitors/:id` | Delete a monitor |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Get dashboard statistics and recent checks |
| GET | `/api/monitors/:id/history` | Get the check history of a monitor |
| GET | `/api/monitors/:id/stats` | Get uptime and response time statistics |

There is also a public `GET /api/health` endpoint to check whether the backend server is running.

## Current Status

APIWatch is still being improved. These are some of the changes I want to work on next:

- [ ] Add rate limiting to authentication and monitor routes.
- [ ] Add latency charts to visualize response time trends.
- [ ] Improve scheduled checks by running monitors in parallel with controlled concurrency.
- [ ] Support configurable check intervals for individual monitors.
- [ ] Add a cleanup mechanism for old check history.

### Recently Completed

- [x] Added SSRF protection for monitor URLs and HTTP requests.
- [x] Added UP, DOWN and UNKNOWN status badges.
- [x] Improved the dashboard header and statistics cards.

## Known Limitations

There are still a few areas that need improvement:

- Scheduled checks currently run one after another. Slow endpoints can delay checks for other monitors.
- Check history is stored indefinitely. Data retention and cleanup are not implemented yet.
- Monitoring currently supports only GET and HEAD requests.
- All monitors use the same one-minute checking interval.

## Feedback

This project is something I'm continuing to learn and improve. Suggestions, bug reports and contributions are welcome.

**Built by [Abhishek Kumar](https://github.com/immaabhishek)**

[GitHub Repository](https://github.com/immaabhishek/apiwatch)