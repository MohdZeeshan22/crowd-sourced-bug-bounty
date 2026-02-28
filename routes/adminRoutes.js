const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware.js");
const { adminOverview } = require("../controllers/adminController.js");

// Only admin can access
router.get("/overview", auth, adminOverview);

module.exports = router;
