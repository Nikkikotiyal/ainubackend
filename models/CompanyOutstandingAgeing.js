const mongoose = require('mongoose');

const companyOutstandingSchema = new mongoose.Schema({
  UHId: { type: String, required: true },
  'Patient Name': { type: String, required: true },
  'Company type': { type: String },
  'Company name': { type: String },
  'Rate Contract': { type: String },
  'Covering letter no': { type: String },
  BillNo: { type: String },
  'IP/ER no': { type: Number },
  Episode: { type: String },
  'Claim amount': { type: Number },
  'Outstanding amount': { type: Number },
  'Received amount': { type: Number },
  'Current status': { type: String },
  'Claim raised on': { type: String },   // can be changed to Date if format is consistent
  Slots: { type: String },
  BillDate: { type: String }             // can also be Date
}, { timestamps: true, collection: 'CompanyOutstandingAgeingReport' });

module.exports = mongoose.model('CompanyOutstandingAgeingReport', companyOutstandingSchema);
