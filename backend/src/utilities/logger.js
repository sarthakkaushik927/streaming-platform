const winston = require('winston');
const moment = require('moment-timezone');

const transports = [new winston.transports.Console()];

// Vercel functions have a read-only disk, so they only log to the console.
if (!process.env.VERCEL) {
  require('winston-daily-rotate-file');
  transports.push(new winston.transports.DailyRotateFile({
    dirname: 'watch-party-logs',
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '60d'
  }));
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.printf(({ level, message }) => {
      const timestamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss.SSS');
      return `${timestamp}, [${level.toUpperCase()}], ${message}`;
    })
  ),
  transports
});

module.exports = logger;
