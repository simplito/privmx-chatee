import { MONGODB_URI, REPLICA_SET } from '@/shared/utils/env';
import { Db, MongoClient, MongoClientOptions } from 'mongodb';

// const uri = MONGODB_URI;
// const options: MongoClientOptions = {
//     replicaSet: REPLICA_SET
// };
//
// console.log({uri})
//
//
// let client;
// let clientPromise: Promise<MongoClient>;

// if (process.env.NODE_ENV === 'development') {
//     let globalWithMongo = global as typeof globalThis & {
//         _mongoClientPromise?: Promise<MongoClient>;
//     };
//
//     if (!globalWithMongo._mongoClientPromise) {
//         client = new MongoClient(uri, options);
//         globalWithMongo._mongoClientPromise = client.connect();
//     }
//     clientPromise = globalWithMongo._mongoClientPromise;
// } else {
//     try {
//         client = new MongoClient(uri, options);
//         clientPromise = client.connect();
//     }catch(e){
//        console.error(`[ERROR] MongoDB connection to: ${MONGODB_URI} failed`);
//        console.error(e);
//     }
//
// }

const uri = MONGODB_URI || "mongodb://user:password@host:port/database?replicaSet=myReplicaSet"; // Fallback for development

console.log(uri)
let dbClient:MongoClient; // Store the MongoClient instance

async function connectToDatabase() {
    try {
        if (!dbClient) { // Only create a new connection if one doesn't exist
            dbClient = new MongoClient(uri);
            await dbClient.connect();
            console.log("Connected to MongoDB");
        } else {
            console.log("Reusing existing MongoDB connection")
        }
        return dbClient; // Return the database object

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error; // Re-throw the error for handling elsewhere
    }
}


async function closeDatabaseConnection() {
    if (dbClient) {
        try {
            await dbClient.close();
            console.log("MongoDB connection closed.");
            dbClient = null;
        } catch (err) {
            console.error("Error closing MongoDB connection:", err);
        }
    }
}

process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await closeDatabaseConnection();
    process.exit(0);
});

// export default clientPromise;

export { connectToDatabase, closeDatabaseConnection };