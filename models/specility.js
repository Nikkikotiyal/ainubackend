const mongoose = require("mongoose");

const specialtySchema = new mongoose.Schema(
  {
    specialty: {
      type: String,
      required: true,
      enum: [
        "Urology",
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "Dermatology",
        "Nephrology"
      ], // Extendable
      trim: true,
    },
  },
  { collection: "Specialties", timestamps: true }
);

module.exports = mongoose.model("Specialty", specialtySchema);
