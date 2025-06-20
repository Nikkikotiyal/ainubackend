const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  method: { type: String, required: true }, // ✅ Ensure HTTP method is required
  url: { type: String, required: true }, // ✅ Log request URL
  headers: { type: Object, default: {} }, // ✅ Default empty object for headers
  body: { type: Object, default: {} }, // ✅ Store request body safely
  query: { type: Object, default: {} }, // ✅ Store query parameters

  userId: { type: String, required: true }, // ✅ Ensure user ID is required
  purpose: { type: String, required: true }, // ✅ Purpose of the request
  remarks: { type: String, default: "" }, // ✅ Allow optional remarks

  timestamp: { type: Date, default: Date.now }, // ✅ Auto-generate timestamp
  formattedTimestamp: {
    type: String,
    default: () => new Date().toLocaleString(),
  }, // ✅ Readable timestamp format
});

// ✅ Indexing for faster queries
logSchema.index({ userId: 1, timestamp: -1 });

const RequestLog = mongoose.model("RequestLog", logSchema);
module.exports = RequestLog;
