const mongoose = require("mongoose");

const productionUrl = "mongodb://ainuindia_user:Aanp20252030@69.62.80.20:27017/ainuindia_dms?authSource=admin";

mongoose
  .connect(productionUrl, {
    serverSelectionTimeoutMS: 30000
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ Connection error:", err));

module.exports = mongoose;
