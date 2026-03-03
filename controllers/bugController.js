const Bug = require("../models/Bug");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

/* =========================
   HACKER — SUBMIT BUG
========================= */
exports.submitBug = async (req, res) => {
  try {
    if (req.user.role !== "hacker") {
      return res.status(403).json({ msg: "Only hackers can submit bugs" });
    }

    const { 
      title,
      description,
      company,
      severity,
      testUrl,
      payload,
      steps,
      attachments
    } = req.body;

    // REQUIRED fields
    if (!title || !description || !company || !testUrl || !payload) {
      return res.status(400).json({
        msg: "All fields including testUrl and payload are required"
      });
    }

    // CREATE bug
    const bug = await Bug.create({
      title,
      description,
      company,
      severity: severity || "low",
      testUrl,
      payload,
      steps: steps || "",
      attachments: attachments || [],
      submittedBy: req.user.id,
      status: "submitted",
    });

    return res.json({ msg: "Bug submitted successfully", bug });

  } catch (err) {
    console.error("BUG SUBMISSION ERROR:", err);
    return res.status(500).json({ msg: err.message });
  }
};

/* =========================
   HACKER — VIEW OWN BUGS
========================= */
exports.getHackerBugs = async (req, res) => {
  try {
    if (req.user.role !== "hacker") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const bugs = await Bug.find({ submittedBy: req.user.id })
      .populate("company", "email name")
      .sort({ createdAt: -1 });

    return res.json({ bugs });

  } catch (err) {
    console.error("HACKER BUG FETCH ERROR:", err);
    return res.status(500).json({ msg: err.message });
  }
};

/* =========================
   HACKER — WALLET
========================= */
exports.getHackerWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("walletBalance");
    return res.json({ walletBalance: user.walletBalance });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

/* =========================
   COMPANY — VIEW ALL BUGS
========================= */
exports.getCompanyBugs = async (req, res) => {
  try {
    if (!["company", "admin"].includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const bugs = await Bug.find({ company: req.user.id })
      .populate("submittedBy", "email name")
      .sort({ createdAt: -1 });

    return res.json({ bugs });

  } catch (err) {
    console.error("COMPANY BUG FETCH ERROR:", err);
    return res.status(500).json({ msg: err.message });
  }
};

/* =========================
   COMPANY — VALIDATE BUG
========================= */
exports.validateBug = async (req, res) => {
  try {
    if (!["company", "admin"].includes(req.user.role)) {
      return res.status(403).json({ msg: "Only companies can validate bugs" });
    }

    const { status, severity, reward, duplicateOf } = req.body;
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({ msg: "Bug not found" });
    }

    if (bug.company.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not your bug" });
    }

    if (bug.status !== "submitted") {
      return res.status(400).json({ msg: "Bug already processed" });
    }

    /* ===== DUPLICATE ===== */
    if (status === "duplicate") {
      if (!duplicateOf) {
        return res.status(400).json({ msg: "Original bug ID required" });
      }

      const originalBug = await Bug.findById(duplicateOf);
      if (!originalBug) {
        return res.status(400).json({ msg: "Original bug not found" });
      }

      bug.status = "duplicate";
      bug.duplicateOf = duplicateOf;
      await bug.save();

      return res.json({ msg: "Bug marked as duplicate", bug });
    }

    /* ===== REJECT ===== */
    if (status === "rejected") {
      bug.status = "rejected";
      await bug.save();
      return res.json({ msg: "Bug rejected", bug });
    }

    /* ===== APPROVE ===== */
    if (status === "approved") {
      if (!["low", "medium", "high", "critical"].includes(severity)) {
        return res.status(400).json({ msg: "Invalid severity" });
      }

      if (!reward || Number(reward) <= 0) {
        return res.status(400).json({ msg: "Reward must be greater than 0" });
      }

      const company = await User.findById(req.user.id);
      const hacker = await User.findById(bug.submittedBy);

      if (company.walletBalance < reward) {
        return res.status(400).json({ msg: "Insufficient wallet balance" });
      }

      // WALLET TRANSFER
      company.walletBalance -= Number(reward);
      hacker.walletBalance += Number(reward);

      bug.status = "approved";
      bug.severity = severity;
      bug.reward = Number(reward);

      await company.save();
      await hacker.save();
      await bug.save();

      // TRANSACTION RECORD
      await Transaction.create({
        hacker: hacker._id,
        bug: bug._id,
        company: company._id,
        amount: Number(reward),
        status: "paid",
      });

      return res.json({ msg: "Bug approved & payment recorded", bug });
    }

    return res.status(400).json({ msg: "Invalid action" });

  } catch (err) {
    console.error("VALIDATION ERROR:", err);
    return res.status(500).json({ msg: err.message });
  }
};
