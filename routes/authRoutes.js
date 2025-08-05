const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
// const { signupUser } = require('../controllers/authController');
const { authenticateToken } = require("../middlewares/authMiddleware");

// POST - signup new user
router.post("/signup", authController.signupUser);
router.post("/login", authController.loginUser);
router.get("/get-users", authenticateToken, authController.getUsers);
router.get(
  "/getUsers/:location",
  authenticateToken,
  authController.getUsersByLocation
);
router.get("/getModule", authenticateToken, authController.getModule);
router.post("/save-modules", authenticateToken, authController.saveModule);
router.get(
  "/getUserModulesByUserID/:userId",
  authenticateToken,
  authController.getUserModulesByUserId
);
router.get(
  "/getUserById/:userId",
  authenticateToken,
  authController.getUserById
);
router.get(
  "/getDashUserModuleByUserId/:userId",
  authenticateToken,
  authController.getDashUserModuleByUserId
);
router.put(
  "/updateUserById/:userId",
  authenticateToken,
  authController.updateUser
);
router.post(
  "/changePassword",
  authenticateToken,
  authController.changePassword
);
router.post(
  "/forgetPassword",
  authenticateToken,
  authController.requestPasswordReset
);
// router.post("/verifyOtp", authController.verifyOtp);
router.post(
  "/verifyOtp",
  (req, res, next) => {
    console.log("📩 Received OTP verification request:", req.body);
    next();
  },

  authController.verifyOtp
);

router.get("/data", (req, res) => {
  res.json({
    success: true,
    message: "🔐 Secure API accessed over HTTPS",
    data: {
      id: 1,
      name: "Secure Resource",
      timestamp: new Date(),
    },
  });
});

// Temporary API to check users
router.get("/debug-users", async (req, res) => {
  try {
    const users = await User.find({}, { Email: 1, UserName: 1, isDeleted: 1 });
    res.json({ totalUsers: users.length, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/sendOtp", authController.sendOtp);
router.post("/resetPassword", authController.resetPassword);
router.put("/deleteUser/:id", authenticateToken, authController.deleteUser);
router.post("/resendOtp", authController.resendOtp);
router.get(
  "/AdtAdmissionReport",
  authenticateToken,
  authController.getAdtAdmissionReport
);
router.get("/logs", authenticateToken, authController.getLogs);
router.post("/addModule", authenticateToken, authController.addModule);
router.put("/updateModule", authenticateToken, authController.updateModule);
router.delete(
  "/deleteModule/:Moduleid",
  authenticateToken,
  authController.deleteModule
);
router.get("/claims", authController.getClaims);
router.post("/claim/soft-delete", authController.softDeleteClaimRaised);
router.get("/specialties", authController.getSpecility);
router.post("/addSpecility", authController.addSpecility);
router.get("/ipdischarge", authController.getIpDischarge);
router.post(
  "/ip-discharge-reports/soft-delete",
  authController.softDeleteIpDischarge
);
router.post(
  "/adt-admission/delete-many",
  authController.softDeleteAdtAdmission
);
router.get("/company-outstanding-report-details", authController.getCompanyOutstandingReportDetails);
router.post(
  "/company-outstanding-report-details/delete-many",
  authController.softDeleteCompanyOutstandingReport
);
router.get("/package-status-report", authController.getPackageStatusReport);
router.post(
  "/package-status-report/delete-many",
  authController.softDeletePackageStatusReport
);
router.get("/claimed-received-amount", authController.getClaimReceivedAmount);
router.post(
  "/soft-delete-received-amount/delete-many",
  authController.softDeleteByReceivedAmount
);
router.get(
  "/insurance-company-report",
  authController.getInsuranceCompanyReport
);
router.post(
  "/soft-delete-insurance-company/delete-many",
  authController.softDeleteByInsuranceCompany
);
router.get(
  "/company-outstanding-ageing-report-details",
  authController.getCompanyOutstandingAgeingReportDetails
);
router.post(
  "/company-outstanding-ageing-report-details/delete-many",
  authController.softDeleteCompanyOutstandingAgeingReportDetails
);
router.get("/disallow-report", authController.getDisallowReport);
router.get("/expired-patient-report", authController.getExpiredPatientReport);
// module.exports = router;
// // app.post('/api/login', loginUser);
module.exports = router;
