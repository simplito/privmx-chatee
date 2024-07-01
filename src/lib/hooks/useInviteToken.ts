'use client';

import { useUserContext } from '@/shared/ui/context/UserContext';
import { NEXT_PUBLIC_BACKEND_URL } from '@/shared/utils/env';
import { FormStatus } from '@/shared/utils/types';
import { InviteTokenRequestBody, InviteTokenResponse } from '@domains/logic';
import { useCallback, useState } from 'react';

export function useInviteToken() {
    const [status, setStatus] = useState<FormStatus>('default');
    const {
        state: { token }
    } = useUserContext();
    const [inviteToken, setInviteToken] = useState<string | null>(null);

    const handleGetInviteToken = useCallback(
        async (isStaff: boolean) => {
            setStatus('loading');
            const body: InviteTokenRequestBody = {
                isStaff
            };

            try {
                const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/invite-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'aplication/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(body)
                });

                switch (response.status) {
                    case 200: {
                        setStatus('success');
                        const resultBody: InviteTokenResponse = await response.json();
                        setInviteToken(resultBody.value);
                        break;
                    }
                    default: {
                        setStatus('error');
                        break;
                    }
                }
                setStatus('success');
            } catch (error) {
                setStatus('error');
            }
        },
        [token]
    );

    const clearInviteToken = useCallback(() => {
        setInviteToken(null);
    }, []);

    return { handleGetInviteToken, status, inviteToken, clearInviteToken };
}
