/**
 * users.routes.js
 *
 * Wires up the three endpoints this microservice is responsible for:
 * POST /api/add        - add a new user
 * GET  /api/users       - list all users
 * GET  /api/users/:id   - get one user's details + total costs
 */
const express = require('express');
const addUser = require('../controllers/addUser.controller');
const listUsers = require('../controllers/listUsers.controller');
const getUser = require('../controllers/getUser.controller');
const endpointLogger = require('../middleware/endpointLogger');

const router = express.Router();

// order does not matter here since each path is distinct
router.post('/add', endpointLogger('users-service'), addUser);
router.get('/users', endpointLogger('users-service'), listUsers);
router.get('/users/:id', endpointLogger('users-service'), getUser);

module.exports = router;
