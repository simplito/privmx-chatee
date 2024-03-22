'use client';

import { SignInRequestBody, SignInResponse } from '@/app/api/sign-in';
import { FormStatus } from '@/shared/utils/types';
import { useState } from 'react';
import { Endpoint } from '../endpoint-api/endpoint';
import { NEXT_PUBLIC_BACKEND_URL } from '@/shared/utils/env';
import { useRouter } from 'next/navigation';
import { useUserContext, signInAction } from '@/shared/ui/context/UserContext';
import { getDomainClient } from '@/shared/utils/domain';

type SignInFormStatus = FormStatus | 'invalid-credentials';

export default function useSignIn() {
    const [status, setStatus] = useState<SignInFormStatus>('default');
    const router = useRouter();
    const { dispatch } = useUserContext();

    const signIn = async (username: string, password: string) => {
        setStatus('loading');
        const endpoint = await Endpoint.getInstance();
        const privateKey = await endpoint.cryptoPrivKeyNewPbkdf2(username, password);
        const publicKey = await endpoint.cryptoPubKeyNew(privateKey);

        const signature = await endpoint.cryptoSign(Buffer.from(username), privateKey);
        const domain = getDomainClient();

        const signInRequest: SignInRequestBody = {
            domainName: domain,
            username,
            sign: Buffer.from(signature, 'base64').toString('hex')
        };

        const signInResponse = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/sign-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signInRequest)
        });

        if (!signInResponse.ok) {
            if (signInResponse.status === 400) {
                setStatus('invalid-credentials');
            } else {
                setStatus('error');
            }

            return;
        }

        const result: SignInResponse = await signInResponse.json();

        dispatch(
            signInAction({
                userStatus: 'logged-in',
                token: result.token,
                contextId: result.cloudData.contextId,
                username,
                publicKey,
                isStaff: result.isStaff
            })
        );

        await endpoint.platformConnect(
            privateKey,
            result.cloudData.solutionId,
            result.cloudData.platformUrl
        );

        setStatus('success');
        router.push('/');
    };

    return {
        status,
        signIn,
        setStatus
    };
}
