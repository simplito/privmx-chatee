'use client';
import { MenuItem } from '@mantine/core';
import { modals } from '@mantine/modals';

export function NewInvitationToken() {
    return (
        <MenuItem
            onClick={() => {
                modals.openContextModal({ modal: 'inviteUser', innerProps: {} });
            }}>
            New Invitation Token
        </MenuItem>
    );
}
