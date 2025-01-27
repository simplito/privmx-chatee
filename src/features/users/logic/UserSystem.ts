import { BindInfo, System } from '@srs/App';
import { AppEventBus, UserEvent } from '@srs/AppBus';
import { AppContext, AppUserContext } from '@srs/AppContext';
import { SignInRequestBody, SignInResult } from '@/app/api/sign-in';
import { NEXT_PUBLIC_BACKEND_URL } from '@utils/env';
import { ContactsResponse } from '@/app/api/contacts';
import { InviteTokenRequestBody, InviteTokenResponse } from '@/lib/handlers/invite-tokens/schemas';
import { SetStaffRequestBody, SetStaffResponse } from '@/app/api/set-staff';
import { EndpointConnectionManager } from '@lib/endpoint-api/endpoint';

export class UserSystem implements System {
    private bus: AppEventBus;
    private ctx: AppContext;

    bind({ ctx, bus }: BindInfo) {
        this.bus = bus;
        this.ctx = ctx;
        this.registerEvents();
        return this;
    }

    private registerEvents() {
        const userEventSubscriber = UserEvent.createSubscriber('sign_out', () => {
            this.ctx.clear();
        });
        this.bus.registerSubscriber(userEventSubscriber);
    }

    static get systemName() {
        return 'UserSystem';
    }

    getName(): string {
        return UserSystem.systemName;
    }

    async signIn(username: string, password: string) {
        const cryptoApi = await EndpointConnectionManager.getCryptoApi();
        const privateKey = await cryptoApi.derivePrivateKey(username, password);
        const publicKey = await cryptoApi.derivePublicKey(privateKey);

        const signature = await cryptoApi.signData(Buffer.from(username), privateKey);

        const signInRequest: SignInRequestBody = {
            username,
            sign: Buffer.from(signature).toString('hex')
        };

        const signInResponse = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/sign-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signInRequest)
        });
        const result: SignInResult = await signInResponse.json();

        if ('errorCode' in result) {
            switch (result.errorCode) {
                case 1:
                case 3:
                    throw Error('error');
                case 4:
                    throw Error('invalid-credentials');
            }
        }

        await EndpointConnectionManager.connect(
            privateKey,
            result.cloudData.solutionId,
            result.cloudData.platformUrl
        );

        const userContext = {
            userStatus: 'logged-in',
            token: result.token,
            contextId: result.cloudData.contextId,
            username,
            publicKey,
            isStaff: result.isStaff
        } satisfies AppUserContext;

        this.ctx.user = userContext;
        this.bus.emit(UserEvent.signIn(userContext));

        return userContext;
    }

    async getAllUsers() {
        const token = this.ctx.user.token;
        if (!token) {
            throw new Error('User not signed in');
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
            throw new Error('Unable to load users');
        }

        const contactsResponse: ContactsResponse = await getContactsRequest.json();
        return contactsResponse;
    }

    async createNewInviteToken(isStaff: boolean) {
        const body: InviteTokenRequestBody = {
            isStaff
        };

        const token = this.ctx.user.token;
        const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/invite-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        switch (response.status) {
            case 200: {
                const resultBody: InviteTokenResponse = await response.json();
                return resultBody;
            }
            default: {
                throw new Error('Unable to create new invite token');
            }
        }
    }

    async setUserStaffStatus(info: { username: string; isStaff: boolean }) {
        const body: SetStaffRequestBody = {
            isStaff: info.isStaff,
            username: info.username
        };

        const token = this.ctx.user.token;

        const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/set-staff`, {
            method: 'POST',
            headers: {
                'Content-Type': 'aplication/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        switch (response.status) {
            case 200:
                const responseData: SetStaffResponse = await response.json();
                return responseData;
            default:
                throw new Error('Unable to set staff status');
        }
    }
}
