const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Email Service with multiple providers
 * Priority: SendGrid > Gmail SMTP > Mock (console logging)
 */

class EmailService {
  constructor() {
    this.provider = null;
    this.initializeProvider();
  }

  initializeProvider() {
    // Check if we're in a test/mock environment
    if (process.env.NODE_ENV === "test" || process.env.MOCK_EMAIL === "true") {
      console.log("✓ Email Service: Using MOCK (console logging)");
      this.provider = "mock";
      return;
    }

    console.log("\n📧 Email Service Initialization");
    console.log("================================");

    // Check for SendGrid API Key
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.sgMail = sgMail;
        console.log("✅ SendGrid API Key: Configured");
        console.log("   🚀 PRIMARY PROVIDER (Render-compatible)");
        this.provider = "sendgrid";
        console.log("================================\n");
        return;
      } catch (err) {
        console.warn("⚠ SendGrid package not found, falling back to Gmail");
      }
    } else {
      console.log("⚠️  SendGrid API Key: Not configured");
      console.log("   ℹ️  To fix Render issues: Add SENDGRID_API_KEY to environment");
    }

    // Check for Gmail credentials
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      console.log("✅ Gmail Credentials: Configured");
      console.log("   📍 SECONDARY (port 587 TLS - local dev preferred)");
      this.provider = "gmail";
      console.log("================================\n");
      return;
    } else {
      console.log("❌ Gmail Credentials: Not configured");
    }

    console.log("\n📊 Runtime Provider Priority:");
    console.log("1️⃣  SendGrid (API-based - recommended for Render)");
    console.log("2️⃣  Gmail SMTP (port 587 TLS - local development)");
    console.log("3️⃣  Mock Console (testing/debugging)");
    console.warn("⚠ Email Service: No email provider configured! Using MOCK mode");
    this.provider = "mock";
    console.log("================================\n");
  }

  async sendEmail(email, subject, htmlBody) {
    console.log("\n📧 EMAIL SERVICE DEBUG");
    console.log("─".repeat(50));
    console.log(`Provider: ${this.provider.toUpperCase()}`);
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Length: ${htmlBody.length} chars`);

    try {
      if (this.provider === "sendgrid") {
        return await this.sendViaSendGrid(email, subject, htmlBody);
      } else if (this.provider === "gmail") {
        return await this.sendViaGmail(email, subject, htmlBody);
      } else {
        return await this.sendViaMock(email, subject, htmlBody);
      }
    } catch (error) {
      console.error("\n❌ EMAIL SENDING FAILED");
      console.error("─".repeat(50));
      console.error(`Error: ${error.message}`);
      console.error(`Code: ${error.code}`);
      
      // Log detailed error info
      if (error.response) {
        console.error("Response:", error.response);
      }
      if (error.status) {
        console.error("Status:", error.status);
      }
      
      throw error;
    }
  }

  async sendViaSendGrid(email, subject, htmlBody) {
    try {
      console.log("\n🔄 Attempting SendGrid...");
      
      const msg = {
        to: email,
        from: process.env.MAIL_USER || "noreply@shikshamitra.com",
        subject: subject,
        html: htmlBody,
      };

      const response = await this.sgMail.send(msg);
      
      console.log("✅ SendGrid: Email sent successfully!");
      console.log(`Message ID: ${response[0].headers["x-message-id"]}`);
      console.log("─".repeat(50) + "\n");
      
      return {
        success: true,
        provider: "sendgrid",
        messageId: response[0].headers["x-message-id"],
      };
    } catch (error) {
      console.error("❌ SendGrid Error:", error.message);
      throw error;
    }
  }

  async sendViaGmail(email, subject, htmlBody) {
    try {
      console.log("\n🔄 Attempting Gmail SMTP...");
      
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || "smtp.gmail.com",
        port: 587, // Try port 587 first (TLS) instead of 465 (SSL)
        secure: false, // Use TLS, not SSL
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        connectionTimeout: 5000,
        socketTimeout: 5000,
      });

      console.log("  - Transporter created (port 587 TLS)");
      
      // Verify connection
      try {
        await transporter.verify();
        console.log("  - Connection verified");
      } catch (verifyError) {
        console.warn(`  ⚠ Verification timeout: ${verifyError.message}`);
        console.log("  - Continuing with send attempt...");
      }

      // Send email
      const info = await transporter.sendMail({
        from: `"Shiksha Mitra" <${process.env.MAIL_USER}>`,
        to: email,
        subject: subject,
        html: htmlBody,
      });

      console.log("✅ Gmail: Email sent successfully!");
      console.log(`Message ID: ${info.messageId}`);
      console.log("─".repeat(50) + "\n");
      
      return {
        success: true,
        provider: "gmail",
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("❌ Gmail Error:", error.message);
      if (error.code === "ETIMEDOUT") {
        console.error("   Hint: Port 465/587 connection timeout - common on restricted networks like Render");
        console.error("   Solution: Use SendGrid API key instead");
      }
      throw error;
    }
  }

  async sendViaMock(email, subject, htmlBody) {
    console.log("\n🔄 Using MOCK Email Service (development/testing)...");
    console.log("  ⚠ Emails are NOT actually sent, only logged to console");
    console.log(`  To: ${email}`);
    console.log(`  Subject: ${subject}`);
    console.log("  Body preview:", htmlBody.substring(0, 100) + "...");
    console.log("✅ Mock: Email 'sent' successfully!");
    console.log("─".repeat(50) + "\n");

    return {
      success: true,
      provider: "mock",
      messageId: "mock-" + Date.now(),
    };
  }
}

// Create singleton instance
const emailService = new EmailService();

/**
 * Legacy mailSender function for backward compatibility
 */
const mailSender = async (email, title, body) => {
  try {
    const result = await emailService.sendEmail(email, title, body);
    return {
      messageId: result.messageId,
      response: result.provider,
    };
  } catch (error) {
    // Log error but don't throw - let caller decide
    console.error("mailSender caught error:", error.message);
    throw error;
  }
};

module.exports = mailSender;
module.exports.emailService = emailService;
