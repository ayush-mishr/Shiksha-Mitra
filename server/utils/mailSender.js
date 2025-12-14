/**
 * Deprecated: Use emailService.js instead
 * This file kept for backward compatibility
 */

const { emailService } = require("./emailService");

const mailSender = async (email, title, body) => {
  try {
    const result = await emailService.sendEmail(email, title, body);
    return {
      messageId: result.messageId,
      response: result.provider,
    };
  } catch (error) {
    console.error("mailSender error:", error.message);
    throw error;
  }
};

module.exports = mailSender;
