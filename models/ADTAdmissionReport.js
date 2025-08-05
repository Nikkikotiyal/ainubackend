const mongoose = require("mongoose");

const adtAdmissionSchema = new mongoose.Schema(
  {
    uhid: String,
    ipNo: Number,
    ipVisit: Number,
    patient: {
      name: String,
      age: String,
      gender: String,
      mobileNo: String,
      monthlyIncome: Number,
      fatherOrSpouseName: String,
      address: String,
      city: String,
      state: String,
      country: String,
      nationality: String,
    },
    admissionDetails: {
      admissionDateTime: Date,
      expectedDischargeDateTime: Date,
      dischargeDateTime: Date,
      bedOccupiedDateTime: Date,
      bedInfo: {
        bedNo: String,
        bedType: String,
        billableBedType: String,
        wardName: String,
      },
      admittedBy: String,
      admittingDoctor: {
        name: String,
        specialty: String,
      },
      primaryDoctor: {
        name: String,
        specialty: String,
      },
      referralDoctor: String,
      isMLC: Boolean,
      operatorName: String,
      package: String,
      lastModified: {
        by: String,
        dateTime: Date,
      },
    },
    billingDetails: {
      billNo: String,
      paymentType: String,
      billGenerateDateTime: Date,
    },
    patientType: String,
    '"H Location"': String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { collection: "AdtAdmission" }
); // ensure collection name matches MongoDB

module.exports = mongoose.model("AdtAdmission", adtAdmissionSchema);
