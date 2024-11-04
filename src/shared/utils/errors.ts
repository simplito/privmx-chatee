export const API_ERRORS = {
    BAD_REQUEST: { message: 'Bad request', errorCode: 1 },
    INVALID_OWNER_TOKEN: { message: 'Invalid owner token', errorCode: 2 },
    UNEXPECTED: { message: 'Unexpected error', errorCode: 3 },
    INVALID_CREDENTIALS: { message: 'Invalid Credentials', errorCode: 4 },
    UNAUTHORIZED: { message: 'Unauthorized access', errorCode: 5 },
    EXPIRED_NONCE: { message: 'Nonce is expired', errorCode: 6 },

    //DOMAINS #200
    DOMAIN_IN_USE: { message: 'Given domain already exists', errorCode: 200 },
    DOMAIN_BLOCKED: { message: 'Domain Blocked', errorCode: 201 },
    INVALID_DOMAIN: { message: "Domain doesn't exist", errorCode: 202 },
    INVALID_PERIOD: { message: 'Newer access period already exists', errorCode: 203 },
    NO_ACCESS_PERIOD: { message: 'No active access period', errorCode: 204 },

    //Invitation Tokens #300
    INVALID_TOKEN: { message: 'Invalid token', errorCode: 300 },
    TOKENS_DONT_MATCH: { message: "Tokens don't match", errorCode: 301 },

    //Users
    USER_IN_USE: { message: 'User already exists', errorCode: 400 },
    FAIL_ROLE_UPDATE: { message: 'Failed to update users role', errorCode: 401 }
} as const;

export type API_ERROR_DATA = (typeof API_ERRORS)[keyof typeof API_ERRORS];
