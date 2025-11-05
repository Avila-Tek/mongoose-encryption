import mongoose from 'mongoose';
import { Database } from '../Database';

jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn());

const database = new Database();

beforeAll(async () => {
  await database.connect();
});

afterAll(async () => {
  await database.close();
});

describe('Database connected', () => {
  it('In-Memory database connection', async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});
