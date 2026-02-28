const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  submitBug,
  getHackerBugs,
  getHackerWallet,
  getCompanyBugs,
  validateBug,
} = require("../controllers/bugController");

/* HACKER */
router.post("/submit", auth, submitBug);
router.get("/hacker/bugs", auth, getHackerBugs);
router.get("/hacker/wallet", auth, getHackerWallet);

/* COMPANY */
router.get("/company/bugs", auth, getCompanyBugs);
router.patch("/validate/:id", auth, validateBug);

module.exports = router;
