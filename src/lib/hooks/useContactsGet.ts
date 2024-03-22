'use client';

import { FormStatus } from '@/shared/utils/types';
import { useCallback, useEffect, useState } from 'react';
import { User } from '../db/users/users';
import { ContactsResponse } from '@/app/api/contacts';
import { useUserContext } from '@/shared/ui/context/UserContext';

export default function useContactsGet() {
    const [contacts, setContacts] = useState<User[]>([]);
    const {
        state: { token }
    } = useUserContext();
    const [status, setStatus] = useState<FormStatus>('default');

    const getContacts = useCallback(async () => {
        setStatus('loading');

        if (!token) {
            setStatus('error');
            return;
        }
        const getContactsRequest = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!getContactsRequest.ok) {
            setStatus('error');
            setContacts([]);
        }

        const contactsResponse: ContactsResponse = await getContactsRequest.json();

        setContacts(contactsResponse.contacts);
        setStatus('success');
    }, [token]);

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
