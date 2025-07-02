const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  companyName: String,
  companyType: String,
  coveringLetterNo: String,
  coveringLetterDateTime: String,
  claimRaisedBy: String,
  episode: String,
  ipOrEmNo: Number,
  claimNo: String,
  uhid: String,
  patientName: String,
  billNo: String,
  claimAmount: Number,
  claimStatus: String,
  settleStatus: String,
}, { timestamps: true, collection: 'Claims' });

module.exports = mongoose.model('Claim', claimSchema);
