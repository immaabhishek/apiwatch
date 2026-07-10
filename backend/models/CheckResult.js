const mongoose = require("mongoose");

const checkResultSchema = new mongoose.Schema(
  {
    monitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Monitor",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["UP", "DOWN"],
      required: true,
    },

    responseTime: {
      type: Number,
      default: 0,
    },

    statusCode: {
      type: Number,
      default: 0,
    },

    error: {
      type: String,
      default: "",
    },

    checkedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CheckResult", checkResultSchema);