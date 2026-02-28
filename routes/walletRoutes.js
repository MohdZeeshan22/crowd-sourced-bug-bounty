const router = require("express").Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      hacker: req.user.id,
    })
      .populate("bug", "title")
      .populate("company", "email role")   // 👈 IMPORTANT
      .sort({ createdAt: -1 });

    const total = transactions.reduce(
      (acc, t) => acc + (t.amount || 0),
      0
    );

    res.json({ total, transactions });
  } catch (err) {
    console.error("Wallet error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;