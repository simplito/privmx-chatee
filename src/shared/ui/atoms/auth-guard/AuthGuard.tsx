'use client';

import { useRouter } from 'next/navigation';
import { signOutAction, useUserContext } from '../../context/UserContext';
import { useEffect } from 'react';
import { UserEvent } from '@srs/AppBus';
import { useApp } from '@srs/ReactBindings';
import { Endpoint } from '@simplito/privmx-webendpoint-sdk';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const {
        state: { userStatus },
        dispatch
    } = useUserContext();
    const router = useRouter();
    const app = useApp();

    useEffect(() => {
        if (userStatus === 'logged-out') {
            router.push('/sign-in');
        }
    }, [router, userStatus]);

    useEffect(() => {
        return app.eventBus.registerSubscriber(
            UserEvent.createSubscriber('sign_out', async () => {
                await Endpoint.connection().disconnect();
                dispatch(signOutAction());
            })
        );
    }, [app.eventBus, router, dispatch]);

    if (userStatus === 'logged-in') {
        return children;
    }

    return null;
}
