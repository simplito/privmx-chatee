import { UserJwt } from '@/shared/utils/jwt';

export function generateGetMeResponse(userJwt: UserJwt) {
    return { ...userJwt };
}

export type GetMeResponse = ReturnType<typeof generateGetMeResponse>;
