'use client';

import { useState } from 'react';
import { Endpoint } from '@privmx/endpoint-web';
import { FormStatus } from '@/shared/utils/types';
import { NEXT_PUBLIC_BACKEND_URL } from '@/shared/utils/env';
import { SignUpRequestBody } from '@/app/api/sign-up';

export type SignUpFormStatus = FormStatus | 'invalid-token' | 'credentials-in-use';

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

            if (signUpRequest.ok) {
                setStatus('success');
            } else {
                const error = await signUpRequest.json();
                if (error.message === 'Invalid token') {
                    setStatus('invalid-token');
                } else if (error.message === 'Username or public key in use') {
                    setStatus('credentials-in-use');
                } else {
                    setStatus('error');
                }
                throw new Error();
            }
        } catch (e) {
            throw new Error();
        }
    };

    return {
        register,
        status,
        setStatus
    };
}
