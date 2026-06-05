/**
 * Higher-order function to wrap asynchronous Express route handlers.
 * Resolves the handler promise and automatically forwards errors to the next middleware.
 *
 * @param {Function} requestHandler - Asynchronous Express route handler (req, res, next)
 * @returns {Function} Express middleware handler
 */
const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
};

export default asyncHandler;
