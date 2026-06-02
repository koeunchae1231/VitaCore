// backend/src/utils/createError.js
function createError(message, statusCode = 500, options = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code =
    options.code || (statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST");

  if (options.isHtmlResponse) {
    error.isHtmlResponse = true;
    error.html = options.html;
  }

  return error;
}

module.exports = createError;