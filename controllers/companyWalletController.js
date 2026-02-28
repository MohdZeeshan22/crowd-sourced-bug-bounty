const User = require("../models/User");

/* =========================
   GET COMPANY WALLET
========================= */
const getCompanyWallet = async (req, res) => {
  try {
    const company = await User.findById(req.user.id);

    if (!company) {
      return res.status(404).json({ msg: "Company not found" });
    }

    res.json({
      walletBalance: company.walletBalance
    });

  } catch (err) {
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