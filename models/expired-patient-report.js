const mongoose = require('mongoose');

const expiredPatientReportSchema = new mongoose.Schema({
  "SL No": { type: Number },
  "Facility": { type: String },
  "UHID": { type: String },
  "IP/ER": { type: Number },
  "PatientName": { type: String },
  "Age/Gender": { type: String },
  "Father/Spouse Name": { type: String },
  "Admit Date & Time": { type: String },
  "Registration Date&Time": { type: String },
  "Dateofbirth": { type: String },
  "Primary Doctor": { type: String },
  "Primary Doctor specality": { type: String },
  "Ward & BedNo": { type: String },
  "ADDRESS": { type: String },
  "ExpirydateTime": { type: String },
  "Mobile NO": { type: mongoose.Schema.Types.Mixed },
  "Length of Stay in Hours": { type: Number },
  "H Location": { type: String },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true, collection: 'expired-patient-report' });

module.exports = mongoose.model('ExpiredPatientReport', expiredPatientReportSchema);