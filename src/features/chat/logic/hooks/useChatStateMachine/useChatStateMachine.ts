import { useReducer } from 'react';
import { NEXT_STATE_GRAPH, NEXT_IS_FETCHING_GRAPH } from './constants';
import { getNextMessages, toEventObj } from './helpers';
import type { Event, State } from './types';

function reducer(state: State, event: Event): State {
    const { type } = event;
    const newState = { ...state };

    let possibleNextStatus = NEXT_STATE_GRAPH[state.status][type];
    const possibleNextIsFetchingStatus = NEXT_IS_FETCHING_GRAPH[state.status][type] as boolean;

    if (!possibleNextStatus) return state;

    const effect = event.effect;
    if (effect) {
        effect(state);
    }

    const [messages, pendingMessages] = getNextMessages(state, event);
    newState.messages = [...(messages || [])];
    newState.pendingMessages = pendingMessages;

    const connectionTargets = toEventObj(possibleNextStatus);
    for (const target of connectionTargets) {
        if (target.guard(newState)) {
            newState.status = target.target;
            break;
        }
    }

    if (possibleNextIsFetchingStatus !== undefined) {
        newState.isFetchingNextPage = possibleNextIsFetchingStatus;
    }

    return newState;
}

export function useChatStateMachine() {
    const machine = useReducer(reducer, { status: 'None' });
    return machine;
}
