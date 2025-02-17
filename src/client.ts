import 'jsr:@std/dotenv/load';
import { ChatGPT } from './core/index.ts';
import { Conversation, CreateMessageOptions } from './conversation.ts';

export type CreateConversationReturnType = 'message' | 'conversation';
export interface CreateConversationOptions<T extends CreateConversationReturnType = 'conversation'> extends CreateMessageOptions {
    customInstruction?: {
        profile?:       string;
        instruction?:   string;
    }
    returnType?: T;
}

export class ChatGPTClient {
    private readonly token:     string;
    private readonly cookie:    string;

    private readonly api: ChatGPT;

    constructor({ token, cookie }: { token: string, cookie: string }) {
        if (!token || !cookie) throw new Error('Token and cookie are required');

        this.token  = token;
        this.cookie = cookie;

        this.api = new ChatGPT({ token, cookie });
    }

    public async getResetTime() {
        return await this.api.fetchResetTime();
    }

    public async getMemories() {
        return await this.api.fetchMemories();
    }

    public async getConversations() {
        return await this.api.getConversations();
    }

    public async getConversation(conversationId: string) {
        const conversation = await this.api.getConversation(conversationId);

        return new Conversation(this.api, conversation);
    }

    public async *createConversationStream(message: string, options?: CreateMessageOptions) {
        const stream = await this.api.createMessage(message, { ...options });

        for await (const chunk of stream) {
            yield chunk;
        }
    }

    public createConversation(greet: string, options: CreateConversationOptions<'conversation'>): Promise<Conversation>;
    public createConversation(greet: string, options: CreateConversationOptions<'message'>): Promise<ReturnType<ChatGPTClient['createConversationStream']>>;
    public async createConversation(greet: string, options?: CreateConversationOptions<'conversation' | 'message'>): Promise<Conversation | ReturnType<ChatGPTClient['createConversationStream']>> {
        const stream = this.createConversationStream(greet, options);

        if (options?.returnType === 'message') {
            return stream;
        }

        for await (const { meta } of stream) {
            if (meta && meta.completed) {
                const conversationId    = meta.conversationId;
                const conversation      = await this.getConversation(conversationId);
                return conversation;
            }
        }

        throw new Error('Failed to create conversation');
    }

    public async deleteConversation(conversationId: string) {
        if (!conversationId) throw new Error('Conversation ID is required');
        await this.api.deleteConversation(conversationId);
    }

    public async deleteConversations() {
        await this.api.deleteConversation('');
    }
}
