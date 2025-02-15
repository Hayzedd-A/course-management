const { TempUser, Student, OTP } = require("../models/instructor.model");
const { sendEmail } = require("../services/email.service");
const {
  joiException,
  exception,
  generateOTP,
  excludeInstructorPrivateData,
} = require("../utils/functions.utils");
const { jwtSigner } = require("../utils/jwt.utils");
const { hashPassword, comparePassword } = require("../utils/password.utils");
const validator = require("../validations/instructor.validation");
// instructor creates an account
const createStudent = async (req, res, next) => {
  try {
    const { error } = validator.createInstructor(req.body);
    if (error) throw joiException(error);
    const { firstname, lastname, email, password } = req.body;
    // check if the email exists
    const existingUser = await Student.findOne({ email });
    if (existingUser) throw exception("Email already exists", 401);
    // hash the password and save to the database
    const [hashedPassword, salt] = await hashPassword(password);
    await TempUser.deleteOne({ email: email });
    const temp_user = new TempUser({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role: "Instructor",
    });
    await OTP.deleteOne({ email: email });
    const [otp, expiry] = generateOTP();
    const otp_obj = new OTP({
      _id: temp_user._id,
      email: email,
      otp: otp,
      expiry: expiry,
    });
    const emailContent = `
    Thank you for signing up. Use the code below to verify your account. \n ${otp}. \n The otp expires in 10 minutes`;
    const [emailResponse] = await Promise.all([
      sendEmail("Verify your Email", temp_user.email, emailContent),
      await temp_user.save(),
      await otp_obj.save(),
    ]);

    if (emailResponse instanceof Error)
      throw exception("Error sending an OTP, Please try again");
    return res.status(201).json({
      success: true,
      message: "Account created successfully, verify your email",
    });
  } catch (error) {
    console.error("Error creating instructor:", error);
    next(error);
  }
};

// POST request to verify OTP for the first verification only
const verifyEmailOtp = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    const { error } = validator.verifyEmail(req.body);
    if (error) throw joiException(error);
    const otpData = await OTP.findOne({ email });
    if (!otpData) throw exception("Email not found", 400);

    if (otpData.otp !== otp || new Date() > otpData.expiry)
      throw exception("Invalid or expired OTP", 401);

    const student = await TempUser.findOne({ _id: otpData._id });
    if (!student) throw exception("User not found", 404);

    const newUserResult = new Student({
      firstname: student.firstname,
      lastname: student.lastname,
      email: student.email,
      password: student.password,
    });

    let [token] = await Promise.all([
      jwtSigner(email),
      newUserResult.save(),
      Student.deleteOne({ _id: student._id }),
      OTP.deleteOne({ _id: otpData._id }),
    ]);
    // return token in the headers

    res.setHeader("token", token);

    res.status(200).json({
      success: true,
      message: "User verified successfully",
      data: excludePrivateData(newUserResult.toObject()),
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const resendOTP = async (req, res, next) => {
  try {
    const { error } = validator.resendOtp(req.params);
    if (error) throw joiException(error);
    const { email } = req.params;
    const otpData = await OTP.findOne({ email });
    if (!otpData) throw exception("Email not found", 400);

    const [otp, expiry] = generateOTP();
    otpData.otp = otp;
    otpData.expiry = expiry;
    await otpData.save();

    const emailContent = `
    Thank you for verifying your email. Use the code below to verify your account. \n ${otp}. \n The otp expires in 10 minutes`;
    const [emailResponse] = await Promise.all([
      sendEmail("Verify your Email", email, emailContent),
    ]);

    if (emailResponse instanceof Error) {
      throw exception("Error sending an OTP, Please try again", 503);
    }
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = validator.login(req.body);
    if (error) throw joiException(error);
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) throw exception("Invalid email or password", 401);
    const isValid = await comparePassword(password, student.password);
    if (!isValid) throw exception("Invalid email or password", 401);
    const token = await jwtSigner(email);
    res.setHeader("token", token);
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: excludeInstructorPrivateData(student.toObject()),
    });
  } catch (error) {
    console.error("Error logging in:", error);
    next(error);
  }
};

const initForgetPassword = async (req, res, next) => {
  try {
    const { error } = validator.resendOtp(req.params);
    if (error) throw joiException(error);
    const { email } = req.params;
    const student = await Student.findOne({ email });
    if (!student) throw exception("Email not found", 400);
    const [otp, expiry] = generateOTP();
    otpData = new OTP({
      _id: student._id,
      email: email,
      otp: otp,
      expiry: expiry,
    });
    await otpData.save();
    const emailContent = `
    Please use the code below to reset your password. \n ${otp}. \n The otp expires in 10 minutes`;
    const emailResponse = await sendEmail(
      "Reset Password",
      student.email,
      emailContent
    );
    if (emailResponse instanceof Error) {
      throw exception("Error sending an OTP, Please try again", 503);
    }
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const completePasswordReset = async (req, res, next) => {
  try {
    const { error } = validator.resetPassword(req.body);
    if (error) throw joiException(error);
    const { otp, email, password } = req.body;
    const otpData = await OTP.findOne({ email });
    if (!otpData) throw exception("Email not found", 400);
    if (otpData.otp !== otp || new Date() > otpData.expiry)
      throw exception("Invalid or expired OTP", 401);
    const student = await Student.findOne({ _id: otpData._id });
    if (!student) throw exception("User not found", 404);
    const [hashedPassword] = await hashPassword(password);
    student.password = hashedPassword;
    await student.save();
    await OTP.deleteOne({ _id: otpData._id });
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    next(error);
  }
};

module.exports = {
  createStudent,
  verifyEmailOtp,
  resendOTP,
  login,
  initForgetPassword,
  completePasswordReset,
};
