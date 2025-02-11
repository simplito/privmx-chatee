import { MONGODB_URI  } from '@/shared/utils/env';
import {MongoClient, } from 'mongodb';

const uri = MONGODB_URI || "mongodb://127.0.0.1:27017/Chatee?replicaSet=rs0"; // Fallback for development

let dbClient:MongoClient;

async function connectToDatabase() {
    try {
        if (!dbClient) { // Only create a new connection if one doesn't exist
            dbClient = new MongoClient(uri,{replicaSet:"rs0",});
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

export { connectToDatabase, closeDatabaseConnection };