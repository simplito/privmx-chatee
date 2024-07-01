'use server';

import { getTokenFromRequest } from '@/shared/utils/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getInviteTokenHandler } from '@domains/logic';
import { API_ERRORS } from '@/shared/utils/errors';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const token = getTokenFromRequest(request);
        const result = await getInviteTokenHandler(token, body);

        if ('errorCode' in result) {
            switch (result.errorCode) {
                case 1:
                    return NextResponse.json(result, { status: 400 });
                case 5:
                    return NextResponse.redirect(new URL('/owner/sign-in', request.nextUrl));
                default:
                    return NextResponse.json(API_ERRORS.UNEXPECTED, { status: 409 });
            }
        }

        return NextResponse.json(result, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json(API_ERRORS.UNEXPECTED, { status: 409 });
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
