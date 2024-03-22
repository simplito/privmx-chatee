import { JWT_SALT } from '@/shared/utils/env';
import jwt from 'jsonwebtoken';

export interface UserJwt {
    username: string;
    isStaff: boolean;
    domain: string;
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
