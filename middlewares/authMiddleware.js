const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Ensure User model is imported

module.exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  console.log("🛡️ Received Token:", token);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  jwt.verify(token, "your_secret_key", async (err, decoded) => {
    if (err) {
      console.error("❌ Token verification failed:", err);
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }

    // Fetch user from database using decoded user ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔴 **Prevent access if user is soft deleted**
    if (user.isDeleted) {
      return res.status(403).json({ error: "Access Denied: Account deactivated" });
    }

    req.user = user;
    next();
  });
};
