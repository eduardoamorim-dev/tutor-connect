const logger = require("../config/logger");

const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
    };

    if (res.statusCode >= 400) {
      logger.warn("HTTP Request", logData);
    } else {
      logger.http("HTTP Request", logData);
    }
  });

  next();
};

module.exports = httpLogger;
