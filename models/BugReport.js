const mongoose = require("mongoose");

const bugReportSchema = new mongoose.Schema({
  title: String,
  description: String,
  severity: { type: String, default: "pending" },
  status: { type: String, default: "submitted" },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reward: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
  
});

module.exports = mongoose.model("BugReport", bugReportSchema);
