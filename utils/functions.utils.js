const OTP_EXPIRY_MINUTE = 10;
const joiException = (err = {}) => {
  const errorDetail = err.details.map((e) => {
    return {
      message: e.message,
      path: e.path[0],
    };
  });
  const error = new Error("Validation Error");
  error.status = 400;
  error.details = errorDetail;
  error.type = "validation";
  return error;
};

const exception = (err, status = 500, path = null) => {
  const error = new Error(err);
  error.status = status;
  if (path) {
    error.details = path;
  }
  return error;
};

const generateOTP = () => {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + OTP_EXPIRY_MINUTE);
  console.log({ otp: otp });
  return [otp, expiryDate];
};

const excludeInstructorPrivateData = ({
  password,
  __v,
  createdAt,
  updatedAt,
  ...rest
}) => rest;

module.exports = {
  joiException,
  generateOTP,
  exception,
  excludeInstructorPrivateData,
};
