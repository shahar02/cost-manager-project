/**
 * costs.test.js
 *
 * Unit tests for the costs microservice endpoints, using an in-memory
 * MongoDB instance so the tests do not touch the real Atlas database.
 */
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

// shared across all tests in this file, assigned once in beforeAll
let mongoServer;
let app;
let User;
let Cost;
let Report;

beforeAll(async () => {
  // spin up a temporary, in-memory MongoDB so tests never touch real Atlas data
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  await mongoose.connect(process.env.MONGO_URI);

  // import the app and models only after MONGO_URI is set
  app = require('../app');
  User = require('../models/User.model');
  Cost = require('../models/Cost.model');
  Report = require('../models/Report.model');
});

afterAll(async () => {
  // tear down the in-memory database once all tests in this file are done
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Cost.deleteMany({});
  await Report.deleteMany({});
  // create the test user that costs will be attached to
  await User.create({ id: 123123, first_name: 'mosh', last_name: 'israeli', birthday: new Date('1990-01-01') });
});

describe('POST /api/add', () => {
  it('adds a valid cost item and returns it', async () => {
    // send an actual HTTP request into the Express app, exactly like a real client
    const res = await request(app).post('/api/add').send({
      userid: 123123,
      description: 'milk',
      category: 'food',
      sum: 8,
    });

    // the response body should mirror exactly what was sent and stored
    expect(res.status).toBe(201);
    expect(res.body.description).toBe('milk');
    expect(res.body.category).toBe('food');
    expect(res.body.userid).toBe(123123);
    expect(res.body.sum).toBe(8);
  });

  it('rejects a cost item for a non-existent user', async () => {
    // userid 999999 was never created in beforeEach, so this must fail
    const res = await request(app).post('/api/add').send({
      userid: 999999,
      description: 'milk',
      category: 'food',
      sum: 8,
    });

    // per the project spec, the error JSON must include id and message
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });

  it('rejects an invalid category', async () => {
    // "not-a-real-category" is outside the five allowed values
    const res = await request(app).post('/api/add').send({
      userid: 123123,
      description: 'milk',
      category: 'not-a-real-category',
      sum: 8,
    });

    // an invalid category must be rejected before anything is saved
    expect(res.status).toBe(400);
  });
});

describe('GET /api/report', () => {
  // this suite also exercises the Computed Design Pattern caching behaviour
  it('returns all five categories even with no cost items', async () => {
    // no costs were added for this month, so every category should be an empty array
    const res = await request(app).get('/api/report').query({ id: 123123, year: 2026, month: 5 });

    expect(res.status).toBe(200);
    expect(res.body.userid).toBe(123123);
    const categoryNames = res.body.costs.map((entry) => Object.keys(entry)[0]);
    expect(categoryNames).toEqual(expect.arrayContaining(['food', 'health', 'housing', 'sports', 'education']));
  });

  it('groups an added cost item under the correct category', async () => {
    // add one "food" cost dated inside May 2026, then request that month's report
    await request(app).post('/api/add').send({
      userid: 123123,
      description: 'choco',
      category: 'food',
      sum: 12,
      created_at: new Date(2026, 4, 17), // May 17, 2026
    });

    // now fetch May 2026's report and confirm the item landed correctly
    const res = await request(app).get('/api/report').query({ id: 123123, year: 2026, month: 5 });

    // the item must appear under "food" with the correct day-of-month
    const foodEntry = res.body.costs.find((entry) => 'food' in entry);
    expect(foodEntry.food).toHaveLength(1);
    expect(foodEntry.food[0]).toMatchObject({ sum: 12, description: 'choco', day: 17 });
  });

  it('caches a past month report using the Computed Design Pattern', async () => {
    // add a cost dated well in the past (January 2020)
    await request(app).post('/api/add').send({
      userid: 123123,
      description: 'old book',
      category: 'education',
      sum: 50,
      created_at: new Date(2020, 0, 10),
    });

    // first request computes and stores the report
    const firstRes = await request(app).get('/api/report').query({ id: 123123, year: 2020, month: 1 });
    expect(firstRes.status).toBe(200);

    // a document should now exist in the "reports" cache collection
    const stored = await Report.findOne({ userid: 123123, year: 2020, month: 1 });
    expect(stored).not.toBeNull();

    // delete the underlying cost - a correctly cached report should be unaffected
    await Cost.deleteMany({});

    // the second request must still return the cached data, proving it never
    // touched the (now-empty) "costs" collection again
    const secondRes = await request(app).get('/api/report').query({ id: 123123, year: 2020, month: 1 });
    const educationEntry = secondRes.body.costs.find((entry) => 'education' in entry);
    expect(educationEntry.education).toHaveLength(1);
  });
});
