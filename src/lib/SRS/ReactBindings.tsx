import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { App } from '@srs/App';
import { ChatSystem } from '@chat/logic/chat-system/ChatSystem';
import { AppContext } from '@srs/AppContext';
import { AppEvent } from '@srs/AppBus';
import { MessagesSystem } from '@chat/logic/messages-system';
import { UserSystem } from '@/features/users/logic/UserSystem';

const appContext = createContext<App>(new App());

export const useApp = () => useContext(appContext);

export function useChatSystem() {
    const app = useApp();
    const system = app.systems.get(ChatSystem.systemName);

    if (!system || !ChatSystem.isChatSystem(system)) {
        throw new Error('No registered system with name ' + ChatSystem.systemName);
    }

    return system;
}

export function useEmitEvent() {
    const app = useContext(appContext);
    const emitEvent = <T extends any>(event: AppEvent<T>) => {
        app.eventBus.emit(event);
    };

    return emitEvent;
}

export function useMessagesSystem() {
    const app = useApp();
    const system = app.systems.get('MessageSystem') as MessagesSystem;

    if (!system) {
        throw new Error('No registered system with name ' + 'MessageSystem');
    }

    return system;
}

export function useUserSystem() {
    const app = useApp();
    const system = app.systems.get('UserSystem') as UserSystem;

    if (!system) {
        throw new Error('No registered system with name ' + 'UserSystem');
    }

    return system;
}

export function useAppContext() {
    const app = useContext(appContext);
    const [context, setContext] = useState<AppContext>();

    useEffect(() => {
        const system = app.context;
        setContext(system);
    }, [app.context]);

    return context;
}

export function AppContextProvider({ app, children }: { app: App; children: ReactNode }) {
    return <appContext.Provider value={app}>{children}</appContext.Provider>;
}
