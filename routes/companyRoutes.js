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

// 🔥 CORRECT IMPORT (your actual file)
const {
  runSandboxValidation
} = require("../controllers/sandboxController");

/* =========================
   ROLE GUARD
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

// 💰 Wallet
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

// 🤖 HTTP Sandbox Validation
router.post(
  "/sandbox/:bugId",
  auth,
  companyOnly,
  runSandboxValidation
);

module.exports = router;