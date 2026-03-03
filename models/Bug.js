const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // 🔥 Required for Sandbox
    testUrl: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: "Invalid URL format",
      },
    },

    payload: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["submitted", "approved", "rejected", "duplicate"],
      default: "submitted",
    },

    reward: {
      type: Number,
      default: 0,
      min: 0,
    },

    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bug",
      default: null,
    },

    // 🔥 Structured Sandbox Results
    sandboxResults: [
      {
        severity: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
        },
        riskScore: {
          type: Number,
          min: 0,
          max: 100,
        },
        detected: String,
        findings: [String],
        recommendation: String,
        timestamp: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bug", bugSchema);