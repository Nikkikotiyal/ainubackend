const mongoose = require('mongoose');

const companyOutstandingSchema = new mongoose.Schema({
  "Corporate Name": { type: String },
  "Company Type": { type: String },
  "UHID": { type: String },
  "IPNO": { type: Number },
  "Patient Name": { type: String },
  "Date Of Admission": { type: String },
  "BillNo": { type: String },
  "Episode": { type: String },
  "IP_Visit": { type: Number },
  "BillDatetime": { type: String },
  "BillAmount": { type: Number },
  "DiscountAmount": { type: Number },
  "Net Amount": { type: Number },
  "PatientAmount": { type: Number },
  "CreditAmount": { type: Number },
  "Received Amount till to date": { type: Number },
  "TDS Amount till to date": { type: Number },
  "Discount Amount till to date": { type: Number },
  "Disallow Amount till to date": { type: Number },
  "Total Received till to date": { type: Number },
  "Outstanding till to date": { type: Number },
  "Total Received till today": { type: Number },
  "Total deduction till today": { type: Number },
  "Total current outstanding": { type: Number },
  "CurrentStatus": { type: String },
  "ClaimNo": { type: String },
  "H Location": { type: String },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true, collection: 'CompanyWiseOutstandingReportDetails' });

module.exports = mongoose.model('CompanyWiseOutstandingReportDetails', companyOutstandingSchema);
