const mongoose = require("mongoose");

const bugSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

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
    },

    // ✅ NEW
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bug",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bug", bugSchema);
