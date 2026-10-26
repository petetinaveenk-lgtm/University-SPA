/**
 * Centralized error handler middleware
 */
function errorHandler(err, req, res, next) {
  // Log error internally for debugging
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    status,
    message: status === 500 && process.env.NODE_ENV === 'production' 
      ? 'An unexpected server error occurred' 
      : message,
    errors: err.errors || null
  });
}

/**
 * 404 Route Not Found middleware
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    status: 404,
    message: `API endpoint '${req.method} ${req.originalUrl}' was not found.`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
