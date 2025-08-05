const mongoose = require('mongoose');

const companyOutstandingAgeingReportDetailsSchema = new mongoose.Schema({
  "UHId": { type: String },
  "Patient Name": { type: String },
  "Company type": { type: String },
  "Company name": { type: String },
  "Rate Contract": { type: String },
  "Covering letter no": { type: String },
  "BillNo": { type: String },
  "IP/ER no": { type: Number },
  "Episode": { type: String },
  "Claim amount": { type: Number },
  "Outstanding amount": { type: Number },
  "Received amount": { type: Number },
  "Current status": { type: String },
  "Claim raised on": { type: String },
  "Slots": { type: String },
  "BillDate": { type: String },
  "H Location": { type: String },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true, collection: 'company-outstanding-ageing-report-details' });

module.exports = mongoose.model('CompanyOutstandingAgeingReportDetails', companyOutstandingAgeingReportDetailsSchema);