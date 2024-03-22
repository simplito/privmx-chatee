export function generateDomainsResponse(domains: string[]) {
    return { domains };
}

export type DomainsResponse = ReturnType<typeof generateDomainsResponse>;
