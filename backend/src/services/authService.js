const { User, Otp } = require('../models');
const Hasher = require('../utilities/hasher.js');
const jwt = require('jsonwebtoken');
const { sendOtp } = require('./otpService.js');

const registerUser = async (username, emailAddress, password, otp) => {
  const existingUser = await User.findOne({ where: { emailAddress } });
  if (existingUser) {
    throw new Error('Email address already registered.');
  }

  const otpRecord = await Otp.findOne({ where: { emailAddress } });
  if (!otpRecord) {
    throw new Error('Verification code not found. Please request a new OTP code.');
  }

  if (otpRecord.otp !== otp) {
    throw new Error('Invalid verification code.');
  }

  if (new Date() > otpRecord.expiresAt) {
    throw new Error('Verification code has expired. Please request a new one.');
  }

  const hashedPassword = await Hasher.generateHash(password);
  const user = await User.create({
    username,
    emailAddress,
    password: hashedPassword
  });

  await otpRecord.destroy();

  return {
    user: {
      id: user.id,
      username: user.username,
      emailAddress: user.emailAddress
    }
  };
};

const loginWithEmail = async (emailAddress, password) => {
  const user = await User.findOne({ where: { emailAddress } });
  if (!user || !(await Hasher.comparePassword(password, user.password))) {
    throw new Error('Invalid email or password.');
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      emailAddress: user.emailAddress
    },
    token
  };
};

module.exports = {
  sendOtp,
  registerUser,
  loginWithEmail
};
