const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const cors = require("cors");

const connectDB = require("./config/db");
const User = require("./models/User");
const Monitor = require("./models/Monitor");
const CheckResult = require("./models/CheckResult");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

// Home route
app.get("/", (req, res) => {
  res.send("APIWatch backend is running with MongoDB");
});

// Health route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "APIWatch health API is working",
    status: "UP",
  });
});

// Register API
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

// Login API
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// Get logged in user
app.get("/api/auth/me", protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    user: req.user,
  });
});

// Create monitor
app.post("/api/monitors", protect, async (req, res) => {
  try {
    const { name, url, method, expectedStatus } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: "Name and URL are required",
      });
    }

    const monitor = await Monitor.create({
      user: req.user._id,
      name,
      url,
      method: method || "GET",
      expectedStatus: expectedStatus || 200,
    });

    res.status(201).json({
      success: true,
      message: "Monitor created successfully",
      monitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create monitor",
      error: error.message,
    });
  }
});

// Get monitors
app.get("/api/monitors", protect, async (req, res) => {
  try {
    const monitors = await Monitor.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Monitors fetched successfully",
      count: monitors.length,
      monitors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch monitors",
      error: error.message,
    });
  }
});

// Delete monitor
app.delete("/api/monitors/:id", protect, async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    if (monitor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this monitor",
      });
    }

    await Monitor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Monitor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete monitor",
      error: error.message,
    });
  }
});

// Manual check monitor
app.post("/api/monitors/:id/check", protect, async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    if (monitor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to check this monitor",
      });
    }

    const previousStatus = monitor.status;

    const startTime = Date.now();

    const response = await axios({
      method: monitor.method,
      url: monitor.url,
      timeout: 10000,
      validateStatus: () => true,
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const isUp = response.status === monitor.expectedStatus;

    monitor.status = isUp ? "UP" : "DOWN";
    monitor.responseTime = responseTime;
    monitor.lastStatusCode = response.status;
    monitor.lastError = isUp
      ? ""
      : `Expected status ${monitor.expectedStatus}, got ${response.status}`;
    monitor.lastCheckedAt = new Date();

    await monitor.save();

    await CheckResult.create({
      monitor: monitor._id,
      user: req.user._id,
      status: monitor.status,
      responseTime,
      statusCode: response.status,
      error: monitor.lastError,
      checkedAt: new Date(),
    });

    if (monitor.status === "DOWN" && previousStatus !== "DOWN") {
      await sendDownAlertEmail(req.user.email, monitor, monitor.lastError);
    }

    res.status(200).json({
      success: true,
      message: "Monitor checked successfully",
      result: {
        name: monitor.name,
        url: monitor.url,
        status: monitor.status,
        statusCode: monitor.lastStatusCode,
        expectedStatus: monitor.expectedStatus,
        responseTime: monitor.responseTime,
        lastCheckedAt: monitor.lastCheckedAt,
      },
    });
  } catch (error) {
    const monitor = await Monitor.findById(req.params.id);

    if (monitor) {
      const previousStatus = monitor.status;

      monitor.status = "DOWN";
      monitor.responseTime = 0;
      monitor.lastStatusCode = 0;
      monitor.lastError = error.message;
      monitor.lastCheckedAt = new Date();

      await monitor.save();

      await CheckResult.create({
        monitor: monitor._id,
        user: req.user._id,
        status: "DOWN",
        responseTime: 0,
        statusCode: 0,
        error: error.message,
        checkedAt: new Date(),
      });

      if (previousStatus !== "DOWN") {
        await sendDownAlertEmail(req.user.email, monitor, error.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Monitor checked but API is DOWN",
      result: {
        status: "DOWN",
        error: error.message,
      },
    });
  }
});

// Monitor history
app.get("/api/monitors/:id/history", protect, async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    if (monitor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this history",
      });
    }

    const history = await CheckResult.find({
      monitor: req.params.id,
      user: req.user._id,
    }).sort({ checkedAt: -1 });

    res.status(200).json({
      success: true,
      message: "Monitor history fetched successfully",
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch monitor history",
      error: error.message,
    });
  }
});

// Monitor stats
app.get("/api/monitors/:id/stats", protect, async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    if (monitor.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this monitor stats",
      });
    }

    const history = await CheckResult.find({
      monitor: req.params.id,
      user: req.user._id,
    });

    const totalChecks = history.length;

    if (totalChecks === 0) {
      return res.status(200).json({
        success: true,
        message: "No checks found yet",
        stats: {
          totalChecks: 0,
          upChecks: 0,
          downChecks: 0,
          uptimePercentage: 0,
          averageResponseTime: 0,
        },
      });
    }

    const upChecks = history.filter((item) => item.status === "UP").length;
    const downChecks = history.filter((item) => item.status === "DOWN").length;

    const uptimePercentage = ((upChecks / totalChecks) * 100).toFixed(2);

    const totalResponseTime = history.reduce((sum, item) => {
      return sum + item.responseTime;
    }, 0);

    const averageResponseTime = (totalResponseTime / totalChecks).toFixed(2);

    res.status(200).json({
      success: true,
      message: "Monitor stats fetched successfully",
      stats: {
        monitorName: monitor.name,
        monitorUrl: monitor.url,
        currentStatus: monitor.status,
        totalChecks,
        upChecks,
        downChecks,
        uptimePercentage: Number(uptimePercentage),
        averageResponseTime: Number(averageResponseTime),
        lastCheckedAt: monitor.lastCheckedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch monitor stats",
      error: error.message,
    });
  }
});

// Dashboard summary
app.get("/api/dashboard/summary", protect, async (req, res) => {
  try {
    const monitors = await Monitor.find({ user: req.user._id });

    const totalMonitors = monitors.length;

    const upMonitors = monitors.filter(
      (monitor) => monitor.status === "UP"
    ).length;

    const downMonitors = monitors.filter(
      (monitor) => monitor.status === "DOWN"
    ).length;

    const unknownMonitors = monitors.filter(
      (monitor) => monitor.status === "UNKNOWN"
    ).length;

    const history = await CheckResult.find({ user: req.user._id });

    const totalChecks = history.length;

    let uptimePercentage = 0;
    let averageResponseTime = 0;

    if (totalChecks > 0) {
      const upChecks = history.filter((item) => item.status === "UP").length;

      uptimePercentage = ((upChecks / totalChecks) * 100).toFixed(2);

      const totalResponseTime = history.reduce((sum, item) => {
        return sum + item.responseTime;
      }, 0);

      averageResponseTime = (totalResponseTime / totalChecks).toFixed(2);
    }

    const recentChecks = await CheckResult.find({ user: req.user._id })
      .populate("monitor", "name url")
      .sort({ checkedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      summary: {
        totalMonitors,
        upMonitors,
        downMonitors,
        unknownMonitors,
        totalChecks,
        uptimePercentage: Number(uptimePercentage),
        averageResponseTime: Number(averageResponseTime),
        recentChecks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
      error: error.message,
    });
  }
});

// Email alert function
const sendDownAlertEmail = async (userEmail, monitor, errorMessage) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("Email credentials missing. Alert not sent.");
      return;
    }

    if (!userEmail) {
      console.log("User email missing. Alert not sent.");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `APIWatch Alert: ${monitor.name} is DOWN`,
      html: `
        <h2>APIWatch Alert</h2>
        <p>Your API monitor is currently <b style="color:red;">DOWN</b>.</p>
        <p><b>Name:</b> ${monitor.name}</p>
        <p><b>URL:</b> ${monitor.url}</p>
        <p><b>Error:</b> ${errorMessage || "Unexpected error"}</p>
        <p><b>Checked At:</b> ${new Date().toLocaleString()}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Alert email sent to ${userEmail}`);
  } catch (error) {
    console.log("Failed to send alert email:", error.message);
  }
};

// Auto check single monitor
const checkSingleMonitor = async (monitor) => {
  try {
    const previousStatus = monitor.status;

    const startTime = Date.now();

    const response = await axios({
      method: monitor.method,
      url: monitor.url,
      timeout: 10000,
      validateStatus: () => true,
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    const isUp = response.status === monitor.expectedStatus;

    monitor.status = isUp ? "UP" : "DOWN";
    monitor.responseTime = responseTime;
    monitor.lastStatusCode = response.status;
    monitor.lastError = isUp
      ? ""
      : `Expected status ${monitor.expectedStatus}, got ${response.status}`;
    monitor.lastCheckedAt = new Date();

    await monitor.save();

    await CheckResult.create({
      monitor: monitor._id,
      user: monitor.user._id || monitor.user,
      status: monitor.status,
      responseTime,
      statusCode: response.status,
      error: monitor.lastError,
      checkedAt: new Date(),
    });

    if (monitor.status === "DOWN" && previousStatus !== "DOWN") {
      await sendDownAlertEmail(monitor.user.email, monitor, monitor.lastError);
    }

    console.log(`${monitor.name} checked: ${monitor.status}`);
  } catch (error) {
    const previousStatus = monitor.status;

    monitor.status = "DOWN";
    monitor.responseTime = 0;
    monitor.lastStatusCode = 0;
    monitor.lastError = error.message;
    monitor.lastCheckedAt = new Date();

    await monitor.save();

    await CheckResult.create({
      monitor: monitor._id,
      user: monitor.user._id || monitor.user,
      status: "DOWN",
      responseTime: 0,
      statusCode: 0,
      error: error.message,
      checkedAt: new Date(),
    });

    if (previousStatus !== "DOWN") {
      await sendDownAlertEmail(monitor.user.email, monitor, error.message);
    }

    console.log(`${monitor.name} checked: DOWN`);
  }
};

// Cron job - runs every minute
cron.schedule("* * * * *", async () => {
  try {
    console.log("Auto monitor check started...");

    const monitors = await Monitor.find({ isActive: true }).populate(
      "user",
      "email"
    );

    for (const monitor of monitors) {
      await checkSingleMonitor(monitor);
    }

    console.log("Auto monitor check completed.");
  } catch (error) {
    console.log("Auto monitor check failed:", error.message);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});