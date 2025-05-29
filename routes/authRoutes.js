const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
// const { signupUser } = require('../controllers/authController');
const { authenticateToken } = require("../middlewares/authMiddleware");

// POST - signup new user
router.post("/signup", authController.signupUser);
router.post("/login", authController.loginUser);
router.get("/get-users", authController.getUsers);
router.get("/getUsers/:location", authController.getUsersByLocation);
router.get("/getModule", authController.getModule);
router.post("/save-modules", authController.saveModule);
router.get("/getUserModulesByUserID/:userId", authController.getUserModulesByUserId);
router.get("/getUserById/:userId", authController.getUserById);
router.get("/getDashUserModuleByUserId/:userId",authController.getDashUserModuleByUserId)
router.put("/updateUserById/:userId", authController.updateUser);
router.post(
  "/changePassword",  
  authenticateToken,
  authController.changePassword
);
router.post("/forgetPassword", authController.requestPasswordReset);
// router.post("/verifyOtp", authController.verifyOtp);
router.post(
  "/verifyOtp",
  (req, res, next) => {
    console.log("📩 Received OTP verification request:", req.body);
    next();
  },
  authController.verifyOtp
);

router.post("/sendOtp", authController.sendOtp);
router.post("/resetPassword", authenticateToken, authController.resetPassword);
router.put("/deleteUser/:id", authController.deleteUser);
router.post("/resendOtp",authController.resendOtp)

// module.exports = router;
// // app.post('/api/login', loginUser);
module.exports = router;
