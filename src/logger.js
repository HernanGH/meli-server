const { createLogger, format, transports } = require('winston');

const {
  combine, timestamp, prettyPrint,
} = format;
const logger = createLogger({
  format: combine(
    timestamp(),
    prettyPrint(),
  ),
  transports: [
    new (transports.Console)({
      timestamp: true,
      colorize: true,
      level: 'debug',
    }),
  ],
});
module.exports = logger;
