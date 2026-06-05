import { z } from 'zod';
import ApiError from '../utils/ApiError.js';

/**
 * Express middleware to validate request payload (body, query, params) against a Zod schema.
 * Reassigns the validated properties back to the request object to ensure strict typing.
 *
 * @param {object} schema - Zod schema containing body, query, or params keys
 * @returns {Function} Express middleware handler
 */
const validate = (schema) => (req, res, next) => {
  const validSchema = {};

  // Extract schemas matching incoming request parts
  if (schema.body) {
    validSchema.body = schema.body;
  }
  if (schema.query) {
    validSchema.query = schema.query;
  }
  if (schema.params) {
    validSchema.params = schema.params;
  }

  // Object representing the parts of the request to validate
  const objectToValidate = {};
  if (schema.body) {
    objectToValidate.body = req.body;
  }
  if (schema.query) {
    objectToValidate.query = req.query;
  }
  if (schema.params) {
    objectToValidate.params = req.params;
  }

  try {
    const zodObjectSchema = z.object(validSchema);
    const result = zodObjectSchema.safeParse(objectToValidate);

    if (!result.success) {
      // Format validation errors into a clean, developer-friendly list
      const errorDetails = result.error.errors.map((err) => ({
        field: err.path.slice(1).join('.'), // Remove top level 'body', 'query', etc.
        message: err.message,
      }));

      return next(new ApiError(400, 'Validation failed', errorDetails));
    }

    // Reassign validated/sanitized inputs back to express request object
    if (result.data.body) {
      req.body = result.data.body;
    }
    if (result.data.query) {
      req.query = result.data.query;
    }
    if (result.data.params) {
      req.params = result.data.params;
    }

    return next();
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

export default validate;
