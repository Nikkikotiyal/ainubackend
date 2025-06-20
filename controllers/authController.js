const User = require("../models/User");
const bcrypt = require("bcryptjs");
const UserModule = require("../models/userModule");
const Module = require("../models/Module");
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const AdtAdmission = require("../models/ADTAdmissionReport");
const { ObjectId } = require("mongoose").Types;
const app = express();
const RequestLog = require("../models/logmodel"); // ✅ Check this path

const logRequest = async (emailOrUsername, remark) => {
  await RequestLog.create({
    method: "POST",
    url: "/login",
    userId: emailOrUsername,
    purpose: "User Login",
    remarks: remark, // ✅ Store success/failure remarks
    timestamp: new Date(),
  });
};

exports.loginUser = async (req, res) => {
  const { emailOrUsername, password } = req.body;
  console.log("Request body:", req.body);

  try {
    const user = await User.findOne({
      $or: [{ Email: emailOrUsername }, { UserName: emailOrUsername }],
    });

    if (!user) {
      await logRequest(
        emailOrUsername,
        "Login Attempt Failed - User Not Found"
      ); // 🔴 Failed remark
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isDeleted) {
      await logRequest(
        emailOrUsername,
        "Login Attempt Failed - Account Deactivated"
      ); // 🔴 Failed remark
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      await logRequest(
        emailOrUsername,
        "Login Attempt Failed - Invalid Password"
      ); // 🔴 Failed remark
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, "your_secret_key", {
      expiresIn: "24h",
    });

    console.log("Generated Token:", token);
    await logRequest(emailOrUsername, "Login Successful"); // ✅ Success remark
    return res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Login error:", error);
    await logRequest(emailOrUsername, "Login Attempt Failed - Server Error"); // 🔴 Failed remark
    res.status(500).json({ error: "Login failed" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    });

    // console.log(users);
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
    const module = await Module.find({});
    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch modules" });
  }
};


exports.saveModule = async (req, res) => {
  try {
    console.log("📦 Received Payload:", JSON.stringify(req.body, null, 2)); // ✅ Debugging step

    const userId = req.body.userId;
    const modules = req.body.modules;

    if (!Array.isArray(modules) || modules.length === 0) {
      return res.status(400).json({ message: "No modules received" });
    }

    // ✅ Step 1: Delete Existing Modules
    const deleteResult = await UserModule.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });
    console.log("🗑️ Deleted Count:", deleteResult.deletedCount);

    // ✅ Step 2: Clean Data Before Insert
    const userModules = modules.map((module) => {
      delete module._id; // ✅ Prevent duplicate `_id` errors
      return {
        Moduleid: module.Moduleid,
        userId: new mongoose.Types.ObjectId(userId),
        Selected: Boolean(module.selected), // 🔥 Ensures correct Boolean conversion
      };
    });

    // 🔥 **Debugging Log Before Insert**
    console.log(
      "📝 Final Insert Payload to MongoDB:",
      JSON.stringify(userModules, null, 2)
    );

    // ✅ Step 3: Insert New Modules
    await UserModule.insertMany(userModules);

    res.status(200).json({ message: "Modules saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving modules:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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

exports.getDashUserModuleByUserId = async (req, res) => {
  const userId = req.params.userId;
  console.log("🔎 Received userId:", userId);

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    console.log("🔎 Starting aggregation...");

    const modules = await UserModule.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId), Selected: true },
      },

      {
        $lookup: {
          from: "module",
          localField: "Moduleid",
          foreignField: "Moduleid",
          as: "moduleDetails",
        },
      },
      { $unwind: { path: "$moduleDetails", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          userId: 1,
          moduleid_in_userModule: "$Moduleid",
          moduleid_in_module: "$moduleDetails.moduleid",
          MODLE_NAME: "$moduleDetails['MODLE NAME']",
          REPORT_NAME: "$moduleDetails.REPORT NAME",
          Selected: 1,
          moduleDetails: 1,
        },
      },
    ]);

    console.log("✅ Aggregation done.");
    res.status(200).json({ modules });
  } catch (err) {
    console.error("❌ Error in aggregation:", err);
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
//this api for changepassword form
// exports.changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword, confirmPassword } = req.body;
//     console.log(" req.user", req.user);
//     let _id = req.user.userId;

//     console.log("📩 Incoming request body:", req.body); // ✅ Debugging: Log incoming data

//     // ✅ Validate input
//     if (
//       !currentPassword?.trim() ||
//       !newPassword?.trim() ||
//       !confirmPassword?.trim()
//     ) {
//       return res.status(400).json({ message: "❌ All fields are required!" });
//     }

//     // ✅ Check if new password matches confirm password
//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({
//         message: "❌ New password and confirm password do not match!",
//       });
//     }

//     // ✅ Find user by email (Case-insensitive)
//     const user = await User.findOne({
//       _id,
//     }).select("+Password"); // ✅ Explicitly fetch Password field
//     if (!user) {
//       return res.status(404).json({ message: "❌ User not found!" });
//     }

//     if (!user.Password) {
//       return res
//         .status(400)
//         .json({ message: "❌ No password set for this user!" });
//     }

//     // ✅ Verify current password
//     const isMatch = await bcrypt.compare(currentPassword, user.Password);
//     if (!isMatch) {
//       return res
//         .status(400)
//         .json({ message: "❌ Incorrect current password!" });
//     }

//     // ✅ Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 12);
//     user.Password = hashedPassword;
//     await user.save();

//     res
//       .status(200)
//       .json({ success: true, message: "✅ Password changed successfully!" });
//   } catch (err) {
//     console.error("❌ Error changing password:", err);
//     res
//       .status(500)
//       .json({ error: "❌ Failed to change password", details: err.message });
//   }
// };

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    let _id = req.user.userId;

    console.log("🔎 Checking Database for User ID:", _id);

    // ✅ Convert User ID to ObjectId format correctly
    const objectId =
      req.userId instanceof ObjectId ? req.userId : new ObjectId(req.userId);

    console.log("🔎 Converted User ID:", objectId);

    // ✅ Fetch user from the database
    const user = await User.findOne({ _id: objectId }).select("+Password");
    console.log("🔎 User Found:", user);

    if (!user) {
      console.error("❌ User Not Found!");
      return res.status(404).json({ error: "User not found" });
    }

    // 🔐 Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.Password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // 🔐 Validate New Password Match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New passwords do not match" });
    }

    // 🔄 Hash New Password & Update User
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const result = await User.updateOne(
      { _id: objectId },
      { $set: { Password: hashedPassword } }
    );

    console.log("🛠️ Update Result:", result);

    // ✅ Fetch updated password after update
    const updatedUser = await User.findOne({ _id: objectId }).select(
      "+Password"
    );
    console.log("🔎 Updated Password:", updatedUser.Password);

    res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("❌ Password Change Error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
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

    // console.log("🛠️ Database lookup result:", user); // ✅ Logs user object

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
    await user.save();

    // console.log("✅ New OTP generated:", newOtp);

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
      "Your One-Time Password (OTP) for Login",
      `Dear User,

We received a request to log in to your account. Please use the following One-Time Password (OTP) to proceed:

🔐 OTP: ${otp}

This OTP is valid for 5 minutes. For your account’s security, do not share this code with anyone. If you did not initiate this request, please ignore this email or contact our support team immediately.

Thank you for choosing us.

Best regards,  
The DMS AINU Team`
    );

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAdtAdmissionReport = async (req, res) => {
  try {
    // console.log("API hit /AdtAdmissionReport"); // debug
    const data = await AdtAdmission.find().limit(100);
    // console.log(data); // see what’s returned
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching admission report:", error);
    res.status(500).json({ error: "Failed to fetch admission report" });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await RequestLog.find().sort({ timestamp: -1 });
    res.json(logs); // ✅ Send logs with user emails
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

exports.addModule = async (req, res) => {
  try {
    const {
      Moduleid,
      "MODLE NAME ": MODLE_NAME,
      "REPORT NAME": REPORT_NAME,
    } = req.body; // ✅ Space included

    if (!Moduleid || !MODLE_NAME || !REPORT_NAME) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const existingModule = await Module.findOne({ Moduleid });
    if (existingModule) {
      return res.status(409).json({ error: "Module ID already exists!" });
    }

    const newModule = new Module({
      Moduleid,
      "MODLE NAME ": MODLE_NAME, // ✅ Match getModule format
      "REPORT NAME": REPORT_NAME,
    });
    await newModule.save();

    res.status(201).json({
      message: "Module added successfully!",
      data: {
        Moduleid: newModule.Moduleid,
        "MODLE NAME ": newModule["MODLE NAME "], // ✅ Ensure exact key format
        "REPORT NAME": newModule["REPORT NAME"],
      },
    });
  } catch (error) {
    console.error("❌ Error Adding Module:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const {
      Moduleid,
      "MODLE NAME ": MODLE_NAME,
      "REPORT NAME": REPORT_NAME,
    } = req.body;

    if (!Moduleid || !MODLE_NAME || !REPORT_NAME) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const updatedModule = await Module.findOneAndUpdate(
      { Moduleid }, // ✅ search by Moduleid
      {
        "MODLE NAME ": MODLE_NAME,
        "REPORT NAME": REPORT_NAME,
      },
      { new: true } // ✅ return updated document
    );

    if (!updatedModule) {
      return res.status(404).json({ error: "Module not found." });
    }

    res.status(200).json({
      message: "Module updated successfully!",
      data: updatedModule,
    });
  } catch (error) {
    console.error("❌ Error updating module:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const { Moduleid } = req.params;

    const updatedModule = await Module.findOneAndUpdate(
      { Moduleid },
      { isDeleted: true },
      { new: true }
    );

    if (!updatedModule) {
      return res.status(404).json({ error: "Module not found!" });
    }

    res.status(200).json({
      message: "Module soft-deleted successfully!",
      data: updatedModule,
    });
  } catch (error) {
    console.error("❌ Error soft-deleting module:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
