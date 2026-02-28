const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getCompanyAnalytics
} = require("../controllers/companyController");

const {
  getCompanyWallet,
  addFunds
} = require("../controllers/companyWalletController");

/* =========================
   ROLE GUARD (Reusable)
========================= */
const companyOnly = (req, res, next) => {
  if (req.user.role !== "company" && req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }
  next();
};

/* =========================
   ROUTES
========================= */

// 📊 Analytics
router.get(
  "/analytics",
  auth,
  companyOnly,
  getCompanyAnalytics
);

// 💰 Get Wallet
router.get(
  "/wallet",
  auth,
  companyOnly,
  getCompanyWallet
);

// ➕ Add Funds
router.post(
  "/wallet/add",
  auth,
  companyOnly,
  addFunds
);

module.exports = router;