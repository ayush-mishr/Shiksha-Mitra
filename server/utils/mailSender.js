const nodemailer = require("nodemailer");
require("dotenv").config();

// SendGrid support for Render compatibility
let sgMail = null;
if (process.env.SENDGRID_API_KEY) {
  sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const mailSender = async (email, title, body) => {
  try {
    console.log("=== Mail Sender Debug ===");
    console.log("Starting email send to:", email);
    console.log("Subject:", title);
    
    // If SendGrid API key is available, use SendGrid (better for Render)
    if (process.env.SENDGRID_API_KEY && sgMail) {
      console.log("Using SendGrid for email delivery");
      
      try {
        const msg = {
          to: email,
          from: process.env.MAIL_USER || "noreply@shikshamitra.com",
          subject: title,
          html: body,
        };
        
        await sgMail.send(msg);
        console.log("Email sent successfully via SendGrid!");
        return { messageId: "sent-via-sendgrid", response: "success" };
      } catch (sgError) {
        console.error("SendGrid error:", sgError.message);
        console.log("Falling back to Gmail SMTP...");
      }
    }
    
    // Fall back to Gmail SMTP
    console.log("MAIL_HOST:", process.env.MAIL_HOST);
    console.log("MAIL_USER:", process.env.MAIL_USER);
    console.log("MAIL_PASS exists:", !!process.env.MAIL_PASS);
    
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: 465, // Use SSL port for better compatibility with Render
      secure: true, // Use SSL/TLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    console.log("Transporter created with SSL (port 465)");
    
    // Verify transporter connection with retry
    let verified = false;
    let retries = 2;
    
    while (retries > 0 && !verified) {
      try {
        console.log(`Verifying connection (attempt ${3 - retries}/2)...`);
        await transporter.verify();
        console.log("Transporter verified successfully!");
        verified = true;
      } catch (verifyError) {
        retries--;
        if (retries > 0) {
          console.log(`Verify failed: ${verifyError.message}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          console.log("Verification failed, continuing with send attempt...");
          verified = true; // Continue anyway
        }
      }
    }
    
    console.log("Sending email via Gmail SMTP...");
    let info = await transporter.sendMail({
      from: `"Shiksha Mitra" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });
    
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("=== Mail Sending Error ===");
    console.error("Error Message:", error.message);
    console.error("Error Code:", error.code);
    
    // Provide helpful suggestions
    if (error.code === "ETIMEDOUT") {
      console.error("❌ ISSUE: Connection timeout on port 465");
      console.error("✅ SOLUTION 1: Use SendGrid (free tier available)");
      console.error("   - Sign up at https://sendgrid.com");
      console.error("   - Add SENDGRID_API_KEY to Render environment variables");
      console.error("✅ SOLUTION 2: Use a different email provider");
      console.error("   - Try Brevo, AWS SES, or Mailgun");
    }
    
    if (error.code === "ENOTFOUND") {
      console.error("❌ ISSUE: MAIL_HOST is invalid or not found");
      console.error("✅ SOLUTION: Check MAIL_HOST in .env file");
    }
    
    if (error.message && error.message.includes("Invalid login")) {
      console.error("❌ ISSUE: MAIL_USER or MAIL_PASS is incorrect");
      console.error("✅ SOLUTION: Use Gmail App Password, not regular password");
    }
    
    console.error("Full Error:", error);
    throw error;
  }
};

module.exports = mailSender;
