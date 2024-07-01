export { getDomainsHandler } from './getDomains';
export { newDomainHandler } from './newDomain';

export { getInviteTokenHandler } from './getInviteToken';

export type {
    NewDomainRequestBody,
    NewDomainResponse,
    DomainsResponse,
    InviteTokenRequestBody,
    InviteTokenResponse
} from './utils';

export {
    generateNewDomainResponse,
    newDomainRequestBodySchema,
    InviteTokenRequestSchema,
    generateDomainsResponse,
    generateInviteTokenRespose
} from './utils';
