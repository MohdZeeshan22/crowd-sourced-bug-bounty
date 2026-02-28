const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* =========================
   REGISTER
========================= */
exports.registerUser = async (req, res) => {
  try {
    console.log("👉 REGISTER BODY:", req.body);

    const { name, email, password, role } = req.body;

    // Validate fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: "All fields required" });
    }

    if (!["hacker", "company", "admin"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      walletBalance: role === "company" ? 1000000 : 0,
    });

    console.log("✅ USER CREATED:", user.email);

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ token, user });

  } catch (err) {
    console.error("🔥 REGISTER ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

/* =========================
   LOGIN
========================= */
exports.login = async (req, res) => {
  try {
    console.log("👉 LOGIN BODY:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });

  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

/* =========================
   GET COMPANIES
========================= */
exports.getCompanies = async (req, res) => {
  try {
    const companies = await User.find({
      role: { $in: ["company", "admin"] }
    }).select("name email");

    res.json({ companies });
  } catch (err) {
    console.error("🔥 GET COMPANIES ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};