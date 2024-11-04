import { cookies, headers } from 'next/headers';
import { createOwnerJwt, decryptCookie, verifyJwt } from './jwt';
import { cache } from 'react';

export function getTokenFromRequest(request: Request) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (token) {
        return token;
    }

    return null;
}

export function isStaffMember(request: Request) {
    const token = getTokenFromRequest(request);

    if (!token) {
        return false;
    }

    const verifiedToken = verifyJwt(token);

    if (!verifiedToken) {
        return false;
    }

    return verifiedToken.isStaff;
}

export async function createSession() {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const token = await createOwnerJwt();

    const origin = headers().get('host').split(':')[0];

    cookies().set('session', token, {
        httpOnly: true,
        secure: false,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
        domain: origin
    });

    return token;
}

export function deleteSession() {
    cookies().delete('session');
}

export const verifySession = cache(async () => {
    const cookie = cookies().get('session')?.value;
    try {
        const session = await decryptCookie(cookie);

        if (!session) {
            return null;
        }

        return { isAuth: true };
    } catch (error) {
        console.error('session not verifyied', error);
        return null;
    }
});
