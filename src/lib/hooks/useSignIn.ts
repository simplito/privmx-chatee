'use client';

import { SignInRequestBody, SignInResult } from '@/app/api/sign-in';
import { FormStatus } from '@/shared/utils/types';
import { useState } from 'react';
import { Platform } from '@simplito/privmx-endpoint-web-sdk';
import { NEXT_PUBLIC_BACKEND_URL } from '@/shared/utils/env';
import { useRouter } from 'next/navigation';
import { useUserContext, signInAction } from '@/shared/ui/context/UserContext';
import { getDomainClient } from '@/shared/utils/domain';
import { useNotification } from '@/shared/hooks/useNotification';
import { Time } from '@/shared/utils/date';
import { useTranslations } from 'next-intl';

type SignInFormStatus = FormStatus | 'invalid-credentials' | 'domain-blocked' | 'no-access-period';

export default function useSignIn() {
    const [status, setStatus] = useState<SignInFormStatus>('default');
    const router = useRouter();
    const { dispatch } = useUserContext();
    const { showInfo } = useNotification();

    const t = useTranslations();

    const signIn = async (username: string, password: string) => {
        setStatus('loading');
        const privateKey = await Platform.cryptoPrivKeyNewPbkdf2(username, password);
        const publicKey = await Platform.cryptoPubKeyNew(privateKey);

        const signature = await Platform.cryptoSign(Buffer.from(username), privateKey);
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
        const result: SignInResult = await signInResponse.json();

        if ('errorCode' in result) {
            switch (result.errorCode) {
                case 1:
                    setStatus('error');
                    break;
                case 3:
                    setStatus('error');
                    break;
                case 4:
                    setStatus('invalid-credentials');
                    break;
                case 201:
                    setStatus('domain-blocked');
                    break;
                case 204:
                    setStatus('no-access-period');
            }

            return;
        }

        const con = await Platform.connect({
            platformUrl: result.cloudData.platformUrl,
            privKey: privateKey,
            solutionId: result.cloudData.solutionId
        });
        con.startEventLoop({
            dispatchDecodedMessageEvent: true
        });
        await con.channel('thread2');
        await con.channel('store');

        if (result.periodEndDate) {
            const daysToPeriodEnd = Math.round((result.periodEndDate - Date.now()) / Time.day);

            if (daysToPeriodEnd == 1) {
                showInfo(
                    t('signIn.endOfPeriod.info', { daysToPeriodEnd }) +
                        t('signIn.endOfPeriod.daysSingular')
                );
            } else if (daysToPeriodEnd <= 7) {
                showInfo(
                    t('signIn.endOfPeriod.info', { daysToPeriodEnd }) +
                        t('signIn.endOfPeriod.daysPlural')
                );
            }
        }

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

        setStatus('success');
        router.push('/');
    };

    return {
        status,
        signIn,
        setStatus
    };
}
