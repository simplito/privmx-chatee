'use server';

import { createCloudContext } from '@/lib/endpoint-api/utils';
import clientPromise from '../mongodb';
import { User } from '../users/users';
import { ClientSession } from 'mongodb';

export interface Domain {
    name: string;
    contextId: string;
}

const collectionName = 'domains';

export async function getDatabase() {
    const mongoClient = await clientPromise;
    const db = mongoClient.db('Chatee');

    return db;
}

export async function getCollection() {
    const mongoClient = await clientPromise;
    const db = mongoClient.db('Chatee');
    const collection = db.collection<Domain>(collectionName);

    return collection;
}

export async function createDomain(name: string, session: ClientSession) {
    const db = await getDatabase();

    const collection = db.collection<Domain>(collectionName);
    const result = await db.createCollection<User>(`domain-${name}`, { session });
    const contextId = await createCloudContext(name);

    await collection.insertOne(
        {
            name,
            contextId
        },
        { session }
    );

    return result;
}

export async function getDomainNames() {
    const collection = await getCollection();

    const collections = await collection.find().toArray();

    const collectionNames = collections.map((collection) => collection.name);

    return collectionNames;
}

export async function getContextIdByDomainName(name: string, session?: ClientSession) {
    const collection = await getCollection();
    const domain = await collection.findOne({ name }, { session });

    return domain.contextId;
}

export async function getDomainByName(name: string) {
    const collection = await getCollection();
    const domain = await collection.findOne({ name });

    return domain;
}
