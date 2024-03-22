import { verifyJwt } from './jwt';

export function getTokenFromRequest(request: Request) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (token) {
        return token;
    }

    return null;
}

export function isStaffMember(request: Request) {
    const token = getTokenFromRequest(request);

    if (!token) {
        return false;
    }

    const verifiedToken = verifyJwt(token);

    if (!verifiedToken) {
        return false;
    }

    return verifiedToken.isStaff;
}
