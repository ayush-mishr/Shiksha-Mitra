const nodemailer = require("nodemailer");
// Import the required modules
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    console.log("=== Mail Sender Debug ===");
    console.log("Starting email send to:", email);
    console.log("Subject:", title);
    console.log("MAIL_HOST:", process.env.MAIL_HOST);
    console.log("MAIL_USER:", process.env.MAIL_USER);
    console.log("MAIL_PASS exists:", !!process.env.MAIL_PASS);
    
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      connectionTimeout: 15000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    console.log("Transporter created, verifying connection...");
    
    // Verify transporter connection
    await transporter.verify();
    console.log("Transporter verified successfully!");
    
    console.log("Sending email...");
    let info = await transporter.sendMail({
      from: `"Shiksha Mitra" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });
    
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    return info;
  } catch (error) {
    console.error("=== Mail Sending Error ===");
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.code);
    console.error("Full Error:", error);
    throw error;
  }
};

module.exports = mailSender;
