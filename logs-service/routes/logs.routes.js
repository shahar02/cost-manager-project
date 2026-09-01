/**
 * logs.routes.js
 *
 * Wires up the single endpoint this microservice is responsible for:
 * GET /api/logs - list all logs
 */
const express = require('express');
const listLogs = require('../controllers/listLogs.controller');
const endpointLogger = require('../middleware/endpointLogger');

const router = express.Router();

router.get('/logs', endpointLogger('logs-service'), listLogs);

module.exports = router;
