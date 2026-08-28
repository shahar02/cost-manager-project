/**
 * app.js
 *
 * Configures the Express application for the costs microservice.
 * Kept separate from server.js so that tests can import the app
 * without actually starting an HTTP listener.
 */
const express = require('express');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, buildErrorResponse } = require('./middleware/errorHandler');
const costsRoutes = require('./routes/costs.routes');

const SERVICE_NAME = 'costs-service';

const app = express();

app.use(express.json());
app.use(requestLogger(SERVICE_NAME));

app.use('/api', costsRoutes);

// any request to a path that doesn't exist gets a proper JSON error, not HTML
app.use((req, res) => {
  res.status(404).json(buildErrorResponse('endpoint not found'));
});

app.use(errorHandler);

module.exports = app;
