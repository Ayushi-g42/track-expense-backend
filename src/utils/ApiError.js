/**
 * Custom Error Class for API Operational Errors.
 * Used to throw formatted errors with HTTP status codes and detailed validation lists.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 404, 500)
   * @param {string} message - Error description message
   * @param {Array} errors - Detailed list of validation errors or metadata
   * @param {string} stack - Optional stack trace override
   */
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null; // matching standards
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
