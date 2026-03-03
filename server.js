const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =========================
   ✅ CORS CONFIG
========================= */
app.use(cors());

/* =========================
   ✅ BODY PARSER
========================= */
app.use(express.json());

/* =========================
   ✅ HEALTH CHECK ROUTE (IMPORTANT FOR RAILWAY)
========================= */
app.get("/", (req, res) => {
  res.status(200).send("Backend is running 🚀");
});

/* =========================
   ✅ ROUTES
========================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bugs", require("./routes/bugRoutes"));
app.use("/api/wallet", require("./routes/walletRoutes"));
app.use("/api/company", require("./routes/companyRoutes"));

/* =========================
   ✅ DB CONNECTION
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("Mongo Error:", err));

/* =========================
   ✅ SERVER (RAILWAY SAFE)
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});