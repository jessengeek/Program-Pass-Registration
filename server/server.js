require("dotenv").config();
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const registerRoute = require("./routes/register");
const adminRoute = require("./routes/admin");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
// Photos are sent as base64 JSON, so the default 100kb body limit isn't enough.
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/register", registerRoute);
app.use("/api/admin", adminRoute);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
