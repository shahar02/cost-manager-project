/**
 * logs.test.js
 *
 * Unit tests for the logs microservice endpoint, using an in-memory
 * MongoDB instance.
 */
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let Log;

beforeAll(async () => {
  // spin up a temporary, in-memory MongoDB so tests never touch real Atlas data
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  await mongoose.connect(process.env.MONGO_URI);

  // import the app and model only after MONGO_URI is set
  app = require('../app');
  Log = require('../models/Log.model');
});

afterAll(async () => {
  // tear down the in-memory database once all tests in this file are done
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // start every test with an empty "logs" collection
  await Log.deleteMany({});
});

describe('GET /api/logs', () => {
  it('writes both the request and endpoint-access log entries', async () => {
    const res = await request(app).get('/api/logs');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((entry) => entry.message)).toEqual(
      expect.arrayContaining(['GET /api/logs', 'endpoint accessed: GET /api/logs'])
    );
  });

  it('returns previously written log entries', async () => {
    // seed one log entry directly, then confirm the endpoint returns it
    await Log.create({ method: 'GET', endpoint: '/api/about', message: 'test log', service: 'about-service' });

    const res = await request(app).get('/api/logs');

    expect(res.status).toBe(200);
    expect(res.body.some((log) => log.endpoint === '/api/about')).toBe(true);
  });
});
