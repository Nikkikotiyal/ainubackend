const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:4200", // Adjust if needed
    // origin: "https://dms.ainuindia.com",
    methods: "GET, POST", // Make sure POST is allowed
    allowedHeaders: "Content-Type, Authorization",
    credentials: true,
  })
);

console.log("Starting....");

// const productionUrl =
//   "mongodb://admin:AANP1985@69.62.80.20:27017/dbAINU?authSource=admin";
const localUrl = "mongodb://127.0.0.1:27017/NewDb";

mongoose
  .connect(localUrl, {
    // changes
    useNewUrlParser: true,
    useUnifiedTopology: true,
     serverSelectionTimeoutMS: 30000
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection error:", err));

app.use("/api", authRoutes); // 👈 mount the login routr

// Start server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
// const authRoutes = require('./routes/authRoutes');

// app.use('/api', authRoutes);
