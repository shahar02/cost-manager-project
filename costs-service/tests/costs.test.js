/**
 * costs.test.js
 *
 * Unit tests for the costs microservice endpoints, using an in-memory
 * MongoDB instance so the tests do not touch the real Atlas database.
 */
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let User;
let Cost;
let Report;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  await mongoose.connect(process.env.MONGO_URI);

  app = require('../app');
  User = require('../models/User.model');
  Cost = require('../models/Cost.model');
  Report = require('../models/Report.model');
});

afterAll(async () => {
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
    const res = await request(app).post('/api/add').send({
      userid: 123123,
      description: 'milk',
      category: 'food',
      sum: 8,
    });

    expect(res.status).toBe(201);
    expect(res.body.description).toBe('milk');
    expect(res.body.category).toBe('food');
    expect(res.body.userid).toBe(123123);
    expect(res.body.sum).toBe(8);
  });

  it('rejects a cost item for a non-existent user', async () => {
    const res = await request(app).post('/api/add').send({
      userid: 999999,
      description: 'milk',
      category: 'food',
      sum: 8,
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });

  it('rejects an invalid category', async () => {
    const res = await request(app).post('/api/add').send({
      userid: 123123,
      description: 'milk',
      category: 'not-a-real-category',
      sum: 8,
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/report', () => {
  it('returns all five categories even with no cost items', async () => {
    const res = await request(app).get('/api/report').query({ id: 123123, year: 2026, month: 5 });

    expect(res.status).toBe(200);
    expect(res.body.userid).toBe(123123);
    const categoryNames = res.body.costs.map((entry) => Object.keys(entry)[0]);
    expect(categoryNames).toEqual(expect.arrayContaining(['food', 'health', 'housing', 'sports', 'education']));
  });

  it('groups an added cost item under the correct category', async () => {
    await request(app).post('/api/add').send({
      userid: 123123,
      description: 'choco',
      category: 'food',
      sum: 12,
      created_at: new Date(2026, 4, 17), // May 17, 2026
    });

    const res = await request(app).get('/api/report').query({ id: 123123, year: 2026, month: 5 });

    const foodEntry = res.body.costs.find((entry) => 'food' in entry);
    expect(foodEntry.food).toHaveLength(1);
    expect(foodEntry.food[0]).toMatchObject({ sum: 12, description: 'choco', day: 17 });
  });

  it('caches a past month report using the Computed Design Pattern', async () => {
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

    const stored = await Report.findOne({ userid: 123123, year: 2020, month: 1 });
    expect(stored).not.toBeNull();

    // delete the underlying cost - a correctly cached report should be unaffected
    await Cost.deleteMany({});

    const secondRes = await request(app).get('/api/report').query({ id: 123123, year: 2020, month: 1 });
    const educationEntry = secondRes.body.costs.find((entry) => 'education' in entry);
    expect(educationEntry.education).toHaveLength(1);
  });
});
