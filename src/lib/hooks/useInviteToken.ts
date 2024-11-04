'use client';

import { FormStatus } from '@/shared/utils/types';
import { useCallback, useState } from 'react';
import { useUserSystem } from '@srs/ReactBindings';

export function useInviteToken() {
    const [status, setStatus] = useState<FormStatus>('default');
    const userSystem = useUserSystem();
    const [inviteToken, setInviteToken] = useState<string | null>(null);

    const handleGetInviteToken = useCallback(
        async (isStaff: boolean) => {
            setStatus('loading');
            try {
                const newToken = await userSystem.createNewInviteToken(isStaff);
                setInviteToken(newToken.value);
                setStatus('success');
            } catch (e) {
                setStatus('error');
            }
        },
        [userSystem]
    );

    const clearInviteToken = useCallback(() => {
        setInviteToken(null);
    }, []);

    return { handleGetInviteToken, status, inviteToken, clearInviteToken };
}
