'use client';

import { useState } from 'react';
import { Endpoint } from '@simplito/privmx-endpoint-web-sdk';
import { FormStatus } from '@/shared/utils/types';
import { NEXT_PUBLIC_BACKEND_URL } from '@/shared/utils/env';
import { SignUpRequestBody, SignUpResult } from '@/app/api/sign-up';

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
            const endpoint = await Endpoint.getInstance();
            const privateKey = await endpoint.cryptoPrivKeyNewPbkdf2(username, password);
            const publicKey = await endpoint.cryptoPubKeyNew(privateKey);

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
                    case 201:
                        setStatus('domain-blocked');
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
