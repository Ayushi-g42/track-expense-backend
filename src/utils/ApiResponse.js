/**
 * Standard API Response Format.
 * Used to send uniform JSON responses for successful API requests.
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (typically < 400)
   * @param {any} data - Response payload (object, array, string, etc.)
   * @param {string} message - Response message (default: "Success")
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export default ApiResponse;
