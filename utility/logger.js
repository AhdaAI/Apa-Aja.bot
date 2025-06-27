const { createLogger, transports, format } = require("winston");
const { combine, timestamp, label, printf } = format;

const formatPrint = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [ ${level} ] ${message}`;
});

const errorPrint = printf(({ level, message, label, timestamp, stack }) => {
  let formatted = [
    "\n=======================================================",
    "------------------------ ERROR ------------------------",
    "=======================================================",
    stack,
    "=======================================================",
    `---------------------- ${timestamp} -----------------------`,
    "=======================================================\n",
  ];
  return formatted.join("\n");
});

const logger = createLogger({
  transports: [
    new transports.Console({
      level: "info",
      format: combine(
        timestamp({
          format: "HH:mm:ss",
        }),
        formatPrint
      ),
    }),
    new transports.Console({
      level: "error",
      format: combine(
        timestamp({
          format: "HH:mm:ss",
        }),
        format.errors({ stack: true }),
        errorPrint
      ),
    }),
  ],
});

module.exports = logger;
