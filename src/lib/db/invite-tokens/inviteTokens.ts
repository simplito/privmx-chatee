'use server';

import { ClientSession, Filter, UpdateFilter } from 'mongodb';
import clientPromise from '../mongodb';
import { generateInviteToken } from './utils';
export interface InviteToken {
    value: string;
    creationDate: number;
    isStaff: boolean;
    isUsed: boolean;
    domain: string;
}

const collectionName = 'InviteTokens';

async function getCollection() {
    const mongoClient = await clientPromise;
    const db = mongoClient.db('Chatee');
    const collection = db.collection<InviteToken>(collectionName);

    return collection;
}

export async function createInviteToken(isStaff: boolean, domain: string, session?: ClientSession) {
    const collection = await getCollection();
    const token = generateInviteToken(isStaff, domain);
    const id = await collection.insertOne({ ...token }, { session });

    if (id) {
        return token;
    }

    throw new Error('Error creating invite token');
}

export async function getInviteTokenByValue(tokenValue: string) {
    const collection = await getCollection();
    const token = await collection.findOne({ value: tokenValue });

    return token;
}

export async function updateInviteToken(
    filterCriteria: Filter<InviteToken>,
    updateValues: UpdateFilter<InviteToken>
) {
    const collection = await getCollection();
    const result = await collection.updateOne(filterCriteria, updateValues);

    return result.modifiedCount;
}

export async function expireInviteToken(token: string, session?: ClientSession) {
    const collection = await getCollection();
    const result = await collection.updateOne(
        {
            value: token
        },
        {
            $set: {
                isUsed: true
            }
        },
        { session }
    );

    return result.modifiedCount;
}
