const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  method: String,
  url: String,
  headers: Object,
  body: Object,
  query: Object,
//   email: { type: String, required: true } ,
  timestamp: { type: Date, default: Date.now },
    formattedTimestamp: String ,  // ✅ New Field
    // email: { type: String, required: true } 

});

const RequestLog = mongoose.model("RequestLog", logSchema);
module.exports = RequestLog;
