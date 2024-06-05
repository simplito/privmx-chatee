import { EndpointEventManager } from '@privmx/endpoint-web';

export function EndpointTryCatch(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
): void {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        try {
            return await originalMethod.apply(this, args);
        } catch (error) {
            EndpointEventManager.dispatchEvent({
                type: 'libPlatformDisconnected',
                data: {
                    type: 'time-out'
                }
            });
        }
    };
}
