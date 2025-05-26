const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Password: { type: String, required: true, maxlength: 200 },
  UserName: { type: String, maxlength: 30 },
  Designation: { type: String, maxlength: 30 },
  Email: { type: String, maxlength: 50, unique: true },
  MobileNo: { type: String, maxlength: 10 },
  otp: { type: String, maxlength: 10 },
  Location: { type: String, maxlength: 50 },
  Status: { type: String, enum: ["A", "S", "I"], default: "A" },
  Role: { type: String, enum: ["User", "SuperAdmin"], default: "User" },
  isDeleted: { type: Boolean, default: false }, // Soft delete flag
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
  // userId: {
  //     type: mongoose.Schema.Types.ObjectId, // or String, if you're storing it as a plain string
  //     ref: "User", // optional, if you have a User model
  //     required: true,
  //   },
});

module.exports = mongoose.model("User", userSchema);
