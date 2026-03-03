const User = require("../models/User");
const Transaction = require("../models/Transaction");

/* =========================
   GET COMPANY WALLET
========================= */
const getCompanyWallet = async (req, res) => {
  try {
    const company = await User.findById(req.user.id);

    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    // 🔥 Fetch transactions from Transaction collection
    const transactions = await Transaction.find({
      company: req.user.id
    })
      .populate("bug", "title")
      .populate("hacker", "name email")
      .sort({ createdAt: -1 });

    // 🔥 Calculate total paid
    const totalPaid = transactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    res.json({
      walletBalance: company.walletBalance,
      totalPaid,
      transactions
    });

  } catch (err) {
    console.error("Wallet fetch error:", err);
    res.status(500).json({ msg: err.message });
  }
};

/* =========================
   ADD FUNDS
========================= */
const addFunds = async (req, res) => {
  try {
    let { amount } = req.body;
    amount = Number(amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    const company = await User.findById(req.user.id);

    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    company.walletBalance += amount;
    await company.save();

    res.json({
      msg: "Funds added successfully",
      walletBalance: company.walletBalance
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  getCompanyWallet,
  addFunds
};