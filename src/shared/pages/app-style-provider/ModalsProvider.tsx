import { CreateChatModal } from '@chat/ui';
import { InviteUserModal } from '@modals/invite-user-modal/InviteUserModal';
import { DomainConfigModal } from '@modals/domain-config-modal/DomainConfigModal';
import { ModalsProvider as MantineModalsProvider } from '@mantine/modals';
import { ReactNode } from 'react';

const modals = {
    createChat: CreateChatModal,
    inviteUser: InviteUserModal,
    domainModal: DomainConfigModal
};

declare module '@mantine/modals' {
    export interface MantineModalsOverride {
        modals: typeof modals;
    }
}

export function ModalsProvider({ children }: { children: ReactNode }) {
    return <MantineModalsProvider modals={modals}>{children}</MantineModalsProvider>;
}
