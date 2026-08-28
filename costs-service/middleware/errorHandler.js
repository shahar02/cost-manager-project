/**
 * errorHandler.js
 *
 * A small helper for building consistent error responses.
 * Every error JSON document returned by any endpoint includes,
 * at minimum, an "id" and a "message" property, as required.
 */
let errorCounter = 0;

function buildErrorResponse(message) {
  errorCounter += 1;
  return {
    id: errorCounter,
    message,
  };
}

/**
 * Express error-handling middleware (must be registered last, after all routes).
 * Any error passed to next(err) ends up here.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  res.status(status).json(buildErrorResponse(err.message || 'Internal server error'));
}

module.exports = { buildErrorResponse, errorHandler };
