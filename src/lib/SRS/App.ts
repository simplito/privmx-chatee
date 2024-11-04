import { AppEventBus } from '@srs/AppBus';
import { AppContext } from '@srs/AppContext';

export interface Resource {
    bind: (ctx: AppContext, bus: AppEventBus) => Resource;

    getName(): string;
}

export interface Service {
    bind: (ctx: AppContext, bus: AppEventBus) => Service;

    getName(): string;
}

export interface BindInfo {
    resources: Map<string, Resource>;
    services: Map<string, Service>;
    bus: AppEventBus;
    ctx: AppContext;
}

export interface System {
    bind: (bindInfo: BindInfo) => System;

    getName(): string;
}

export class App {
    private _resources: Map<string, Resource> = new Map();
    private _services: Map<string, Resource> = new Map();
    private _ctx: AppContext;
    private _bus: AppEventBus;

    public systems: Map<string, System> = new Map();

    public get eventBus() {
        return this._bus;
    }

    public get context() {
        return this._ctx;
    }

    addResource(resource: Resource) {
        if (!this._resources.has(resource.getName())) {
            resource.bind(this._ctx, this._bus);
            this._resources.set(resource.getName(), resource);
        } else {
            throw Error(
                `[Invalid State]: Resource with given name already exists ${resource.getName()}`
            );
        }
        return this;
    }

    addService(service: Service) {
        if (!this._services.has(service.getName())) {
            service.bind(this._ctx, this._bus);
            this._services.set(service.getName(), service);
        } else {
            throw Error(
                `[Invalid State]: Service with given name already exists ${service.getName()}`
            );
        }
        return this;
    }

    addSystem(system: System) {
        if (!this._resources.has(system.getName())) {
            system.bind({
                resources: this._resources,
                bus: this._bus,
                ctx: this._ctx,
                services: this._services
            });
            this.systems.set(system.getName(), system);
        } else {
            throw Error(
                `[Invalid State]: Resource with given name already exists ${system.getName()}`
            );
        }
        return this;
    }

    mountEventBus(bus: AppEventBus) {
        if (!this._ctx) {
            this._bus = bus;
        } else {
            throw Error(`[Invalid State]: App mounted with more than one event bus`);
        }
        return this;
    }

    mountContext(ctx: AppContext) {
        if (!this._ctx) {
            this._ctx = ctx;
        } else {
            throw Error(`[Invalid State]: App mounted with more than one context`);
        }
        return this;
    }
}
