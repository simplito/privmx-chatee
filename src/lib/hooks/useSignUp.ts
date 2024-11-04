'use client';

import { useState } from 'react';
import { FormStatus } from '@/shared/utils/types';
import { NEXT_PUBLIC_BACKEND_URL } from '@/shared/utils/env';
import { SignUpRequestBody, SignUpResult } from '@/app/api/sign-up';
import { PrivmxCrypto } from '@simplito/privmx-webendpoint-sdk';

export type SignUpFormStatus =
    | FormStatus
    | 'invalid-token'
    | 'credentials-in-use'
    | 'domain-blocked';

export default function useSignUp() {
    const [status, setStatus] = useState<SignUpFormStatus>('default');

    const register = async (inviteToken: string, username: string, password: string) => {
        setStatus('loading');

        try {
            const privateKey = await PrivmxCrypto.derivePrivateKey(username, password);
            const publicKey = await PrivmxCrypto.derivePublicKey(privateKey);

            const body: SignUpRequestBody = {
                inviteToken,
                publicKey,
                username
            };

            const signUpRequest = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/sign-up`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const result: SignUpResult = await signUpRequest.json();

            if (signUpRequest.ok) {
                setStatus('success');
                return true;
            } else if ('errorCode' in result) {
                switch (result.errorCode) {
                    case 300:
                        setStatus('invalid-token');
                        break;
                    case 400:
                        setStatus('credentials-in-use');
                        break;
                    case 1:
                        setStatus('error');
                        break;
                    case 3:
                        setStatus('error');
                        break;
                }
            }
            return false;
        } catch (e) {
            setStatus('error');
            return false;
        }
    };

    return {
        register,
        status,
        setStatus
    };
}
