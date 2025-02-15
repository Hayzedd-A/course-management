const express = require("express");
const {
  createInstructor,
  verifyEmailOtp,
  resendOTP,
  login,
  initForgetPassword,
  completePasswordReset,
} = require("../controllers/authentication.controller");
const Router = express.Router();

Router.post("/instructor/signup", createInstructor);
Router.post("/instructor/verify-email", verifyEmailOtp);
Router.get("/instructor/resend-otp/:email", resendOTP);
Router.post("/instructor/login", login);
Router.get("/instructor/forget-password/init/:email", initForgetPassword);
Router.post("/instructor/forget-password/complete", completePasswordReset);

module.exports = Router;
