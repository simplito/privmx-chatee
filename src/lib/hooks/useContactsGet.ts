'use client';

import { FormStatus } from '@/shared/utils/types';
import { useCallback, useEffect, useState } from 'react';
import { User } from '../db/users/users';
import { useUserSystem } from '@srs/ReactBindings';

export default function useContactsGet() {
    const [contacts, setContacts] = useState<User[]>([]);
    const [status, setStatus] = useState<FormStatus>('default');

    const userSystem = useUserSystem();

    const getContacts = useCallback(async () => {
        setStatus('loading');
        try {
            const contactsResponse = await userSystem.getAllUsers();
            setContacts(contactsResponse.contacts);
            setStatus('success');
        } catch (e) {
            setStatus('error');
            setContacts([]);
        }
    }, [userSystem]);

    useEffect(() => {
        (async () => {
            await getContacts();
        })();
    }, [getContacts]);

    return {
        contacts,
        status,
        setContacts
    };
}
