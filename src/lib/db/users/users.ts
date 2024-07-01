'use server';

import { ClientSession, Filter } from 'mongodb';
import clientPromise from '../mongodb';
import { getDomainNames } from '@domains/data';
import { CredentialError } from '@/lib/errors/credentialError';

export interface User {
    username: string;
    publicKey: string;
    isStaff: boolean;
}

async function getCollection(domain: string) {
    const mongoClient = await clientPromise;
    const db = mongoClient.db('Chatee');
    const collection = db.collection<User>(`domain-${domain}`);

    return collection;
}

export async function createUser(user: User, domain: string, session?: ClientSession) {
    const domains = await getDomainNames();

    for (let i = 0; i < domains.length; i++) {
        const collection = await getCollection(`${domains[i]}`);
        const query = await collection
            .find({
                $or: [{ username: user.username }, { publicKey: user.publicKey }]
            })
            .toArray();

        if (query.length > 0) {
            throw new CredentialError('User already exists');
        }
    }

    const collection = await getCollection(domain);
    const id = collection.insertOne(user, { session });

    if (!id) {
        throw new Error('Error creating user');
    }
    return id;
}

export async function getUser(filterCriteria: Filter<User>) {
    const domains = await getDomainNames();

    for (let i = 0; i < domains.length; i++) {
        const collection = await getCollection(domains[i]);
        const user = await collection.findOne(filterCriteria);
        if (user) {
            return user;
        }
    }

    return null;
}

export async function getUserByUsername(username: string) {
    const domains = await getDomainNames();

    for (let i = 0; i < domains.length; i++) {
        const collection = await getCollection(domains[i]);
        const user = await collection.findOne({
            username: username
        });

        if (user) {
            return user;
        }
    }

    return null;
}

export async function setUserStaffRole(username: string, isStaff: boolean) {
    const domains = await getDomainNames();

    for (let i = 0; i < domains.length; i++) {
        const collection = await getCollection(domains[i]);
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
    }

    return null;
}

export async function getDomainUsersCount(domain: string) {
    const collection = await getCollection(domain);

    return await collection.countDocuments();
}

export async function getUserContacts(isStaff: boolean, domain: string) {
    const collection = await getCollection(domain);

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

export async function getUserByUsernameAndDomain(username: string, domain: string) {
    const collection = await getCollection(domain);

    if (!collection) {
        return null;
    }

    const user = await collection.findOne({ username: username });

    if (user) {
        return user;
    }

    return null;
}
