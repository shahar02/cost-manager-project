/**
 * users.test.js
 *
 * Unit tests for the users microservice endpoints, using an in-memory
 * MongoDB instance.
 */
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

// shared across all tests in this file, assigned once in beforeAll
let mongoServer;
let app;
let User;
let Cost;

beforeAll(async () => {
  // spin up a temporary, in-memory MongoDB so tests never touch real Atlas data
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  await mongoose.connect(process.env.MONGO_URI);

  // import the app and models only after MONGO_URI is set
  app = require('../app');
  User = require('../models/User.model');
  Cost = require('../models/Cost.model');
});

afterAll(async () => {
  // tear down the in-memory database once all tests in this file are done
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // start every test with empty collections so tests cannot interfere with each other
  await User.deleteMany({});
  await Cost.deleteMany({});
});

describe('POST /api/add', () => {
  it('adds a valid user', async () => {
    // send an actual HTTP request into the Express app, exactly like a real client
    const res = await request(app).post('/api/add').send({
      id: 123123,
      first_name: 'mosh',
      last_name: 'israeli',
      birthday: '1990-01-01',
    });

    // the response should confirm the exact user that was created
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(123123);
    expect(res.body.first_name).toBe('mosh');
  });

  it('rejects a duplicate user id', async () => {
    // seed a user directly in the DB, then try to add the same id again
    await User.create({ id: 123123, first_name: 'mosh', last_name: 'israeli', birthday: new Date('1990-01-01') });

    const res = await request(app).post('/api/add').send({
      id: 123123,
      first_name: 'other',
      last_name: 'name',
      birthday: '1991-01-01',
    });

    // per the project spec, the error JSON must include id and message
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });
});

describe('GET /api/users', () => {
  it('returns all users', async () => {
    // seed two users directly, then confirm the endpoint returns both
    await User.create({ id: 1, first_name: 'a', last_name: 'b', birthday: new Date('2000-01-01') });
    await User.create({ id: 2, first_name: 'c', last_name: 'd', birthday: new Date('2000-01-01') });

    const res = await request(app).get('/api/users');

    // both seeded users should come back in the response array
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /api/users/:id', () => {
  it('returns user details with the correct total', async () => {
    // one user with two cost items - total should equal their sum (10 + 5)
    await User.create({ id: 123123, first_name: 'mosh', last_name: 'israeli', birthday: new Date('1990-01-01') });
    await Cost.create({ userid: 123123, description: 'a', category: 'food', sum: 10 });
    await Cost.create({ userid: 123123, description: 'b', category: 'food', sum: 5 });

    const res = await request(app).get('/api/users/123123');

    // total must equal the sum of both cost items (10 + 5)
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ first_name: 'mosh', last_name: 'israeli', id: 123123, total: 15 });
  });

  it('returns an error for a non-existent user', async () => {
    // no user with this id was ever created, so the server must reply 404
    const res = await request(app).get('/api/users/999999');
    expect(res.status).toBe(404);
  });
});
