'use client';

import { SetStaffRequestBody } from '@/app/api/set-staff';
import { useNotification } from '@/shared/hooks/useNotification';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { NEXT_PUBLIC_BACKEND_URL } from '@/shared/utils/env';
import { FormStatus } from '@/shared/utils/types';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { User } from '../db/users/users';

export function useSetStaff() {
    const [status, setStatus] = useState<FormStatus>('default');
    const {
        state: { token }
    } = useUserContext();
    const { showError, showSuccess } = useNotification();

    const handleSetStaff = useCallback(
        async (
            username: string,
            isStaff: boolean,
            setContacts: Dispatch<SetStateAction<User[]>>
        ) => {
            setStatus('loading');
            const body: SetStaffRequestBody = {
                isStaff,
                username
            };

            try {
                const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/set-staff`, {
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
                        showSuccess('Rola zaaktualizowana pomyślnie');
                        setContacts((prev) => {
                            const newContacts = prev.map((contact) => {
                                if (contact.username === username) {
                                    return { ...contact, isStaff: isStaff };
                                } else {
                                    return contact;
                                }
                            });

                            return newContacts;
                        });
                        break;
                    }
                    default: {
                        setStatus('error');
                        showError('Wystąpił błąd podczas aktualizowaniu roli');
                        break;
                    }
                }
            } catch (error) {
                setStatus('error');
            }
        },
        [token, showError, showSuccess]
    );
    return { handleSetStaff, status };
}
