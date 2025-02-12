const nodemailer = require("nodemailer");
require("dotenv").config();
const host = process.env.MAIL_SERVER;
const user = process.env.MAIL_USERNAME;
const pass = process.env.MAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  host: host,
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: user,
    pass: pass,
  },
});
module.exports = { transporter };
