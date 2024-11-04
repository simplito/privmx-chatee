import { User } from '@/lib/db/users/users';

export function generateContactsResponse(contacts: User[]) {
    return {
        contacts
    };
}

export type ContactsResponse = ReturnType<typeof generateContactsResponse>;
