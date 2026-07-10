const mongoose = require("mongoose");

const monitorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "DELETE"],
      default: "GET",
    },

    expectedStatus: {
      type: Number,
      default: 200,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["UP", "DOWN", "UNKNOWN"],
      default: "UNKNOWN",
    },

    responseTime: {
      type: Number,
      default: 0,
    },

    lastStatusCode: {
      type: Number,
      default: 0,
    },

    lastError: {
      type: String,
      default: "",
    },

    lastCheckedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Monitor", monitorSchema);