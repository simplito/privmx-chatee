'use client';

import { useRouter } from 'next/navigation';
import { useUserContext } from '../../context/UserContext';
import { useEffect } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const {
        state: { userStatus }
    } = useUserContext();
    const router = useRouter();

    useEffect(() => {
        if (userStatus === 'logged-out') {
            router.push('/sign-in');
        }
    }, [router, userStatus]);

    if (userStatus === 'logged-in') {
        return children;
    }

    return null;
}
