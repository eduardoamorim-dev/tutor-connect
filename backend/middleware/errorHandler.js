const logger = require("../config/logger");

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Algo deu errado!";

  if (!err.isOperational) {
    logger.error("Erro não tratado:", { error: err.stack });
  }

  res.status(statusCode).json({ error: message });
};

module.exports = { AppError, asyncHandler, errorHandler };
