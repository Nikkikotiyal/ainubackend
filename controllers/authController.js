const User = require("../models/User");
const bcrypt = require("bcryptjs");
const UserModule = require("../models/userModule");
const Module = require("../models/Module");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const app = express();

exports.loginUser = async (req, res) => {
  const { emailOrUsername, password } = req.body;
  console.log("Request body:", req.body);

  try {
    const user = await User.findOne({
      $or: [{ Email: emailOrUsername }, { UserName: emailOrUsername }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isDeleted) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const token = jwt.sign({ userId: user._id }, "your_secret_key", {
      expiresIn: "24h",
    });
    console.log("Generated Token:", token);
    return res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    });

    console.log(users);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.getUsersByLocation = async (req, res) => {
  try {
    const location = req.params.location;
    const users = await User.find({ Location: location });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.signupUser = async (req, res) => {
  try {
    const {
      username,
      password,
      designation,
      email,
      role,
      mobileNo,
      status,
      location,
    } = req.body;

    // ✅ Validate all required fields
    if (
      !username ||
      !designation ||
      !email ||
      !password ||
      !role ||
      !status ||
      !mobileNo ||
      !location
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check for existing email in lowercase format
    const existingUser = await User.findOne({ Email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "❌ Email already in use!" });
    }

    let newUser;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      newUser = new User({
        UserName: username,
        Password: hashedPassword,
        Designation: designation,
        Email: email.toLowerCase(),
        Role: role || "User",
        MobileNo: mobileNo,
        Status: status || "A",
        Location: location,
      });
    } else {
      newUser = new User({
        UserName: username,
        Designation: designation,
        Email: email.toLowerCase(),
        Role: role || "User",
        MobileNo: mobileNo,
        Status: status || "A",
        Location: location,
      });
    }

    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, "your_secret_key", {
      expiresIn: "24h",
    });
    res.status(201).json({
      message: "✅ User created successfully!",
      user: newUser,
    });
  } catch (error) {
    console.error("❌ Error creating user:", error);

    // ✅ Handle Duplicate Key Error (E11000) Properly
    if (error.code === 11000) {
      return res.status(400).json({ message: "❌ Email already registered!" });
    }

    res.status(500).json({ message: "❌ Server Error" });
  }
};

exports.getModule = async (req, res) => {
  try {
    console.log("API hit /getModule"); // debug
    const module = await Module.find({});
    console.log(module); // see what’s returned
    res.status(200).json(module);
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ error: "Failed to fetch modules" });
  }
};

// controllers/moduleController.js or routes/moduleRoutes.js

// exports.saveModule = async (req, res) => {
//   try {
//     const userModules = req.body;

//     if (!Array.isArray(userModules) || userModules.length === 0) {
//       return res.status(400).json({ message: 'No modules received' });
//     }

//     console.log('Received modules:', userModules);

//     await UserModule.insertMany(userModules);

//     res.status(200).json({ message: 'Modules saved successfully' });
//   } catch (error) {
//     console.error('Error saving modules:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.saveModule = async (req, res) => {
//   try {
//     const userId = new mongoose.Types.ObjectId(req.body.userId); // Ensure ObjectId
//     const modules = req.body.modules;

//     if (!userId || !Array.isArray(modules) || modules.length === 0) {
//       return res.status(400).json({ message: "Invalid input: Missing userId or modules." });
//     }

//     // 🔥 Step 1: Delete old modules before saving new selection
//     await UserModule.deleteMany({ userId });

//     // 🔥 Step 2: Insert new selected modules
//     const newModules = await UserModule.insertMany(
//       modules.map(mod => ({
//         userId,
//         Moduleid: mod.Moduleid, // ✅ Ensure `Moduleid` is stored as defined in schema
//         MODLE_NAME: mod.MODLE_NAME,
//         REPORT_NAME: mod.REPORT_NAME,
//       }))
//     );

//     // 🔥 Step 3: Retrieve saved modules & ensure `Moduleid` is returned correctly
//     const savedModules = await UserModule.find({ userId }).select("Moduleid MODLE_NAME REPORT_NAME userId");

//     res.status(200).json({ message: "Modules updated successfully!", savedModules });

//   } catch (error) {
//     console.error("Error saving modules:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

exports.saveModule = async (req, res) => {
  try {
    const userId = req.body.userId;
    const modules = req.body.modules;

    if (!Array.isArray(modules) || modules.length === 0) {
      return res.status(400).json({ message: "No modules received" });
    }

    // ✅ Step 1: Ensure Delete Works
    const deleteResult = await UserModule.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });
    console.log("Deleted Count:", deleteResult.deletedCount);

    if (deleteResult.deletedCount === 0) {
      console.warn("No records were deleted—check userId format.");
    }

    // ✅ Step 2: Remove `_id` Before Inserting New Modules
    const userModules = modules.map(({ _id, ...mod }) => ({
      ...mod,
      userId: new mongoose.Types.ObjectId(userId),
    }));

    // ✅ Step 3: Insert New Modules AFTER Delete
    await UserModule.insertMany(userModules);

    res.status(200).json({ message: "Modules saved successfully" });
  } catch (error) {
    console.error("❌ Error saving modules:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// exports.getUserModulesByUserId = async (req, res) => {
//   const userId = req.params.userId;

//   try {
//     // Ensure the userId is valid
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid user ID" });
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const modules = await UserModule.find({ userId: userId });

//     if (!modules || modules.length === 0) {
//       return res.status(404).json({ message: 'No modules found for this user' });
//     }

//     console.log("backend module", module);

//     res.status(200).json({ modules: modules }); // Assuming "modules" is saved in DB
//   } catch (err) {
//     console.error("Error fetching user modules:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };
exports.getUserModulesByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Ensure the userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const modules = await UserModule.find({ userId: userId });

    // ✅ Don't return 404 here — always return 200 with empty array if needed
    console.log("backend modules", modules);
    res.status(200).json({ modules: modules || [] });
  } catch (err) {
    console.error("Error fetching user modules:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedData = req.body;

    console.log("🛡️ Incoming Role Before Update:", updatedData.Role); // ✅ Debugging log

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updatedData },
      { new: true }
    );

    console.log("✅ Updated Role in Database:", user?.Role); // ✅ Debugging log

    if (!user) return res.status(404).send("❌ User not found!");

    res.json(user);
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).send(error.message);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.userId?.trim(); // ✅ Clean the incoming ID

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "❌ Invalid User ID format!" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "❌ User not found!" });
    }

    res.status(200).json({ success: true, data: user }); // ✅ Return structured JSON
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res
      .status(500)
      .json({ error: "❌ Failed to fetch user", details: err.message });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    console.log(" req.user", req.user);
    let _id = req.user.userId;

    console.log("📩 Incoming request body:", req.body); // ✅ Debugging: Log incoming data

    // ✅ Validate input
    if (
      !currentPassword?.trim() ||
      !newPassword?.trim() ||
      !confirmPassword?.trim()
    ) {
      return res.status(400).json({ message: "❌ All fields are required!" });
    }

    // ✅ Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "❌ New password and confirm password do not match!",
      });
    }

    // ✅ Find user by email (Case-insensitive)
    const user = await User.findOne({
      _id,
    }).select("+Password"); // ✅ Explicitly fetch Password field
    if (!user) {
      return res.status(404).json({ message: "❌ User not found!" });
    }

    if (!user.Password) {
      return res
        .status(400)
        .json({ message: "❌ No password set for this user!" });
    }

    // ✅ Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.Password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "❌ Incorrect current password!" });
    }

    // ✅ Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.Password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "✅ Password changed successfully!" });
  } catch (err) {
    console.error("❌ Error changing password:", err);
    res
      .status(500)
      .json({ error: "❌ Failed to change password", details: err.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { Email } = req.body;

    const user = await User.findOne({ Email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit

    user.otp = otp;
    await user.save();

    const emailText = `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`;

    await sendEmail(user.Email, "Your OTP for Password Reset", emailText);

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.verifyOtp = async (req, res) => {

//   if (!Email) {
//   console.log("❌ Email is missing from the request body!");
//   return res.status(400).json({ message: "Email is required" });
// }

// console.log("📩 Received Email:", Email);
//   try {
//     const { Email, otp } = req.body;
//     console.log("📩 Request Body:", req.body);
//     console.log("🔍 Searching for email:", req.body.Email);

//     // Find the user by email
//     const user = await User.findOne({
//       Email: { $regex: new RegExp(`^${Email}$`, "i") },
//     });

//     if (!user) {
//       console.log("❌ No user found for email:", Email);
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if OTP matches
//     if (user.otp !== otp) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     // Check if OTP is expired
//     if (!user.otpExpires) {
//       return res.status(400).json({ message: "OTP has expired" });
//     }

//     // Optionally: clear OTP after successful verification
//     user.otp = undefined;
//     user.otpExpires = undefined;
//     await user.save();
//     const token = jwt.sign({ userId: user._id }, "your_secret_key", {
//       expiresIn: "24h",
//     });
//     res
//       .status(200)
//       .json({ message: "OTP verified successfully", token: token });
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.verifyOtp = async (req, res) => {
  try {
    console.log("📩 Full Request Body:", req.body);

    // Ensure variables are correctly destructured
    const Email = req.body.Email; // ✅ Direct extraction avoids undefined error
    const otp = req.body.otp;

    if (!Email) {
      console.log("❌ Email is missing from the request body!");
      return res.status(400).json({ message: "Email is required" });
    }

    console.log("🔍 Searching for email:", Email);

    // Case-insensitive MongoDB query
    const user = await User.findOne({
      Email: { $regex: new RegExp(`^${Email}$`, "i") },
    });

    console.log("🛠️ Database lookup result:", user); // ✅ Logs user object

    if (!user) {
      console.log("❌ No user found for email:", Email);
      return res.status(404).json({ message: "User not found" });
    }

    // Proceed with OTP validation
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("❌ Error in verifyOtp:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { Email } = req.body;
    console.log("🔄 Resending OTP for:", Email);

    if (!Email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user
    const user = await User.findOne({
      Email: { $regex: new RegExp(`^${Email}$`, "i") },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new OTP
    const newOtp = Math.floor(1000 + Math.random() * 9000);
    user.otp = newOtp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // Set expiry (5 minutes)

    await User.updateOne(
      { Email: user.Email },
      { $set: { otp: newOtp, otpExpires: user.otpExpires } }
    );

    console.log("✅ New OTP generated:", newOtp);

    // Send OTP via email (if configured)
    await sendEmail(user.Email, `Your new OTP is: ${newOtp}`);

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("❌ Error resending OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    let _id = req.user.userId;
    // Find the user by ID
    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update and save user
    user.Password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.loginWithOtp = async (req, res) => {
//   try {
//     const { Email, Password } = req.body;

//     const user = await User.findOne({ Email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const bcrypt = require("bcrypt");
//     const isMatch = await bcrypt.compare(Password, user.Password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid password" });

//     // OTP logic
//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     const otpExpires = Date.now() + 10 * 60 * 1000;

//     user.otp = otp;
//     user.otpExpires = otpExpires;
//     await user.save();

//     await sendEmail(user.Email, "Login OTP", `Your login OTP is: ${otp}. Valid for 10 mins.`);

//     res.status(200).json({ message: "OTP sent to your email" });
//   } catch (error) {
//     console.error("Login OTP error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.verifyLoginOtp = async (req, res) => {
//   try {
//     const { Email, otp } = req.body;

//     const user = await User.findOne({ Email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.otp !== otp || user.otpExpires < Date.now()) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     // Clear OTP
//     user.otp = undefined;
//     user.otpExpires = undefined;
//     await user.save();

//     const jwt = require("jsonwebtoken");
//     const token = jwt.sign({ userId: user._id, email: user.Email }, "your_secret_key", {
//       expiresIn: "1h",
//     });

//     res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     console.error("Verify login OTP error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User soft deleted successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SendOtp APi for login User
exports.sendOtp = async (req, res) => {
  try {
    const { Email } = req.body;

    const user = await User.findOne({
      Email: { $regex: new RegExp(`^${Email}$`, "i") },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Generate OTP
    let otp = Math.floor(1000 + Math.random() * 9000); // ✅ Generates 4-digit OTP

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
    await user.save();

    // 📩 Send OTP via email
    await sendEmail(
      user.Email,
      "Your Login OTP",
      `Your OTP is: ${otp}. It expires in 5 minutes.`
    );

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};
