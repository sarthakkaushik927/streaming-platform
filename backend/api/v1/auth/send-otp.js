// Vercel function for sending signup codes. Everything else in the backend runs on Render,
// and both share one database, so Render can verify the code at signup.
const { sendOtp } = require('../../../src/services/otpService.js');
const { sendOtpSchema } = require('../../../src/validations/auth.validation.js');
const logger = require('../../../src/utilities/logger.js');

const allowedOrigins = ['http://localhost:5173', process.env.CORS_ORIGIN].filter(Boolean);

module.exports = async (req, res) => {
  const { origin } = req.headers;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const { error: invalid } = sendOtpSchema.validate(req.body);
  if (invalid) {
    return res.status(406).json({ success: false, message: invalid.details[0].message });
  }

  try {
    const result = await sendOtp(req.body.emailAddress);
    return res.status(200).json({ success: true, message: 'Verification OTP sent successfully.', data: result });
  } catch (error) {
    logger.error(`"send-otp.js","handler","Error: ${error.message}"`);
    return res.status(error.status || 400).json({ success: false, message: error.message });
  }
};
