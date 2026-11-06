const { User, Otp } = require('../models');
const emailService = require('./emailService.js');

const OTP_LIFETIME_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

const sendOtp = async (emailAddress) => {
  const existingUser = await User.findOne({ where: { emailAddress } });
  if (existingUser) {
    throw new Error('Email address already registered.');
  }

  // Stored in the database so the limit holds across serverless instances.
  const previous = await Otp.findOne({ where: { emailAddress } });
  if (previous && Date.now() - new Date(previous.created_at).getTime() < RESEND_COOLDOWN_MS) {
    const error = new Error('Please wait a moment before requesting another code.');
    error.status = 429;
    throw error;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + OTP_LIFETIME_MS);

  await Otp.destroy({ where: { emailAddress } });
  await Otp.create({ emailAddress, otp, expiresAt });

  try {
    await emailService.sendOtpEmail(emailAddress, otp);
  } catch (error) {
    // Let the user retry straight away if the email never went out.
    await Otp.destroy({ where: { emailAddress } });
    throw error;
  }

  return { emailAddress };
};

module.exports = { sendOtp };
