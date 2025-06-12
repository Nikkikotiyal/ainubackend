const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
    ),
    transports: [
        new transports.File({ filename: 'server.log' }), // Logs to file
        new transports.Console() // Logs to console
    ]
});

module.exports = logger; // 🔹 Ensure logger is exported
