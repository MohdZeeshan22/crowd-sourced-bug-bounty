const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* Health check route */
app.get("/", (req, res) => {
  res.status(200).send("Backend is running 🚀");
});

/* Routes */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/bugs", require("./routes/bugRoutes"));
app.use("/api/wallet", require("./routes/walletRoutes"));
app.use("/api/company", require("./routes/companyRoutes"));

/* Start server only after DB connects */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo Error:", err);
  });