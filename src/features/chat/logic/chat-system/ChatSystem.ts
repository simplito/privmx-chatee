import { BindInfo, System } from '@srs/App';
import { ThreadService } from '@chat/logic/chat-system/ThreadService';
import { ThreadResource } from '@chat/logic/chat-system/ThreadResource';
import { ThreadUsers } from '@chat/logic/chat-system/types';
import { AppContext } from '@srs/AppContext';

export class ChatSystem implements System {
    private threadResource: ThreadResource;
    private threadService: ThreadService;

    private context: AppContext;
    private THREADS_PER_PAGE = 100;

    bind({ resources, services, bus,ctx }: BindInfo) {
        if (resources.has('ThreadResource')) {
            this.threadResource = resources.get('ThreadResource') as ThreadResource;
        }
        if (services.has('ThreadService')) {
            this.threadService = services.get('ThreadService') as ThreadService;
        }

        this.context = ctx
        return this;
    }


    static get systemName() {
        return 'ChatSystem';
    }

    static isChatSystem(system: System): system is ChatSystem {
        return system.getName() === ChatSystem.systemName;
    }

    getName(): string {
        return ChatSystem.systemName;
    }

    async getChatList(page: number) {
        const threadsList = await this.threadResource.getThreadList(page);
        const hasMoreChats = threadsList.threads.length === this.THREADS_PER_PAGE;

        return { hasMoreChats, chats: threadsList.threads };
    }

    async createChat(chatName: string, users: ThreadUsers[]) {
        users.push({
            userId: this.context.user.username,
            publicKey: this.context.user.publicKey,
            isAdmin: true
        });

        const chat = await this.threadService.createThread({ title: chatName, users });
        return chat;
    }

    async deleteChat(chatId: string) {
        await this.threadService.deleteThread(chatId);
    }
}
