const express = require("express");
const router = express.Router();

const {
  login,
  registerUser,     // 👈 add this
  getCompanies,
} = require("../controllers/authController");

// 🆕 REGISTER
router.post("/register", registerUser);

// 🔐 LOGIN
router.post("/login", login);

// 🏢 Get all companies (for bug submission dropdown)
router.get("/companies", getCompanies);

module.exports = router;