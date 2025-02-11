'use server';

import { ClientSession, Filter, UpdateFilter } from 'mongodb';
import { connectToDatabase } from '../mongodb';
import { generateInviteToken } from './utils';

export interface InviteToken {
    value: string;
    hashedValue: string; // salt.hash
    creationDate: number;
    isStaff: boolean;
    isUsed: boolean;
}

export interface InviteTokenDbDTO extends Omit<InviteToken, 'value'> {}

export interface InviteTokenClientDTO extends Omit<InviteToken, 'hashedValue'> {}

const collectionName = 'InviteTokens';

async function getCollection() {
    try {
        const mongoClient = await connectToDatabase();
        const collection = await mongoClient.db().collection<InviteTokenDbDTO>(collectionName);
        return collection;
    }catch (e){
       console.error(collectionName);
       console.error(e.message);
    }


}

export async function createInviteToken(
    isStaff: boolean,
    session?: ClientSession
): Promise<InviteTokenClientDTO> {
    const collection = await getCollection();
    const { value, hashedValue, ...token } = await generateInviteToken(isStaff);
    const id = await collection.insertOne({ hashedValue, ...token }, { session });

    if (id) {
        return { value, ...token };
    }

    throw new Error('Error creating invite token');
}

export async function getInviteTokenByValue(tokenValue: string) {
    const collection = await getCollection();
    const token = await collection.findOne({ value: tokenValue });

    return token;
}

export async function getActiveInviteTokens() {

    try {
        const collection = await getCollection();
        const maxCreationDate = Date.now() - 1000 * 60 * 60 * 24 * 7;
        const token = await collection
            .find({ isUsed: false, creationDate: { $gte: maxCreationDate } })
            .toArray();
        return token;
    }catch (e){
        console.error("getActive");
        console.error(e.message);
    }
}

export async function updateInviteToken(
    filterCriteria: Filter<InviteTokenDbDTO>,
    updateValues: UpdateFilter<InviteTokenDbDTO>
) {
    const collection = await getCollection();
    const result = await collection.updateOne(filterCriteria, updateValues);

    return result.modifiedCount;
}

export async function expireInviteToken(token: string, session?: ClientSession) {
    const collection = await getCollection();
    const result = await collection.updateOne(
        {
            hashedValue: token
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

export async function mutateInviteToken(
    filter: Filter<InviteToken>,
    updateValues: InviteTokenDbDTO
) {
    const collection = await getCollection();
    const result = await collection.replaceOne(filter as any, updateValues);

    return result.modifiedCount;
}

export async function getAllInviteTokens() {
    const collection = await getCollection();
    return (await collection.find({}).toArray()) as Array<Partial<InviteToken>>;
}

export async function createFirstToken() {
    const collection = await getCollection();
    const count = await collection.countDocuments();
    if (!count) {
        console.log('------SYSTEM INFORMATION-------');
        console.log('------GENERATING FIRST INVITE TOKEN---------');
        const { value, hashedValue, ...token } = await generateInviteToken(true);
        const id = await collection.insertOne({ hashedValue, ...token });

        if (id) {
            console.log(`GENERATED INVITE TOKEN: ${value}`);
            console.log('USE IT TO CREATE YOUR FIRST USER');
        }
    }
}
