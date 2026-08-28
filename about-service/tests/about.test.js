/**
 * about.test.js
 *
 * Unit tests for the about microservice endpoint, using an in-memory
 * MongoDB instance (needed because the requestLogger middleware still
 * writes a log entry for every request, even though /api/about itself
 * does not touch the database).
 */
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  // set up fake team members for the test run
  process.env.TEAM_MEMBER_1_FIRST_NAME = 'mosh';
  process.env.TEAM_MEMBER_1_LAST_NAME = 'israeli';
  process.env.TEAM_MEMBER_2_FIRST_NAME = 'dana';
  process.env.TEAM_MEMBER_2_LAST_NAME = 'cohen';

  await mongoose.connect(process.env.MONGO_URI);

  app = require('../app');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /api/about', () => {
  it('returns only first_name and last_name for each team member', async () => {
    const res = await request(app).get('/api/about');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { first_name: 'mosh', last_name: 'israeli' },
      { first_name: 'dana', last_name: 'cohen' },
    ]);
  });

  it('never includes any property other than first_name/last_name', async () => {
    const res = await request(app).get('/api/about');

    res.body.forEach((member) => {
      expect(Object.keys(member).sort()).toEqual(['first_name', 'last_name']);
    });
  });
});
