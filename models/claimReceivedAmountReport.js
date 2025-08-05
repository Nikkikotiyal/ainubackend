const mongoose = require("mongoose");

const InsuranceClaimSchema = new mongoose.Schema(
  {
    facilityName: { type: String, required: true },
    coveringLetter: {
      number: { type: String, default: null },
      dateTime: { type: Date },
      amount: { type: Number },
    },
    status: {
      type: String,
      enum: ["Unsettled", "Settled"],
      default: "Unsettled",
    },
    uhid: { type: String, required: true },
    episodeType: { type: String, enum: ["IP", "ER"], required: true },
    patient: {
      nameWithTitle: { type: String },
      admittingDoctor: { type: String },
    },
    company: {
      type: {
        type: String,
        enum: ["Insurance", "Corporate", "TPA"],
        required: true,
      },
      name: { type: String },
    },
    bill: {
      number: { type: String },
      dateTime: { type: Date },
      grossAmount: { type: Number },
      discountAmount: { type: Number },
      netAmount: { type: Number },
      patientPaidAmount: { type: Number },
    },
    claim: {
      number: { type: String, default: null },
      amount: { type: Number },
      receivedAmount: { type: Number },
      tdsAmount: { type: Number },
      discountAmount: { type: Number },
      disallowAmount: { type: Number },
      dueAmount: { type: Number },
      settled: { type: Boolean, default: false },
    },
    receipt: {
      number: { type: String, default: null },
      dateTime: { type: Date },
      mop: { type: String },
      transactionDetails: {
        chequeOrNeftNo: { type: String, default: null },
        draftNo: { type: String, default: null },
        transactionNo: { type: String, default: null },
      },
      amount: { type: Number },
      transactionDateTime: { type: Date },
      userName: { type: String },
      bankAccountNo: { type: String, default: null },
    },
    location: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("claim-received-amount", InsuranceClaimSchema);