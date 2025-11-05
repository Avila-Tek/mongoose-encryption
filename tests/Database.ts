import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export class Database {
  private mongoMemoryServer: MongoMemoryServer | null = null;

  async connect() {
    this.mongoMemoryServer = await MongoMemoryServer.create();
    const url = this.mongoMemoryServer.getUri();
    return mongoose.connect(url);
  }

  async close() {
    if (!this.mongoMemoryServer) return;

    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await this.mongoMemoryServer.stop();
  }

  async clearDatabase() {
    const { collections } = mongoose.connection;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
}
