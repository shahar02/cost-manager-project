/**
 * app.js
 *
 * Configures the Express application for the about microservice.
 * Kept separate from server.js so that tests can import the app
 * without actually starting an HTTP listener.
 */
const express = require('express');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, buildErrorResponse } = require('./middleware/errorHandler');
const aboutRoutes = require('./routes/about.routes');

// identifies this process in every log entry it writes
const SERVICE_NAME = 'about-service';

const app = express();

// parse incoming JSON request bodies before any route handler runs
app.use(express.json());
// record every single HTTP request this server receives, per the project spec
app.use(requestLogger(SERVICE_NAME));

// all of this service's endpoints live under /api
app.use('/api', aboutRoutes);

// any request to a path that doesn't exist gets a proper JSON error, not HTML
app.use((req, res) => {
  res.status(404).json(buildErrorResponse('endpoint not found'));
});

// centralised error handler; must be registered last
app.use(errorHandler);

module.exports = app;
