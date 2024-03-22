'use server';

import { createInviteToken } from '@/lib/db/invite-tokens/inviteTokens';
import { getTokenFromRequest } from '@/shared/utils/auth';
import { InviteTokenRequestSchema, generateInviteTokenRespose } from '.';
import { NextResponse } from 'next/server';
import { verifyJwt } from '@/shared/utils/jwt';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = InviteTokenRequestSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Bad request' }, { status: 400 });
        }

        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const decryptedToken = verifyJwt(token);

        if (!decryptedToken || !decryptedToken.isStaff) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const inviteToken = await createInviteToken(validation.data.isStaff, decryptedToken.domain);

        return NextResponse.json(generateInviteTokenRespose(inviteToken), { status: 200 });
    } catch {
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
