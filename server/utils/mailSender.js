const nodemailer = require("nodemailer");
// Import the required modules
require("dotenv").config();
// This function sends an email using nodemailer
// It takes an email address, a title, and a body as parameters 
// and returns a promise that resolves to the info object or an error message
// Example usage:
// mailSender("

const mailSender = async (email, title, body) => {
  try {
    console.log("Starting email send to:", email);
    
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    console.log("Transporter created, sending email...");
    
    let info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: title,
      html: body,
    });
    
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Mail sending failed:", error.message);
    console.error("Full error:", error);
    throw error;
  }
};

module.exports = mailSender;
