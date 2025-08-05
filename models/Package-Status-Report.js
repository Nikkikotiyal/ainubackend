const mongoose = require("mongoose");

const PackageStatusReportSchema = new mongoose.Schema(
  {
    UHId: {
      type: String,
      required: true,
      match: /^AIBH\.\d+$/, // Ensures UHId pattern matches e.g., AIBH.158385
    },
    IPID: {
      type: Number,
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    packageName: {
      type: String,
      required: true,
    },
    bedType: {
      type: String,
      enum: ["Cubical", "Ward", "ICU", "Private Room"],
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        "Urology",
        "Cardiology",
        "Neurology",
        "Oncology",
        "General Medicine",
      ],
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Done", "Cancelled"],
      required: true,
      default: "Pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    "H Location": { type: String },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { collection: "Package-Status-Report", timestamps: true }
);
module.exports = mongoose.model(
  "Package-Status-Report",
  PackageStatusReportSchema
);
