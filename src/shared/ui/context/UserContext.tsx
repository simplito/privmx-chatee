'use client';

import React, { ReactNode, createContext, useContext, useReducer } from 'react';

export type UserStatus = 'logged-in' | 'logged-out';

export interface UserContextType {
    userStatus: UserStatus;
    username: string;
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
        username: string;
        isStaff: boolean;
    };
}

interface SignOutAction {
    type: UserContextActionTypes.SIGN_OUT;
}

type Action = SignInAction | SignOutAction;

const initialState: UserContextType = {
    userStatus: 'logged-out',
    username: '',
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
                username: action.payload.username,
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
