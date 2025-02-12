const { TempUser, Instructor, OTP } = require("../models/instructor.model");
const { sendEmail } = require("../services/email.service");
const {
  joiException,
  exception,
  generateOTP,
} = require("../utils/functions.utils");
const { jwtSigner } = require("../utils/jwt.utils");
const { hashPassword } = require("../utils/password.utils");
const validator = require("../validations/instructor.validation");
// instructor creates an account
const createInstructor = async (req, res, next) => {
  try {
    const { error } = validator.createInstructor(req.body);
    if (error) throw joiException(error);
    const { firstname, lastname, email, password } = req.body;
    // check if the email exists
    const existingUser = await Instructor.findOne({ email });
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

    const instructor = await TempUser.findOne({ _id: otpData._id });
    if (!instructor) throw exception("User not found", 404);

    const newUserResult = new Instructor({
      firstname: instructor.firstname,
      lastname: instructor.lastname,
      email: instructor.email,
      password: instructor.password,
    });

    let [token] = await Promise.all([
      jwtSigner(email),
      newUserResult.save(),
      Instructor.deleteOne({ _id: instructor._id }),
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

module.exports = {
  createInstructor,
  verifyEmailOtp,
};
