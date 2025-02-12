const { transporter } = require("../config/nodemailer.config");
const EMAIL = process.env.MAIL_USERNAME;
const companyName = process.env.COMPANY_NAME;

const sendEmail = async (subject, recipientEmail, content) => {
  try {
    // Set email options
    const mailOptions = {
      from: `${companyName} <${EMAIL}>`, // Sender address
      to: recipientEmail, // Recipient email
      subject,
      // html: templateFile, // Use rendered template as HTML
      text: content, // Plain text version of the email (optional)
    };

    // Send the email
    const message = await transporter.sendMail(mailOptions);
    console.log(message.response);
    return message.response;
    // console.log("email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
    return error;
  }
};

module.exports = { sendEmail };
