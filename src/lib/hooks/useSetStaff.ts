'use client';

import { useNotification } from '@/shared/hooks/useNotification';
import { FormStatus } from '@/shared/utils/types';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { User } from '../db/users/users';
import { useUserSystem } from '@srs/ReactBindings';

export function useSetStaff() {
    const [status, setStatus] = useState<FormStatus>('default');
    const { showError, showSuccess } = useNotification();
    const userSystem = useUserSystem();
    const handleSetStaff = useCallback(
        async (
            username: string,
            isStaff: boolean,
            setContacts: Dispatch<SetStateAction<User[]>>
        ) => {
            setStatus('loading');

            try {
                setStatus('success');
                await userSystem.setUserStaffStatus({ isStaff, username });

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
            } catch (error) {
                showError('Wystąpił błąd podczas aktualizowaniu roli');
                setStatus('error');
            }
        },
        [showError, showSuccess, userSystem]
    );
    return { handleSetStaff, status };
}
