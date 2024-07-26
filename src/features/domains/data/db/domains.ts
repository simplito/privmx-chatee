'use server';

import { ClientSession, Filter } from 'mongodb';
import crypto from 'crypto';
import clientPromise from '@/lib/db/mongodb';
import { User } from '@/lib/db/users/users';

export interface AccessPeriod {
    id: string;
    active: boolean;
    startTimestamp: number;
    endTimestamp: number;
}

export interface Domain {
    name: string;
    contextId: string;
    displayName: string;
    isBlocked: boolean;

    //new data
    accessPeriods: AccessPeriod[];
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

export async function createDomain({
    contextId,
    displayName,
    name,
    session,
    firstAccessPeriod
}: {
    name: string;
    displayName: string;
    contextId: string;
    session: ClientSession;
    firstAccessPeriod?: AccessPeriod;
}) {
    const db = await getDatabase();

    const collection = db.collection<Domain>(collectionName);
    const result = await db.createCollection<User>(`domain-${name}`, { session });

    const accessPeriods = firstAccessPeriod ? [firstAccessPeriod] : [];

    await collection.insertOne(
        {
            name,
            contextId,
            displayName,
            isBlocked: false,
            accessPeriods
        },
        { session }
    );

    return result;
}

export async function updateDomain(name: string, newDomain: Partial<Domain>) {
    const db = await getDatabase();
    const collection = db.collection<Domain>(collectionName);

    return await collection.updateOne(
        {
            name
        },
        { $set: { ...newDomain } }
    );
}

export async function addPeriod(name: string, accessPeriod: Omit<AccessPeriod, 'id'>) {
    const db = await getDatabase();
    const collection = db.collection<Domain>(collectionName);

    const newAccessPeriod = {
        ...accessPeriod,
        id: crypto.randomBytes(16).toString('hex')
    };

    return collection.updateOne(
        { name },
        {
            $push: {
                accessPeriods: newAccessPeriod
            }
        }
    );
}

export async function setPeriodBlockStatus(domainName: string, id: string, isActive: boolean) {
    const db = await getDatabase();
    const collection = db.collection<Domain>(collectionName);

    return collection.updateOne(
        { name: domainName },
        {
            $set: {
                'accessPeriods.$[i].active': isActive
            }
        },
        {
            arrayFilters: [
                {
                    'i.id': id
                }
            ]
        }
    );
}

export async function deletePeriod(domainName: string, id: string) {
    const db = await getDatabase();
    const collection = db.collection<Domain>(collectionName);

    return collection.updateOne(
        {
            name: domainName
        },
        {
            $pull: { accessPeriods: { id } }
        }
    );
}

export async function updateBlockDomain(name: string, isBlocked: boolean) {
    return await updateDomain(name, { isBlocked });
}

export async function getIsDomainBlocked(name: string) {
    const db = await getDatabase();
    const collection = db.collection<Domain>(collectionName);

    const domain = await collection.findOne({ name });

    return domain.isBlocked;
}

export async function getDomainNames() {
    const collection = await getCollection();

    const collections = await collection.find().toArray();

    const collectionNames = collections.map((collection) => collection.name);

    return collectionNames;
}

export async function getDomains(filter?: Filter<Domain>) {
    const collection = await getCollection();
    const domains = await collection.find(filter).toArray();
    return domains;
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

export async function updateDomainDisplayName(name: string, displayName: string) {
    const collection = await getCollection();

    const domain = await collection.updateOne(
        { name },
        {
            $set: {
                displayName,
                blocked: false
            }
        }
    );

    return domain;
}

export async function updateDomainsAcceess(name: string, newAccess: AccessPeriod) {
    const collection = await getCollection();
    return await collection.updateMany(
        { name: name },
        {
            $set: {
                accessPeriods: [newAccess]
            }
        }
    );
}

export async function getDomainAccessPeriods(name: string) {
    const col = await getCollection();

    const periods = col
        .aggregate([
            {
                $match: {
                    name
                }
            },
            {
                $project: {
                    accessPeriods: '1'
                }
            }
        ])
        .toArray();

    return periods;
}
