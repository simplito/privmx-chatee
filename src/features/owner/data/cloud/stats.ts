'use server';

import { getDomainByName } from '@domains/data';
import { ACCESS_TOKEN, CLOUD_URL, INSTANCE_ID } from '@utils/env';

export type Bucket = {
    bucketId: number;
    instanceId: string;
    requests: number;
    errors: number;
    executionTime: number;
    inTraffic: number;
    outTraffic: number;
    maxTime: number;
    minTime: number;
};

export type CloudStatsSuccess = {
    jsonrpc: '2.0';
    id: number;
    result: {
        count: number;
        list: Bucket[];
    };
};

export type CloudStatsResponse =
    | CloudStatsSuccess
    | {
          jsonrpc: '2.0';
          id: number;
          error: { code: number; message: string; data: null };
      };

export const getCloudStats = async (domainName: string) => {
    try {
        const domain = await getDomainByName(domainName);

        if (!domain) {
            return null;
        }

        const response = await fetch(CLOUD_URL, {
            method: 'POST',
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 128,
                method: 'instance/getApiUsage',
                params: {
                    from: 0,
                    to: Date.now(),
                    instanceId: INSTANCE_ID,
                    contexts: [domain.contextId],
                    skip: 0,
                    limit: 20,
                    sortOrder: 'asc',
                    aggregation: 3155692590000
                }
            }),
            headers: {
                'Content-type': 'application/json',
                'X-Access-Sig': ACCESS_TOKEN
            }
        });

        console.log({ response });

        const result: CloudStatsResponse = await response.json();

        console.log({ result });
        if (Object.hasOwn(result, 'result')) {
            return result as CloudStatsSuccess;
        }

        return null;
    } catch (e) {
        console.log(e);
        return null;
    }
};
