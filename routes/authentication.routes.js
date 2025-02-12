const express = require("express");
const {
  createInstructor,
  verifyEmailOtp,
} = require("../controllers/authentication.controller");
const Router = express.Router();

Router.post("/instructor/signup", createInstructor);
Router.post("/instructor/verify-email", verifyEmailOtp);

module.exports = Router;
