const { createLogger, transports, format } = require("winston");
const { combine, timestamp, label, printf } = format;

const formatPrint = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} | ${level} | ${message}`;
});

const logger = createLogger({
  format: combine(
    timestamp({
      format: "HH:mm:ss",
    }),
    formatPrint
  ),
  transports: [new transports.Console()],
});

module.exports = logger;
