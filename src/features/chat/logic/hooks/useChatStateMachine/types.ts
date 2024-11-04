import { ChatMessage } from '@chat/logic/messages-system/types';

export type Graph<Field extends keyof State> = Record<State['status'], Partial<Connection<Field>>>;

export type State =
    | {
          threadId: string;
          isFetchingNextPage: boolean;
          status: 'Stale';
          messages: ChatMessage[];
          pendingMessages: ChatMessage[];
      }
    | {
          status: 'Loading';
          isFetchingNextPage: boolean;
          messages: ChatMessage[];
          pendingMessages: ChatMessage[];
      }
    | {
          status: 'Idle';
          isFetchingNextPage: boolean;
          messages: ChatMessage[];
          pendingMessages: ChatMessage[];
      }
    | {
          status: 'Initial';
          isFetchingNextPage: boolean;
          messages?: ChatMessage[];
          pendingMessages?: never;
      }
    | {
          status: 'None';
          isFetchingNextPage?: never;
          messages?: undefined;
          pendingMessages?: never;
      };

// eslint-disable-next-line no-unused-vars
export type EffectCallback = (state: State) => void;

export type Event =
    | {
          type: 'SETTLE';
          newMessages?: ChatMessage[];
          effect?: undefined;
      }
    | {
          type: 'SETTLE_MESSAGE';
          newMessage: ChatMessage;
          effect?: EffectCallback;
      }
    | { type: 'START_FETCHING'; effect?: EffectCallback; newMessages?: ChatMessage[] | undefined }
    | { type: 'NEW_MESSAGE'; newMessage: ChatMessage; effect?: EffectCallback }
    | { type: 'FETCH_NEXT_PAGE'; effect?: EffectCallback }
    | {
          type: 'CHANGE_THREAD';
          threadId: string | undefined;
          effect: EffectCallback;
          newMessages?: ChatMessage[] | undefined;
      }
    | { type: 'INVALIDATE'; effect?: EffectCallback; newMessages: ChatMessage[] | undefined }
    | { type: 'INITIALIZE'; effect: EffectCallback }
    | {
          type: 'DELETE_MESSAGE';
          deletedMessage: {
              messageId: string;
              chatId: string;
          };
          effect?: EffectCallback;
      };

export type Connection<Field extends keyof State> = Record<
    Event['type'],
    | State[Field]
    | {
          target: State[Field];
          // eslint-disable-next-line no-unused-vars
          guard: (state: State) => boolean;
      }[]
>;
