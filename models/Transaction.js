const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  hacker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  bug: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bug",
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  amount: Number,
  status: {
    type: String,
    default: "paid",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);