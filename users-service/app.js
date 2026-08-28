/**
 * app.js
 *
 * Configures the Express application for the users microservice.
 */
const express = require('express');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, buildErrorResponse } = require('./middleware/errorHandler');
const usersRoutes = require('./routes/users.routes');

const SERVICE_NAME = 'users-service';

const app = express();

app.use(express.json());
app.use(requestLogger(SERVICE_NAME));

app.use('/api', usersRoutes);

app.use((req, res) => {
  res.status(404).json(buildErrorResponse('endpoint not found'));
});

app.use(errorHandler);

module.exports = app;
