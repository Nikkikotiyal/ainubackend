const RequestLog = require("../models/logmodel");

const requestLogger = async (req, res, next) => {
  console.log("📌 Middleware triggered for:", req.method, req.originalUrl);
//   const userEmail = req.headers["user-email"] || "Unknown";
    // const userEmail = req.headers["user-email"] || req.user?.email || req.body?.email || "Unknown";
  try {
    const now = new Date();

    const formattedTimestamp = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata", // ✅ ensures IST
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const logEntry = new RequestLog({
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      query: req.query,
      formattedTimestamp, // ✅ Add formatted field
      timestamp: now,
    //   email: req.userEmail
    //   email: req.userEmail,
    });

    await logEntry.save();
    // console.log("✅ Log stored with user:", userEmail);
    console.log("✅ Log saved successfully in MongoDB");
  } catch (error) {
    console.error("❌ Error saving log:", error);
  }

  next();
};

module.exports = requestLogger;
