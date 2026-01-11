/**
 * Custom Error Class untuk API
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wrapper untuk async route handlers
 * Menangkap error dan meneruskan ke error handler middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Axios errors (dari scraping)
  if (err.isAxiosError) {
    statusCode = err.response?.status || 500;
    message = err.response?.statusText || err.message;

    console.error(`[AXIOS ERROR] ${req.method} ${req.originalUrl}`, {
      message: err.message,
      status: err.response?.status,
      url: err.config?.url,
    });
  } else {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  // Response ke client
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err.details,
    }),
  });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} tidak ditemukan`);
  next(error);
};

module.exports = {
  ApiError,
  asyncHandler,
  errorHandler,
  notFoundHandler,
};
