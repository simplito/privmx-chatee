'use client';

import { FormStatus } from '@/shared/utils/types';
import { useState } from 'react';
import { NEXT_PUBLIC_BACKEND_URL } from '@/shared/utils/env';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/shared/hooks/useNotification';
import { useTranslations } from 'next-intl';
import { generateEndpointKeyPair } from '../../../../lib/endpoint-api/utils';
import { CreateOwnerTokenRequestBody, CreateOwnerTokenResult } from '..';

export function useCreateOwnerToken() {
    const t = useTranslations();
    const [status, setStatus] = useState<FormStatus>('default');
    const router = useRouter();
    const { showError } = useNotification();

    const createOwnerToken = async (ownerToken: string) => {
        setStatus('loading');
        const { publicKey } = await generateEndpointKeyPair(ownerToken);

        const createOwnerTokenRequest: CreateOwnerTokenRequestBody = {
            ownerToken: publicKey
        };

        const signInResponse = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/owner/create-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(createOwnerTokenRequest)
        });

        const result: CreateOwnerTokenResult = await signInResponse.json();

        if ('errorCode' in result) {
            switch (result.errorCode) {
                case 1:
                    showError(t('common.invalidFormData'));
                    setStatus('error');
                    break;
                case 3:
                    showError(t('common.somethingWentWrong'));
                    setStatus('error');
                    break;
            }
            return;
        }

        setStatus('success');
        router.push('/owner/sign-in');
    };

    return {
        status,
        createOwnerToken,
        setStatus
    };
}
