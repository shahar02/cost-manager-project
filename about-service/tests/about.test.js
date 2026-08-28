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
  // spin up a temporary, in-memory MongoDB so tests never touch real Atlas data
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  // set up fake team members for the test run
  process.env.TEAM_MEMBER_1_FIRST_NAME = 'mosh';
  process.env.TEAM_MEMBER_1_LAST_NAME = 'israeli';
  process.env.TEAM_MEMBER_2_FIRST_NAME = 'dana';
  process.env.TEAM_MEMBER_2_LAST_NAME = 'cohen';

  await mongoose.connect(process.env.MONGO_URI);

  // import the app only after MONGO_URI is set, so it connects to the fake DB
  app = require('../app');
});

afterAll(async () => {
  // tear down the in-memory database once all tests in this file are done
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /api/about', () => {
  it('returns only first_name and last_name for each team member', async () => {
    // send an actual HTTP request into the Express app, exactly like a real client
    const res = await request(app).get('/api/about');

    // response must exactly match the two team members configured above
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { first_name: 'mosh', last_name: 'israeli' },
      { first_name: 'dana', last_name: 'cohen' },
    ]);
  });

  it('never includes any property other than first_name/last_name', async () => {
    // repeat the same request, this time checking the shape of each object
    const res = await request(app).get('/api/about');

    // guard against accidentally leaking extra fields (e.g. an id) in the response
    res.body.forEach((member) => {
      expect(Object.keys(member).sort()).toEqual(['first_name', 'last_name']);
    });
  });
});
