'use server';

import { NextRequest, NextResponse } from 'next/server';
import { API_ERRORS } from '@/shared/utils/errors';
import { deleteSession } from '@/shared/utils/auth';

export async function POST(request: NextRequest) {
    try {
        deleteSession();
        return NextResponse.redirect(new URL('/owner/sign-in', request.nextUrl));
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
