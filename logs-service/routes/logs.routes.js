/**
 * logs.routes.js
 *
 * Wires up the single endpoint this microservice is responsible for:
 * GET /api/logs - list all logs
 */
const express = require('express');
const listLogs = require('../controllers/listLogs.controller');

const router = express.Router();

router.get('/logs', listLogs);

module.exports = router;
