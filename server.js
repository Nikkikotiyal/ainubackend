const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
// const requestLogger = require("./middlewares/logger");
const fs = require("fs"); // ✅ Add this
const path = require("path"); // ✅ Add this
const https = require("https"); // ✅ For HTTPS server
const app = express();
const uploadRoute = require("./routes/uploadRoute");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(cors());
const RequestLog = require("./models/logmodel");
const apiBase = "/api";
app.use(
  cors({
    origin: "http://localhost:4200", // Adjust if needed
    // origin: "https://dms.ainuindia.com",
    methods: "GET, POST ,PUT ", // Make sure POST is allowed
    allowedHeaders: ["Content-Type", "Authorization", "user-email"], // include any custom headers you use
    credentials: true,
  })
);

app.use(express.json());
console.log("Starting....");
app.use("/api", uploadRoute);

const productionUrl =
  "mongodb://ainuindia_user:Aanp20252030@69.62.80.20:27017/ainuindia_dms?authSource=admin";
const localUrl = "mongodb://127.0.0.1:27017/NewDb";

mongoose
  .connect(localUrl, {
    // changes
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection error:", err));

// ✅ Apply request logging middleware
app.use(async (req, res, next) => {
  try {
    const userEmail = req.headers["user-email"] || "Unknown User"; // ✅ Ensure email is captured

    const logEntry = new RequestLog({
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      query: req.query,
      userId: userEmail, // ✅ Track user identity for all API calls
      purpose: `API Request to ${req.originalUrl}`,
      remarks: `Request made to ${req.originalUrl} by ${userEmail}`,
    });

    await logEntry.save();
    console.log(
      `📌 API Call Logged: ${req.method} ${req.originalUrl} by ${userEmail}`
    );
  } catch (error) {
    console.error("❌ Error logging request:", error);
  }

  next(); // ✅ Ensure request proceeds further
});

app.use("/api", authRoutes); // 👈 mount the login routr
app.get(`${apiBase}/logs`, async (req, res) => {
  try {
    const logs = await RequestLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error fetching logs" });
  }
});

app.post(`${apiBase}/logs`, async (req, res) => {
  try {
    const newLog = new RequestLog(req.body);
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    res.status(400).json({ error: "Error saving log" });
  }
});

app.put(`${apiBase}/logs/:id`, async (req, res) => {
  try {
    const updatedLog = await RequestLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedLog);
  } catch (error) {
    res.status(400).json({ error: "Error updating log" });
  }
});

app.delete(`${apiBase}/logs/:id`, async (req, res) => {
  try {
    await RequestLog.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Error deleting log" });
  }
});

// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
//   cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
// };

// //live server
// https.createServer(sslOptions, app).listen(3000, () => {
//   console.log("✅ HTTPS Live Server running on port 3 000");
// });

// Start server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));

// 🔹 Fetch All Logs
// 📌 Routes with `/api` prefix
