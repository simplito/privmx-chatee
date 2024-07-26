'use client';

import { FormStatus } from '@/shared/utils/types';
import { useState } from 'react';
import { NEXT_PUBLIC_BACKEND_URL } from '@/shared/utils/env';
import { useRouter } from 'next/navigation';
import { OwnerSignInRequestBody, OwnerSignInResult } from '@/app/api/owner/sign-in';
import { useNotification } from '@/shared/hooks/useNotification';
import { signInAction, useUserContext } from '@/shared/ui/context/UserContext';
import { Platform } from '@simplito/privmx-endpoint-web-sdk';
import { generateEndpointKeyPair } from '../../../../lib/endpoint-api/utils';
import { useTranslations } from 'next-intl';

type SignInFormStatus = FormStatus | 'invalid-credentials';

export function useOwnerSignIn() {
    const [status, setStatus] = useState<SignInFormStatus>('default');
    const router = useRouter();
    const { dispatch } = useUserContext();
    const { showError, showSuccess } = useNotification();

    const t = useTranslations();

    const ownerSignIn = async (ownerToken: string) => {
        setStatus('loading');

        const date = Date.now().toString();

        const { privateKey } = await generateEndpointKeyPair(ownerToken);

        const signature = await Platform.cryptoSign(Buffer.from(date), privateKey);

        const signInRequest: OwnerSignInRequestBody = {
            date,
            signature: Buffer.from(signature, 'base64').toString('hex')
        };

        const signInResponse = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/owner/sign-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signInRequest)
        });

        const result: OwnerSignInResult = await signInResponse.json();

        if ('errorCode' in result) {
            switch (result.errorCode) {
                case 1: {
                    showError('Incorect form data');
                    setStatus('error');
                    break;
                }
                case 4 || 6: {
                    showError('Invalid Owner Token');
                    setStatus('invalid-credentials');
                    break;
                }
                case 3: {
                    showError('Something went wrong, refresh page or try again later.');
                    setStatus('error');
                    break;
                }
            }

            return;
        }

        showSuccess(t('signIn.success'));

        dispatch(
            signInAction({
                contextId: '',
                isStaff: true,
                publicKey: '',
                token: '',
                username: '',
                userStatus: 'logged-in'
            })
        );

        router.push('/owner');
        setStatus('success');
    };

    return {
        status,
        ownerSignIn,
        setStatus
    };
}
