import { Connection, Graph } from './types';

export const CHANGE_THREAD_EVENT: Partial<Connection<'status'>> = {
    CHANGE_THREAD: 'Loading'
};

export const NEXT_STATE_GRAPH: Graph<'status'> = {
    Loading: {
        ...CHANGE_THREAD_EVENT,

        SETTLE: 'Idle',
        SETTLE_MESSAGE: 'Stale',
        NEW_MESSAGE: 'Loading',
        FETCH_NEXT_PAGE: 'Loading',
        DELETE_MESSAGE: 'Loading'
    },
    Idle: {
        ...CHANGE_THREAD_EVENT,

        START_FETCHING: 'Loading',
        INVALIDATE: 'Stale',
        SETTLE: 'Idle',
        SETTLE_MESSAGE: 'Stale',
        NEW_MESSAGE: 'Loading',
        FETCH_NEXT_PAGE: 'Loading',
        DELETE_MESSAGE: 'Stale'
    },
    Initial: {
        ...CHANGE_THREAD_EVENT,
        SETTLE: 'Idle'
    },
    Stale: {
        ...CHANGE_THREAD_EVENT,

        START_FETCHING: 'Loading',
        SETTLE: 'Idle',
        INVALIDATE: 'Stale',
        SETTLE_MESSAGE: 'Stale',
        NEW_MESSAGE: 'Loading',
        DELETE_MESSAGE: 'Stale',
        FETCH_NEXT_PAGE: 'Loading'
    },
    None: {
        ...CHANGE_THREAD_EVENT,
        INITIALIZE: 'Initial',
        START_FETCHING: 'Loading'
    }
};

export const NEXT_IS_FETCHING_GRAPH: Graph<'isFetchingNextPage'> = {
    Stale: {
        FETCH_NEXT_PAGE: true
    },
    Loading: {
        SETTLE: false
    },
    Idle: {
        FETCH_NEXT_PAGE: true
    },
    Initial: {},
    None: {}
};
