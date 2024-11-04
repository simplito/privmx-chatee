'use server';

import { ClientSession, Filter } from 'mongodb';
import clientPromise from '../mongodb';
import { CredentialError } from '@/lib/errors/credentialError';

export interface User {
    username: string;
    publicKey: string;
    isStaff: boolean;
}

async function getCollection() {
    const mongoClient = await clientPromise;
    const db = mongoClient.db();
    const collection = db.collection<User>(`users`);

    return collection;
}

export async function createUser(user: User, session?: ClientSession) {
    const collection = await getCollection();
    const exists = await collection.findOne({
        username: user.username
    });

    if (exists) {
        throw new CredentialError('User already exists');
    }

    const id = collection.insertOne(user, { session });

    if (!id) {
        throw new Error('Error creating user');
    }
    return id;
}

export async function getUser(filterCriteria: Filter<User>) {
    const collection = await getCollection();

    const user = await collection.findOne(filterCriteria);
    if (user) {
        return user;
    }

    return null;
}

export async function getUserByUsername(username: string) {
    const collection = await getCollection();
    const user = await collection.findOne({
        username: username
    });

    if (user) {
        return user;
    }

    return null;
}

export async function setUserStaffRole(username: string, isStaff: boolean) {
    const collection = await getCollection();
    const user = await collection.findOne({
        username: username
    });

    if (user) {
        const result = await collection.updateOne(
            { username: username },
            { $set: { isStaff: isStaff } }
        );

        return result.modifiedCount;
    }

    return null;
}

export async function getDomainUsersCount() {
    const collection = await getCollection();

    return await collection.countDocuments();
}

export async function getUserContacts(isStaff: boolean) {
    const collection = await getCollection();

    if (!collection) {
        return [];
    }

    if (isStaff) {
        const users = await collection.find().toArray();

        return users;
    }

    if (!isStaff) {
        const users = await collection
            .find({
                isStaff: true
            })
            .toArray();

        return users;
    }

    return [];
}
