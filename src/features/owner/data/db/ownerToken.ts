'use server';

import clientPromise from '@/lib/db/mongodb';
import { ClientSession } from 'mongodb';

export interface OwnerToken {
    token: string;
    disabled: boolean;
}

async function getCollection() {
    const mongoClient = await clientPromise;
    const db = mongoClient.db('Chatee');
    const collection = db.collection<OwnerToken>(`owner`);

    return collection;
}

export async function createNewOwnerToken(token: string, session?: ClientSession) {
    const coll = await getCollection();
    await coll.insertOne({ disabled: false, token }, { session });
}

export async function updateOwnerToken(token: string, disabled: boolean, session?: ClientSession) {
    const coll = await getCollection();
    await coll.updateOne(
        { token: token },
        {
            $set: {
                disabled
            }
        },
        { session }
    );
}

export async function getAllActiveTokens() {
    const coll = await getCollection();
    const foundTokens = await coll.find({ disabled: false }).toArray();

    return foundTokens;
}
