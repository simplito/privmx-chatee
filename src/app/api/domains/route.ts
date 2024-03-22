import { getDomainNames } from '@/lib/db/domains/domains';
import { NextResponse } from 'next/server';
import { OWNER_TOKEN } from '@/shared/utils/env';
import { getTokenFromRequest } from '@/shared/utils/auth';
import { generateDomainsResponse } from '.';

export const dynamic = 'force-dynamic'; // defaults to auto
export async function GET(request: Request) {
    try {
        const token = getTokenFromRequest(request);

        if (!token) {
            return NextResponse.json({ message: 'Bad request' }, { status: 400 });
        }

        if (token !== OWNER_TOKEN) {
            return NextResponse.json({ message: 'Invalid owner token' }, { status: 400 });
        }

        const domains = await getDomainNames();

        return NextResponse.json(generateDomainsResponse(domains), { status: 200 });
    } catch {
        return NextResponse.json({ message: 'Unexpected error occured' }, { status: 500 });
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
