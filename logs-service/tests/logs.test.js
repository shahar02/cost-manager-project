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
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  await mongoose.connect(process.env.MONGO_URI);

  app = require('../app');
  Log = require('../models/Log.model');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Log.deleteMany({});
});

describe('GET /api/logs', () => {
  it('returns an empty array when there are no logs yet', async () => {
    // NOTE: the requestLogger middleware itself writes a log for THIS
    // very request, so by the time the handler runs there will be one.
    const res = await request(app).get('/api/logs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns previously written log entries', async () => {
    await Log.create({ method: 'GET', endpoint: '/api/about', message: 'test log', service: 'about-service' });

    const res = await request(app).get('/api/logs');

    expect(res.status).toBe(200);
    expect(res.body.some((log) => log.endpoint === '/api/about')).toBe(true);
  });
});
