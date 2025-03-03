import { NEXT_PUBLIC_BACKEND_URL } from '@utils/env';

export function register() {
    if (!process.env.REPLICA_SET) {
        throw new Error('ENV ERROR: REPLICA_SET IS NOT SET');
    }
    
    if (!process.env.MONGODB_URI) {
        throw new Error('ENV ERROR: MONGODB_URI IS NOT SET');
    }

    if (!process.env.BRIDGE_URL) {
        throw new Error('ENV ERROR: BRIDGE_URL IS NOT SET');
    }

    if (!process.env.ACCESS_KEY_ID) {
        throw new Error('ENV ERROR: ACCESS_KEY_ID IS NOT SET');
    }

    if (!process.env.ACCESS_KEY_SECRET) {
        throw new Error('ENV ERROR: ACCESS_KEY_SECRET IS NOT SET');
    }
    if (!process.env.SOLUTION_ID) {
        throw new Error('ENV ERROR: SOLUTION_ID IS NOT SET');
    }

    if (!process.env.CONTEXT_ID) {
        throw new Error('ENV ERROR: CONTEXT_ID IS NOT SET');
    }

    if (!process.env.JWT_SALT) {
        throw new Error('ENV ERROR: JWT_SALT IS NOT SET');
    }

    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        throw new Error('ENV ERROR: NEXT_PUBLIC_BACKEND_URL IS NOT SET');
    }

    if (process.env.NEXT_RUNTIME === 'nodejs') {
        fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/boot`);
    }
}
