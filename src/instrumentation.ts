import { NEXT_PUBLIC_BACKEND_URL } from '@utils/env';

export function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/boot`);
    }
}
