import {
    Connection,
    CryptoApi,
    Endpoint,
    EventQueue,
    InboxApi,
    StoreApi,
    ThreadApi
} from '@simplito/privmx-webendpoint';
import {
    ConnectionEventsManager,
    EventManager,
    StoreEventsManager,
    ThreadEventsManager
} from '@simplito/privmx-webendpoint/extra';

export class EndpointConnectionManager {
    private static connection: Connection;
    private static threadApi: Promise<ThreadApi>;
    private static storeApi: Promise<StoreApi>;
    private static inboxApi: Promise<InboxApi>;
    private static cryptoApi: Promise<CryptoApi>;
    private static eventQueue: Promise<EventQueue>;
    private static eventManager: Promise<EventManager>;
    private static threadEventManager: Promise<ThreadEventsManager>;
    private static storeEventManager: Promise<StoreEventsManager>;
    private static connectionEventManager: Promise<ConnectionEventsManager>;
    private static isSetup = false;

    static async getConnection() {
        if (!this.connection) {
            throw new Error('No active connection');
        }
        return this.connection;
    }

    static async getEventManager() {
        if (this.eventManager) {
            return this.eventManager;
        }

        this.eventManager = (async () => {
            const eventQueue = await this.getEventQueue();
            return EventManager.startEventLoop(eventQueue);
        })();

        return await this.eventManager;
    }

    static async getStoreEventManager() {
        if (this.storeEventManager) {
            return this.storeEventManager;
        }

        this.storeEventManager = (async () => {
            const eventManager = await this.getEventManager();
            return eventManager.getStoreEventManager(await this.getStoreApi());
        })();

        return this.storeEventManager;
    }

    static async getConnectionEventManager() {
        if (this.connectionEventManager) {
            return this.connectionEventManager;
        }

        this.connectionEventManager = (async () => {
            const eventManager = await this.getEventManager();
            const connection = await this.getConnection();
            const connectionId = (await connection.getConnectionId()) as unknown as string;
            const connectionEventManager = eventManager.getConnectionEventManager(connectionId);

            return connectionEventManager;
        })();

        return this.connectionEventManager;
    }

    static async getThreadEventManager() {
        if (this.threadEventManager) {
            return this.threadEventManager;
        }

        this.threadEventManager = (async () => {
            const eventManager = await this.getEventManager();
            const threadApi = await this.getThreadApi();
            const threadEventManager = eventManager.getThreadEventManager(threadApi);

            return threadEventManager;
        })();

        return this.threadEventManager;
    }

    static async getEventQueue() {
        if (this.eventQueue) {
            return this.eventQueue;
        }

        if (!this.isSetup) {
            await this.setup();
        }
        this.eventQueue = (async () => {
            return Endpoint.getEventQueue();
        })();

        return this.eventQueue;
    }

    static async connect(privateKey: string, solutionId: string, bridgeUrl: string) {
        await this.setup();
        this.connection = await Endpoint.connect(privateKey, solutionId, bridgeUrl);

        if (!this.connection) {
            throw new Error('ERROR: Could not connect to bridge');
        }

        return this.connection;
    }

    static getThreadApi() {
        if (!this.threadApi) {
            this.threadApi = (async () => {
                const connection = await this.getConnection();
                return Endpoint.createThreadApi(connection);
            })();
        }
        return this.threadApi;
    }

    static getStoreApi() {
        if (!this.storeApi) {
            this.storeApi = (async () => {
                const connection = await this.getConnection();
                return Endpoint.createStoreApi(connection);
            })();
        }
        return this.storeApi;
    }

    static getInboxApi() {
        if (!this.inboxApi) {
            this.inboxApi = (async () => {
                const connection = await this.getConnection();
                const threadApi = await this.getThreadApi();
                const storeApi = await this.getStoreApi();
                return Endpoint.createInboxApi(connection, await threadApi, await storeApi);
            })();
        }
        return this.inboxApi;
    }

    static getCryptoApi() {
        if (!this.cryptoApi) {
            this.cryptoApi = (async () => {
                await this.setup();
                return Endpoint.createCryptoApi();
            })();
        }
        return this.cryptoApi;
    }

    static async setup() {
        if (!this.isSetup) {
            await Endpoint.setup('/wasm-assets');
            this.isSetup = true;
        }
    }
}
