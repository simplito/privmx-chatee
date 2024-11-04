import { BindInfo, System } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import {
    ChatFileMessage,
    ChatMessage,
    ChatTextMessage,
    ThreadFileService,
    ThreadFilesResource,
    ThreadMessageResource,
    ThreadMessageService,
    ThreadResource
} from '@chat/logic';

export class MessagesSystem implements System {
    private ctx: AppContext;

    private messagesPerPage = 100;
    private attachmentsPerPage = 30;

    private threadResource: ThreadResource;
    private messageResource: ThreadMessageResource;
    private messageService: ThreadMessageService;
    private fileResource: ThreadFilesResource;
    private fileService: ThreadFileService;

    getName = () => 'MessageSystem';

    bind({ resources, ctx, services, bus }: BindInfo): System {
        this.ctx = ctx;
        if (resources.has('ThreadResource')) {
            this.threadResource = resources.get('ThreadResource') as ThreadResource;
        }
        if (resources.has('FilesResource')) {
            this.fileResource = resources.get('FilesResource') as ThreadFilesResource;
        }
        if (resources.has('MessageResource')) {
            this.messageResource = resources.get('MessageResource') as ThreadMessageResource;
        }
        if (services.has('MessageService')) {
            this.messageService = services.get('MessageService') as ThreadMessageService;
        }
        if (services.has('FilesService')) {
            this.fileService = services.get('FilesService') as ThreadFileService;
        }
        return this;
    }

    createPendingTextMessage(chatId: string, text: string): ChatTextMessage {
        const pendingId = crypto.randomUUID();
        return {
            author: this.ctx.user.username,
            pendingId,
            text,
            chatId,
            messageId: '',
            mimetype: 'text',
            status: 'pending',
            sentDate: Date.now()
        } satisfies ChatTextMessage;
    }

    createPendingFileMessage(chatId: string, file: File): ChatMessage {
        const pendingId = crypto.randomUUID();
        return {
            author: this.ctx.user.username,
            pendingId,
            chatId,
            messageId: '',
            mimetype: 'file',
            status: 'pending',
            sentDate: Date.now(),
            fileName: file.name,
            fileId: ''
        } satisfies ChatFileMessage;
    }

    async sendMessage(
        message: { chatId: string; pendingId: string } & (
            | { mimetype: 'file'; file: File }
            | {
                  mimetype: 'text';
                  text: string;
              }
        )
    ) {
        if (message.mimetype === 'text') {
            await this.messageService.sendTextMessage(
                message.chatId,
                message.text,
                message.pendingId
            );
        } else if (message.mimetype === 'file') {
            const storeId = await this.threadResource.getThreadStoreId(message.chatId);

            const attachmentMeta = await this.fileService.sendAttachment({
                file: message.file,
                chatId: message.chatId,
                storeId
            });
            await this.messageService.sendFileMessage({
                chatId: message.chatId,
                pendingId: message.pendingId,
                storeId: storeId,
                attachmentId: attachmentMeta.attachmentId,
                attachmentName: attachmentMeta.attachmentName
            });
        } else {
            throw new Error(
                `Invalid state: message type ${(message as any)?.mimetype} not supported`
            );
        }
    }

    async getPageMessages(chatId: string, page: number) {
        const messageList = await this.messageResource.getMessages(chatId, page);
        const hasMoreMessages = messageList.messages.length === this.messagesPerPage;
        return { messages: messageList.messages, hasMoreMessages, total: messageList.total };
    }

    async getChatFiles(chatId: string, page: number) {
        const storeId = await this.threadResource.getThreadStoreId(chatId);
        const attachmentsList = await this.fileResource.getChatFiles({ storeId, chatId }, page);
        const hasMore = attachmentsList.assets.length === this.attachmentsPerPage;

        return {
            attachments: attachmentsList.assets,
            hasMoreAttachments: hasMore,
            total: attachmentsList.total
        };
    }

    async deleteMessage(messageId: string) {
        await this.messageService.deleteMessage(messageId);
    }

    async downloadAttachment(attachment: { attachmentId: string; name: string }) {
        await this.fileService.downloadAttachment(attachment.attachmentId, attachment.name);
    }
}
