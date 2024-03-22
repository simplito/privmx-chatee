'use server';

import { NextResponse } from 'next/server';
import { OWNER_TOKEN } from '@/shared/utils/env';
import { getDomainByName } from '@/lib/db/domains/domains';
import { generateNewDomainResponse, newDomainRequestBodySchema } from '.';
import { registerNewDomain } from '@/lib/db/transactions/new-domain';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = newDomainRequestBodySchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Bad request' }, { status: 400 });
        }
        const { ownerToken, domainName } = validation.data;

        if (!(ownerToken === OWNER_TOKEN)) {
            return NextResponse.json({ message: 'Invalid owner token' }, { status: 400 });
        }
        const domainAlreadyExists = await getDomainByName(domainName);

        if (domainAlreadyExists) {
            return NextResponse.json({ message: 'Given domain already exists' }, { status: 409 });
        }

        const inviteToken = await registerNewDomain(domainName);

        return NextResponse.json(generateNewDomainResponse(inviteToken), { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
    }
}

export const OPTIONS = async () => {
    return NextResponse.json(
        {},
        {
            status: 200
        }
    );
};
