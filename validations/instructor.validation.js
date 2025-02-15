const Joi = require("joi");
const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/;

const createInstructorSchema = Joi.object({
  firstname: Joi.string().min(2).max(50).required().messages({
    "string.empty": "First name is required",
    "string.min": "First name must be at least 2 characters",
    "string.max": "First name must not exceed 50 characters",
  }),
  lastname: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least 2 characters",
    "string.max": "Last name must not exceed 50 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().pattern(password_regex).required().messages({
    "string.empty": "Password is required",
    "string.pattern.base":
      "Password must be at least 8 characters long and include letters and numbers",
  }),
  confirm_password: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match the password",
    "string.empty": "Confirm password is required",
  }),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  otp: Joi.string().required().messages({
    "string.empty": "OTP is required",
  }),
});

const resendOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  otp: Joi.string().required().messages({
    "string.empty": "OTP is required",
  }),
  password: Joi.string().pattern(password_regex).required().messages({
    "string.empty": "Password is required",
    "string.pattern.base":
      "Password must be at least 8 characters long and include letters and numbers",
  }),
  confirm_password: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match the new password",
    "string.empty": "Confirm password is required",
  }),
});

module.exports = {
  createInstructor: (request = {}) =>
    createInstructorSchema.validate(request, { abortEarly: false }),
  verifyEmail: (request = {}) =>
    verifyEmailSchema.validate(request, { abortEarly: false }),
  resendOtp: (request = {}) =>
    resendOtpSchema.validate(request, { abortEarly: false }),
  login: (request = {}) => loginSchema.validate(request, { abortEarly: false }),
  resetPassword: (request = {}) =>
    resetPasswordSchema.validate(request, { abortEarly: false }),
};
