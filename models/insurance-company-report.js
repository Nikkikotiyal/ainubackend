const mongoose = require("mongoose");

const InsuranceCompanyReport = new mongoose.Schema({
  srno: Number,
  IPID: Number,
  BillDate: Date,
  BillNo: String,
  ClaimDate: Date,
  ClaimNumber: String,
  Company: {
    Type: String,
    Name: String,
    RateContract: String,
    TPAInsurance: String,
  },
  Patient: {
    UHID: String,
    Name: String,
    Gender: String,
    DateOfBirth: Date,
    ContactNumber: String,
  },
  PatientType: String,
  Service: {
    Description: String,
    Code: String,
    Quantity: Number,
  },
  Billing: {
    BillAmount: Number,
    Discount: Number,
    Total: Number,
    Deduction: Number,
    CoInsuranceAmount: Number,
    NetAmount: Number,
  },
  Physician: {
    Name: String,
    Specialty: String,
  },
  Hospital: {
    Name: String,
    Location: String,
    AdmitDateTime: Date,
    DischargeDateTime: Date,
  },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});



module.exports = mongoose.model(
  "Insurance-company-report",
  InsuranceCompanyReport
);
