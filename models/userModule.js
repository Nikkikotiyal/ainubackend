const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
  {
    Moduleid: Number,
    MODLE_NAME: String,
    REPORT_NAME: String,
    // isChecked: boolean,
    //   IsView: String,
    //   IsPrint: String,
    //   isExport: String,
    Selected: { type: Boolean },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // or String, if you're storing it as a plain string
      ref: "User", // optional, if you have a User model
      required: true,
    },
  },
  {
    collection: "userModule", // Replace this with the exact collection name in MongoDB
  }
);

module.exports = mongoose.model("userModule", moduleSchema);
