import { MongoClient } from 'mongodb';

declare global {
    // eslint-disable-next-line no-unused-vars
    var _mongoClientPromise: Promise<MongoClient>;
}
