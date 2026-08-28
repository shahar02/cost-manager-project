/**
 * app.js
 *
 * Configures the Express application for the logs microservice.
 */
const express = require('express');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, buildErrorResponse } = require('./middleware/errorHandler');
const logsRoutes = require('./routes/logs.routes');

const SERVICE_NAME = 'logs-service';

const app = express();

app.use(express.json());
app.use(requestLogger(SERVICE_NAME));

app.use('/api', logsRoutes);

app.use((req, res) => {
  res.status(404).json(buildErrorResponse('endpoint not found'));
});

app.use(errorHandler);

module.exports = app;
