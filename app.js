const express = require("express");
const mongoose = require("./server"); // Import MongoDB connection
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const requestLogger = require("./middleware/logger"); // Import logging middleware

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:4200", // Adjust if needed
    // origin: "https://dms.ainuindia.com",
    methods: "GET, POST,PUT",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);

console.log("Starting server...");

// 🔹 Apply request logging middleware
app.use(requestLogger);

app.use("/api", authRoutes); // 👈 Mount the login routes
// Read SSL certificate and key

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
};

// Start server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

//live server
// const PORT = 3443;
// https.createServer(sslOptions, app).listen(PORT, () => {
//   console.log(`✅ Secure API is running at https://localhost:${PORT}`);
// });