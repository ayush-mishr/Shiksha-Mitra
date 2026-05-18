const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email
    const user = await User.findOne({ email: email })
    if (!user) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
      })
    }
    const token = Math.floor(100000 + Math.random() * 900000).toString()

    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 300000,
      },
      { new: true }
    )
    console.log("DETAILS", updatedDetails)

    await mailSender(
      email,
      "Shiksha Mitra - Password Reset OTP",
      `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2c5364;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your Shiksha Mitra account.</p>
        <p>Please use the following 6-digit One-Time Password (OTP) to reset your password:</p>
        <div style="background-color: #1a1a1a; padding: 15px; font-size: 28px; font-weight: bold; letter-spacing: 6px; text-align: center; border-radius: 8px; margin: 20px 0; color: #FFD60A;">
          ${token}
        </div>
        <p>This OTP is valid for the next 5 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999;">Best regards,<br/>Shiksha Mitra Team</p>
      </div>
      `
    )

    res.json({
      success: true,
      message:
        "OTP Sent Successfully, Please Check Your Email to Continue Further",
    })
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Sending the Reset Message`,
    })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body

    if (confirmPassword !== password) {
      return res.json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      })
    }
    const userDetails = await User.findOne({ token: token })
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is Invalid",
      })
    }
    if (!(userDetails.resetPasswordExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: `Token is Expired, Please Regenerate Your Token`,
      })
    }
    const encryptedPassword = await bcrypt.hash(password, 10)
    await User.findOneAndUpdate(
      { token: token },
      { password: encryptedPassword },
      { new: true }
    )
    res.json({
      success: true,
      message: `Password Reset Successful`,
    })
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Updating the Password`,
    })
  }
}
