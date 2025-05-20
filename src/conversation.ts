import { ChatGPTAPI, ModelType } from './core/index.ts';
import { MessageFactory } from './core/factories/messageFactory.ts';

import type {
    Message,
    Conversation as IConversation,
    ImageMeta
} from './core/index.ts';
import type { ResponseStreamParseResult } from './core/index.ts';

export interface CreateMessageOptions {
    parent?:        string;
    model?:         ModelType;
    attachments?:   Array<string | Omit<ImageMeta, 'mime_type'>>;
    temporary?:     boolean; 
}

export interface RecreateMessageOptions {
    message?:           string;
    messageId?:         string;
    model?:             ModelType;
    attachments?:       Array<string | Omit<ImageMeta, 'mime_type'>>;
    removeAttachments?: boolean;
}

export class Conversation implements IConversation {
    public readonly conversationId: string;
    public readonly title:          string;
    public readonly messages:       Record<string, Message>;
    public currentMessageId:        string;
    public readonly rootMessage:    Message;

    private readonly api: ChatGPTAPI;
    public readonly isTemporary:    boolean;

    constructor(api: ChatGPTAPI, meta: IConversation) {
        this.api = api;
        this.isTemporary        = meta.isTemporary ?? false;

        this.conversationId     = meta.conversationId;
        this.title              = meta.title ?? '';
        this.messages           = meta.messages ?? {};
        this.currentMessageId   = meta.currentMessageId ?? '';
        
        const rootMessageId = Object.keys(this.messages).find(key => this.messages[key].parent === null) as string;
        this.rootMessage = this.messages[rootMessageId];
    }

    get mostRecentMessage(): Message {
        return this.messages[this.currentMessageId];
    }

    get mostRecentUserMessage(): Message {
        let currentMessage = this.mostRecentMessage;
        while (currentMessage.message.author.role !== 'user') {
            currentMessage = this.messages[currentMessage.parent as string];
        }

        return currentMessage;
    }

    public getAttachments(messageId: string): ImageMeta[] {
        return this.messages[messageId].message.metadata?.attachments || [];
    }

    public appendMessage(message: Message) {
        this.messages[message.id]   = message;
        this.currentMessageId       = message.id;

        const parentId  = message.parent;
        const parent    = parentId ? this.messages[parentId] : null;
        if (parent) {
            parent.children.push(message.id);
        }
    }

    public async *createMessage(message: string, options?: CreateMessageOptions): AsyncGenerator<ResponseStreamParseResult> {
        const { parent = this.mostRecentMessage?.id } = options || {};

        const attachments   = await this.api.createAttachments(options?.attachments || []);
        const stream        = await this.api.createMessage(message, { ...options, conversationId: this.conversationId, parent, attachments }, this.isTemporary);

        for await (const { meta, part } of stream) {
            if (meta?.completed) {
                const lastId = meta.completedMessages[0].parent;
                if (lastId) {
                    const userMessage = MessageFactory.createMessage({ 
                        id:         lastId, 
                        data:       message, 
                        role:       'user', 
                        parent:     this.mostRecentMessage?.id, 
                        attachments 
                    });
                    this.appendMessage(userMessage);
                }

                for (let i = 0; i < meta.completedMessages.length; i++) {
                    this.appendMessage(meta.completedMessages[i]);
                }
            }

            yield { meta, part } as ResponseStreamParseResult;
        }
    }

    public async *recreateMessage(options?: RecreateMessageOptions) {
        const { messageId = this.mostRecentUserMessage.id } = options || {};
        if (this.messages[messageId].message.author.role !== 'user') throw new Error('Only user messages can be recreated');

        const userMessage = this.messages[messageId];
        const lastAssistantMessage = this.messages[this.messages[messageId].parent as string];

        const message = options?.message || userMessage.message.content.parts?.find(part => typeof part === 'string') || '';

        const attachments = await (async () => {
            const attachments = options?.removeAttachments ? [] : this.getAttachments(messageId);
            if (options?.attachments) {
                attachments.push(...await this.api.createAttachments(options.attachments));
            }
            return attachments;
        })();
        const stream = await this.api.recreateMessage(message as string, { ...options, conversationId: this.conversationId, parent: lastAssistantMessage.id, messageId, attachments });
    
        for await (const { meta, part } of stream) {
            if (meta?.completed) {
                const lastId = meta.completedMessages[0].parent;
                if (lastId) {
                    const userMessage = MessageFactory.createMessage({ 
                        id:         lastId, 
                        data:       message,
                        role:       'user', 
                        parent:     lastAssistantMessage.id,
                        attachments 
                    });
                    this.appendMessage(userMessage);
                }

                for (let i = 0; i < meta.completedMessages.length; i++) {
                    this.appendMessage(meta.completedMessages[i]);
                }
            }

            yield { meta, part } as ResponseStreamParseResult;
        }
    }

    public getMostRecentMessages(k: number): Message[] {
        const messageStack: Message[] = [];

        let currentMessage = this.messages[this.currentMessageId];
        for (let i = 0; i < k; ) {
            if (!currentMessage) break;

            if (currentMessage.message.author.role !== 'system') {
                messageStack.push(currentMessage);
                i++;
            }

            currentMessage = this.messages[currentMessage.parent as string];
        }

        return messageStack;
    }

    public traverse(messageId: string = this.rootMessage.id, filter?: (message: Message) => boolean): Message[] {
        if (!filter) filter = () => true;
        
        const _traverse = (current: Message, tree: Message[]) => {
            if (filter(current)) tree.push(current);
            
            for (const child of current.children) {
                _traverse(this.messages[child], tree);
            }
        }

        const tree: Message[] = [];

        const current = this.messages[messageId];
        _traverse(current, tree);

        return tree;
    }

    public toObject(): IConversation {
        return {
            conversationId: this.conversationId,
            title:          this.title,
            messages:       this.messages,
            currentMessageId: this.currentMessageId
        }
    }
}