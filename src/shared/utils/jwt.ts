import { JWT_SALT } from '@/shared/utils/env';
import { SignJWT, jwtVerify } from 'jose';
import jwt from 'jsonwebtoken';

export interface UserJwt {
    username: string;
    isStaff: boolean;
}

export function createJwt(payload: UserJwt) {
    const token = jwt.sign(payload, JWT_SALT, {
        algorithm: 'HS384',
        expiresIn: '2d'
    });

    return token;
}

export function verifyJwt(token: string) {
    try {
        const veirfiedToken = jwt.verify(token, JWT_SALT, {
            algorithms: ['HS384']
        });

        if (veirfiedToken) {
            return veirfiedToken as UserJwt;
        }
    } catch {
        return null;
    }

    return null;
}

const encodedKey = new TextEncoder().encode(JWT_SALT);

export async function createOwnerJwt() {
    'use server';
    const token = await new SignJWT({})
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey);

    return token;
}

export async function decryptCookie(cookie: string | undefined) {
    'use server';

    try {
        const { payload } = await jwtVerify(cookie, encodedKey, {
            algorithms: ['HS256']
        });
        return payload;
    } catch (e) {
        return null;
    }
}
