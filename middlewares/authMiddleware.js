// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const { ObjectId } = require("mongoose").Types;

// module.exports.authenticateToken = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = authHeader?.split(" ")[1];

//     console.log("🛡️ Received Token:", token);

//     if (!token) {
//       return res.status(401).json({ error: "Unauthorized: No token provided" });
//     }

//     jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
//       if (err) {
//         console.error("❌ Token verification failed:", err);
//         return res.status(403).json({ error: "Forbidden: Invalid token" });
//       }

//       console.log("🔑 Decoded Token:", decoded);
//       req.userId = decoded.userId; // ✅ Extracted User ID

//       // 🔎 Directly Fetch User Inside Middleware (No fetchUser Required!)
//       const user = await User.findById(new ObjectId(req.userId));
//       if (!user) {
//         console.error("❌ User Not Found!");
//         return res.status(404).json({ error: "User not found" });
//       }

//       if (user.isDeleted) {
//         console.error("🔒 Access Denied: Account deactivated");
//         return res.status(403).json({ error: "Access Denied: Account deactivated" });
//       }

//       req.user = user;
//       next();
//     });
//   } catch (error) {
//     console.error("❌ Authentication Middleware Error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ObjectId } = require("mongoose").Types;

module.exports.authenticateToken = async (req, res, next) => {
  try {
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

      req.userId = decoded.userId; // ✅ Extracted user ID

      // 🔎 Fetch User Inside Middleware
      const objectId = new ObjectId(String(req.userId)); // ✅ Convert ID properly
      const user = await User.findById(objectId);
      if (!user) {
        console.error("❌ User Not Found!");
        return res.status(404).json({ error: "User not found" });
      }

      if (user.isDeleted) {
        console.error("🔒 Access Denied: Account deactivated");
        return res.status(403).json({ error: "Access Denied: Account deactivated" });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("❌ Authentication Middleware Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
