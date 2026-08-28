/**
 * users.test.js
 *
 * Unit tests for the users microservice endpoints, using an in-memory
 * MongoDB instance.
 */
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let User;
let Cost;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();

  await mongoose.connect(process.env.MONGO_URI);

  app = require('../app');
  User = require('../models/User.model');
  Cost = require('../models/Cost.model');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Cost.deleteMany({});
});

describe('POST /api/add', () => {
  it('adds a valid user', async () => {
    const res = await request(app).post('/api/add').send({
      id: 123123,
      first_name: 'mosh',
      last_name: 'israeli',
      birthday: '1990-01-01',
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(123123);
    expect(res.body.first_name).toBe('mosh');
  });

  it('rejects a duplicate user id', async () => {
    await User.create({ id: 123123, first_name: 'mosh', last_name: 'israeli', birthday: new Date('1990-01-01') });

    const res = await request(app).post('/api/add').send({
      id: 123123,
      first_name: 'other',
      last_name: 'name',
      birthday: '1991-01-01',
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });
});

describe('GET /api/users', () => {
  it('returns all users', async () => {
    await User.create({ id: 1, first_name: 'a', last_name: 'b', birthday: new Date('2000-01-01') });
    await User.create({ id: 2, first_name: 'c', last_name: 'd', birthday: new Date('2000-01-01') });

    const res = await request(app).get('/api/users');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /api/users/:id', () => {
  it('returns user details with the correct total', async () => {
    await User.create({ id: 123123, first_name: 'mosh', last_name: 'israeli', birthday: new Date('1990-01-01') });
    await Cost.create({ userid: 123123, description: 'a', category: 'food', sum: 10 });
    await Cost.create({ userid: 123123, description: 'b', category: 'food', sum: 5 });

    const res = await request(app).get('/api/users/123123');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ first_name: 'mosh', last_name: 'israeli', id: 123123, total: 15 });
  });

  it('returns an error for a non-existent user', async () => {
    const res = await request(app).get('/api/users/999999');
    expect(res.status).toBe(404);
  });
});
