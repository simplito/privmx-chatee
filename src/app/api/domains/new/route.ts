'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_ERRORS } from '@/shared/utils/errors';
import { newDomainHandler } from '@domains/logic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await newDomainHandler(body);

        if ('errorCode' in result) {
            switch (result.errorCode) {
                case 1:
                    return NextResponse.json(result, { status: 400 });
                case 5:
                    return NextResponse.redirect(new URL('/owner/sign-in', request.nextUrl));
                case 200:
                    return NextResponse.json(result, { status: 409 });
                default:
                    return NextResponse.json(API_ERRORS.UNEXPECTED, { status: 409 });
            }
        }
        return NextResponse.json(result, { status: 200 });
    } catch (e) {
        console.error(e);
        return NextResponse.json(API_ERRORS.UNEXPECTED, { status: 500 });
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
