import { UserStatus } from '@/shared/ui/context/UserContext';

export interface AppUserContext {
    userStatus: UserStatus;
    token: string;
    contextId: string;
    username: string;
    publicKey: string;
    isStaff: boolean;
}

export class AppContext {
    private _user: AppUserContext;

    get user() {
        return this._user;
    }

    set user(user: AppUserContext) {
        this._user = user;
    }

    clear() {
        this._user = null;
    }
}
