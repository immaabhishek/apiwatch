import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [page, setPage] = useState("home");

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [monitorData, setMonitorData] = useState({
    name: "",
    url: "",
    method: "GET",
    expectedStatus: 200,
  });

  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState(null);
  const [monitors, setMonitors] = useState([]);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Registration successful. Now login.");
        setPage("login");
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (error) {
      setMessage("Backend not connected");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setMessage("Login successful");
        setPage("dashboard");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (error) {
      setMessage("Backend not connected");
    }
  };

  const fetchDashboardSummary = async () => {
    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/api/dashboard/summary`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setSummary(data.summary);
      } else {
        setMessage(data.message || "Failed to load dashboard");
      }
    } catch (error) {
      setMessage("Backend not connected");
    }
  };

  const fetchMonitors = async () => {
    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/api/monitors`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setMonitors(data.monitors);
      } else {
        setMessage(data.message || "Failed to load monitors");
      }
    } catch (error) {
      setMessage("Backend not connected");
    }
  };

  const handleAddMonitor = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/api/monitors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(monitorData),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Monitor added successfully");

        setMonitorData({
          name: "",
          url: "",
          method: "GET",
          expectedStatus: 200,
        });

        fetchDashboardSummary();
        fetchMonitors();
      } else {
        setMessage(data.message || "Failed to add monitor");
      }
    } catch (error) {
      setMessage("Backend not connected");
    }
  };

  const handleCheckMonitor = async (monitorId) => {
    setMessage("");

    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/api/monitors/${monitorId}/check`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Monitor checked successfully");
        fetchDashboardSummary();
        fetchMonitors();
      } else {
        setMessage(data.message || "Failed to check monitor");
      }
    } catch (error) {
      setMessage("Backend not connected");
    }
  };

  const handleDeleteMonitor = async (monitorId) => {
    setMessage("");

    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/api/monitors/${monitorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Monitor deleted successfully");
        fetchDashboardSummary();
        fetchMonitors();
      } else {
        setMessage(data.message || "Failed to delete monitor");
      }
    } catch (error) {
      setMessage("Backend not connected");
    }
  };

  const refreshDashboard = () => {
    fetchDashboardSummary();
    fetchMonitors();
  };

  useEffect(() => {
    if (page === "dashboard") {
      refreshDashboard();
    }
  }, [page]);

  return (
    <div className="app">
      <nav className="navbar">
        <h2 onClick={() => setPage("home")}>APIWatch</h2>

       <div>
  {localStorage.getItem("token") ? (
    <>
      <button className="nav-btn" onClick={() => setPage("dashboard")}>
        Dashboard
      </button>

      <button
        className="nav-btn primary"
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setSummary(null);
          setMonitors([]);
          setMessage("");
          setPage("home");
        }}
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <button className="nav-btn" onClick={() => setPage("login")}>
        Login
      </button>

      <button
        className="nav-btn primary"
        onClick={() => setPage("register")}
      >
        Register
      </button>
    </>
  )}
</div>
      </nav>

      {message && <p className="message">{message}</p>}

      {page === "home" && (
        <>
          <section className="hero">
            <h1>Monitor Your APIs Easily</h1>
            <p>
              APIWatch helps developers track API uptime, response time,
              failures, and receive alerts when services go down.
            </p>

            <div className="hero-buttons">
              <button
                className="btn primary"
                onClick={() => setPage("register")}
              >
                Get Started
              </button>

              <button
                className="btn secondary"
                onClick={() => setPage("login")}
              >
                Login
              </button>
            </div>
          </section>

          <section className="cards">
            <div className="card">
              <h3>Uptime Monitoring</h3>
              <p>Automatically check APIs every minute.</p>
            </div>

            <div className="card">
              <h3>Response Time</h3>
              <p>Track how fast your APIs respond.</p>
            </div>

            <div className="card">
              <h3>Email Alerts</h3>
              <p>Get notified when your API goes down.</p>
            </div>
          </section>
        </>
      )}

      {page === "register" && (
        <div className="form-container">
          <h1>Create Account</h1>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Enter name"
              value={registerData.name}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  name: e.target.value,
                })
              }
            />

            <input
              type="email"
              placeholder="Enter email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  email: e.target.value,
                })
              }
            />

            <input
              type="password"
              placeholder="Enter password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  password: e.target.value,
                })
              }
            />

            <button className="btn primary" type="submit">
              Register
            </button>
          </form>

          <p>
            Already have an account?{" "}
            <span onClick={() => setPage("login")}>Login</span>
          </p>
        </div>
      )}

      {page === "login" && (
        <div className="form-container">
          <h1>Login</h1>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  email: e.target.value,
                })
              }
            />

            <input
              type="password"
              placeholder="Enter password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({
                  ...loginData,
                  password: e.target.value,
                })
              }
            />

            <button className="btn primary" type="submit">
              Login
            </button>
          </form>

          <p>
            New user?{" "}
            <span onClick={() => setPage("register")}>Register</span>
          </p>
        </div>
      )}

      {page === "dashboard" && (
        <div className="dashboard">
          <h1>Dashboard</h1>
          <p>You are logged in successfully.</p>

          {summary ? (
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Monitors</h3>
                <p>{summary.totalMonitors}</p>
              </div>

              <div className="stat-card">
                <h3>UP Monitors</h3>
                <p>{summary.upMonitors}</p>
              </div>

              <div className="stat-card">
                <h3>DOWN Monitors</h3>
                <p>{summary.downMonitors}</p>
              </div>

              <div className="stat-card">
                <h3>Total Checks</h3>
                <p>{summary.totalChecks}</p>
              </div>

              <div className="stat-card">
                <h3>Uptime</h3>
                <p>{summary.uptimePercentage}%</p>
              </div>

              <div className="stat-card">
                <h3>Avg Response</h3>
                <p>{summary.averageResponseTime} ms</p>
              </div>
            </div>
          ) : (
            <p>Loading dashboard...</p>
          )}

          <form className="monitor-form" onSubmit={handleAddMonitor}>
            <h2>Add New Monitor</h2>

            <input
              type="text"
              placeholder="Monitor name"
              value={monitorData.name}
              onChange={(e) =>
                setMonitorData({
                  ...monitorData,
                  name: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="API URL"
              value={monitorData.url}
              onChange={(e) =>
                setMonitorData({
                  ...monitorData,
                  url: e.target.value,
                })
              }
            />

            <select
              value={monitorData.method}
              onChange={(e) =>
                setMonitorData({
                  ...monitorData,
                  method: e.target.value,
                })
              }
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>

            <input
              type="number"
              placeholder="Expected status"
              value={monitorData.expectedStatus}
              onChange={(e) =>
                setMonitorData({
                  ...monitorData,
                  expectedStatus: Number(e.target.value),
                })
              }
            />

            <button className="btn primary" type="submit">
              Add Monitor
            </button>
          </form>

          <div className="monitor-list">
            <h2>Your Monitors</h2>

            {monitors.length === 0 ? (
              <p>No monitors added yet.</p>
            ) : (
              <div className="monitor-table">
                <div className="monitor-row monitor-heading">
                  <span>Name</span>
                  <span>Status</span>
                  <span>Status Code</span>
                  <span>Response</span>
                  <span>Actions</span>
                </div>

                {monitors.map((monitor) => (
                  <div className="monitor-row" key={monitor._id}>
                    <span>
                      <b>{monitor.name}</b>
                      <small>{monitor.url}</small>
                    </span>

                    <span
                      className={
                        monitor.status === "UP"
                          ? "status-up"
                          : monitor.status === "DOWN"
                          ? "status-down"
                          : "status-unknown"
                      }
                    >
                      {monitor.status}
                    </span>

                    <span>{monitor.lastStatusCode || 0}</span>

                    <span>{monitor.responseTime || 0} ms</span>

                    <span className="action-buttons">
                      <button
                        className="small-btn"
                        onClick={() => handleCheckMonitor(monitor._id)}
                      >
                        Check
                      </button>

                      <button
                        className="small-btn danger"
                        onClick={() => handleDeleteMonitor(monitor._id)}
                      >
                        Delete
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn primary" onClick={refreshDashboard}>
            Refresh Dashboard
          </button>

          <button
            className="btn secondary"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setSummary(null);
              setMonitors([]);
              setMessage("");
              setPage("home");
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;