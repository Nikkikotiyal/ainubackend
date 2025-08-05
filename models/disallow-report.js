const mongoose = require('mongoose');

const disallowReportSchema = new mongoose.Schema({
  "SI No": { type: mongoose.Schema.Types.Mixed },
  "Company Type": { type: String },
  "Rate Contract Name": { type: String },
  "Covering letter no": { type: mongoose.Schema.Types.Mixed },
  "UHID": { type: String },
  "Patient Name": { type: String },
  "IP/ER No": { type: mongoose.Schema.Types.Mixed },
  "Episode": { type: String },
  "Bill No": { type: String },
  "Bill date": { type: String },
  "Bill Amount": { type: Number },
  "Claim Amount": { type: Number },
  "Received Amount": { type: Number },
  "Tds Amount": { type: Number },
  "Discount Amount": { type: Number },
  "Disallow Amount": { type: Number },
  "H Location": { type: String },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true, collection: 'disallow-report' });

module.exports = mongoose.model('DisallowReport', disallowReportSchema);