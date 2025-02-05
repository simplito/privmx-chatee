'use client';
import { FormStatus } from '@/shared/utils/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInAction, useUserContext } from '@/shared/ui/context/UserContext';
import { useNotification } from '@/shared/hooks/useNotification';
import { useTranslations } from 'next-intl';
import { useApp, useEmitEvent, useUserSystem } from '@srs/ReactBindings';
import { UserEvent } from '@srs/AppBus';
import { EndpointConnectionManager } from '@lib/endpoint-api/endpoint';

type SignInFormStatus = FormStatus | 'invalid-credentials' | 'domain-blocked' | 'no-access-period';

export default function useSignIn() {
    const [status, setStatus] = useState<SignInFormStatus>('default');
    const router = useRouter();
    const { dispatch } = useUserContext();
    const { showSuccess } = useNotification();
    const emit = useEmitEvent();

    const userSystem = useUserSystem();
    const app = useApp();

    const t = useTranslations();

    const signIn = async (username: string, password: string) => {
        setStatus('loading');

        try {
            const context = await userSystem.signIn(username, password);
            const connectionManager =
                await EndpointConnectionManager.getInstance().getConnectionEventManager();
            connectionManager.onConnectionEvent({
                event: 'libDisconnected',
                callback: () => {
                    emit(UserEvent.signOut());
                }
            });

            setStatus('success');
            dispatch(signInAction(context));
            showSuccess(t('signIn.success'));
        } catch (e) {
            if (e instanceof Error) {
                setStatus(e.message as SignInFormStatus);
                return;
            }
        }
    };

    useEffect(() => {
        app.eventBus.registerSubscriber(
            UserEvent.createSubscriber('sign_in', () => {
                router.push('/');
            })
        );
    }, [router, app.eventBus, dispatch]);

    return {
        status,
        signIn,
        setStatus
    };
}
