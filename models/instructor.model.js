const { default: mongoose } = require("mongoose");

const temp_user = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      default: "Student",
      enum: ["Student", "Instructor"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const otpSchema = new mongoose.Schema(
  {
    email: { type: String },
    phone_num: { type: String },
    otp: { type: String },
    token: { type: String },
    expiry: { type: Date, required: true },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

const instructorSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Instructor = mongoose.model("Instructor", instructorSchema);

const OTP = mongoose.model("OTP", otpSchema);

const TempUser = mongoose.model("tempUser", temp_user);

module.exports = { TempUser, Instructor, OTP };
