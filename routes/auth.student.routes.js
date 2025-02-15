const express = require("express");
const {
  createStudent,
  verifyEmailOtp,
  resendOTP,
  login,
  initForgetPassword,
  completePasswordReset,
} = require("../controllers/authentication.student.controller");
const Router = express.Router();

Router.post("/student/signup", createStudent);
Router.post("/student/verify-email", verifyEmailOtp);
Router.get("/student/resend-otp/:email", resendOTP);
Router.post("/student/login", login);
Router.get("/student/forget-password/init/:email", initForgetPassword);
Router.post("/student/forget-password/complete", completePasswordReset);

module.exports = Router;
