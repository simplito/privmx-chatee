'use client';

import { ReactNode } from 'react';
import { UserContextProvider } from '@/shared/ui/context/UserContext';
import { Notifications } from '@mantine/notifications';
import { EndpointContextProvider } from '@/shared/hooks/useEndpointContext';
import { App } from '@srs/App';
import { AppContextProvider } from '@srs/ReactBindings';
import { BrowserEventBus } from '@srs/AppBus';
import { AppContext } from '@srs/AppContext';
import { LoggerSystem } from '@srs/LoggerSystem';
import {
    ChatSystem,
    MessagesSystem,
    ThreadFileService,
    ThreadFilesResource,
    ThreadMessageResource,
    ThreadMessageService,
    ThreadResource,
    ThreadService
} from '@chat/logic';
import { StyleProvider } from '@pages/app-style-provider/StyleProvider';
import { ModalsProvider } from '@pages/app-style-provider/ModalsProvider';
import { UserSystem } from '@/features/users/logic/UserSystem';

const app = new App()
    .mountEventBus(new BrowserEventBus())
    .mountContext(new AppContext())
    .addResource(new ThreadResource())
    .addResource(new ThreadFilesResource())
    .addResource(new ThreadMessageResource())
    .addService(new ThreadFileService())
    .addService(new ThreadService())
    .addService(new ThreadMessageService())
    .addSystem(new MessagesSystem())
    .addSystem(new ChatSystem())
    .addSystem(new UserSystem())
    .addSystem(new LoggerSystem());

export function Providers({ children }: { children: ReactNode }) {
    return (
        <StyleProvider>
            <AppContextProvider app={app}>
                <UserContextProvider>
                    <EndpointContextProvider>
                        <ModalsProvider>{children}</ModalsProvider>
                        <Notifications limit={3} />
                    </EndpointContextProvider>
                </UserContextProvider>
            </AppContextProvider>
        </StyleProvider>
    );
}
