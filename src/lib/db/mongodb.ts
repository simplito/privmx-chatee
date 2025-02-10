import { MONGODB_URI, REPLICA_SET } from '@/shared/utils/env';
import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = MONGODB_URI;
const options: MongoClientOptions = {
    replicaSet: REPLICA_SET
};

console.log({uri})


let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    try {
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
    }catch(e){
       console.error(`[ERROR] MongoDB connection to: ${MONGODB_URI} failed`);
       console.error(e);
    }

}

export default clientPromise;
