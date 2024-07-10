'use client';

import { Endpoint } from '@simplito/privmx-endpoint-web-sdk';
import { EndpointEventTypes } from '@simplito/privmx-endpoint-web-sdk';
import { useEndpointEvent } from '@/shared/hooks/useEndpointEvent';
import { useRouter } from 'next/navigation';
import React, { ReactNode, createContext, useContext, useEffect, useReducer } from 'react';

export type UserStatus = 'logged-in' | 'logged-out';

export interface UserContextType {
    userStatus: UserStatus;
    token: string;
    contextId: string;
    username: string;
    publicKey: string;
    isStaff: boolean;
}

export enum UserContextActionTypes {
    // eslint-disable-next-line no-unused-vars
    SIGN_IN = 'SIGN_IN',
    // eslint-disable-next-line no-unused-vars
    SIGN_OUT = 'SIGN_OUT'
}

interface SignInAction {
    type: UserContextActionTypes.SIGN_IN;
    payload: {
        token: string;
        contextId: string;
        username: string;
        publicKey: string;
        isStaff: boolean;
    };
}

interface SignOutAction {
    type: UserContextActionTypes.SIGN_OUT;
}

type Action = SignInAction | SignOutAction;

const initialState: UserContextType = {
    userStatus: 'logged-out',
    token: '',
    contextId: '',
    username: '',
    publicKey: '',
    isStaff: false
};

export const UserContext = createContext<{
    state: UserContextType;
    dispatch: React.Dispatch<Action>;
}>({
    state: initialState,
    dispatch: () => null
});

function userReducer(state: UserContextType, action: Action): UserContextType {
    switch (action.type) {
        case UserContextActionTypes.SIGN_IN:
            return {
                ...state,
                userStatus: 'logged-in',
                token: action.payload.token,
                contextId: action.payload.contextId,
                username: action.payload.username,
                publicKey: action.payload.publicKey,
                isStaff: action.payload.isStaff
            };
        case UserContextActionTypes.SIGN_OUT:
            return initialState;
        default:
            return state;
    }
}

export const UserContextProvider: React.FC<{ children: React.ReactNode }> =
    function UserContextProvider({ children }) {
        const [state, dispatch] = useReducer(userReducer, initialState);
        const router = useRouter();
        useEndpointEvent(EndpointEventTypes.DISCONNECTED, async (event) => {
            const endPoint = await Endpoint.getInstance();
            await endPoint.platformDisconnect();

            if (event.data && event?.data?.type === 'time-out') {
                router.push('/sign-in?session-expired=true');
            }
            dispatch(signOutAction());
        });

        return <UserContext.Provider value={{ state, dispatch }}>{children}</UserContext.Provider>;
    };

export function OwnerContextProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(userReducer, initialState);

    return <UserContext.Provider value={{ state, dispatch }}>{children}</UserContext.Provider>;
}

export function signInAction(payload: UserContextType): SignInAction {
    return {
        type: UserContextActionTypes.SIGN_IN,
        payload
    };
}

export function signOutAction(): SignOutAction {
    return {
        type: UserContextActionTypes.SIGN_OUT
    };
}

export function useUserContext() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error('useUserContext must be used inside a UserContext');
    }

    return context;
}
