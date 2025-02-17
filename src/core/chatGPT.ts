import { v1 } from 'jsr:@std/uuid';
import { ModelType } from './types/index.ts';
import { MessageFactory } from './factories/messageFactory.ts';
import { MessageMetaFactory } from './factories/messageMetaFactory.ts';
import { MessagePayloadFactory } from './factories/messagePayloadFactory.ts';
import { TokenSolver, ChatGPTRequireTokens } from './utils/tokens/index.ts';
import { ResponseStreamParser } from './utils/responseParser.ts';
import { CookieParams } from './utils/cookieParams.ts';

import type { 
    Message,
    InstructionMessageMeta,
    Conversation,
    ConversationDetailVO,
    ConversationListItem,
    ConversationListItemVO,
    CreateMessagePayload,
    RecreateMessagePayload,
} from './types/index.ts';
import type { ResponseStreamParseResult } from './utils/index.ts';

export interface ChatGPTConfiguration {
    token:  string;
    cookie: string;
}

export interface ChatGPTCreateMessageOptions {
    conversationId?:    string;
    parent?:            string;
    model?:             ModelType;
    customInstruction?: {
        profile:        string;
        instruction:    string;
    }
}

export interface ChatGPTRecreateMessageOptions extends ChatGPTCreateMessageOptions {
    conversationId: string;
    parent:         string;
    messageId:      string;
}

export interface FetchMemoriesResult {
    memories:           Array<{ id: string, content: string, updated_at: string }>;
    memory_max_tokens:  number;
    memory_num_tokens:  number;
}

export class ChatGPT {
    static readonly BASE_API_URL = 'https://chatgpt.com/backend-api/';

    private readonly headers: Record<string, string> = {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0'
    };

    private readonly cookies: CookieParams;

    private readonly deviceId = v1.generate();

    constructor(config: ChatGPTConfiguration) {
        if (!config.token || !config.cookie) throw new Error('Token and cookie are required');

        this.cookies = new CookieParams(config.cookie);
        this.cookies.set('oai-device-id', this.deviceId);

        this.headers = {
            ...this.headers,
            authorization:      `Bearer ${config.token}`,
            cookie:             this.cookies.toString(),
            'Oai-Device-Id':    this.deviceId
        };
    }

    public async getTokens(): Promise<ChatGPTRequireTokens> {
        const tokenSolver = new TokenSolver(this.headers);
        return await tokenSolver.getTokens();
    }

    public async fetchResetTime(): Promise<Date | null> {
        const url = new URL('conversation/init', ChatGPT.BASE_API_URL);

        const headers = {
            ...this.headers,
            'accept': 'application/json',
            'content-type': 'application/json'
        }

        const res = await fetch(url, { 
            method: 'POST',
            headers,
            body:   JSON.stringify({})
        });
        if (!res.ok) throw new Error('Failed to get reset time: ' + await res.text());

        const data: { model_limits: Array<{ model_slug: string, resets_after: string }> } = await res.json();

        const resetAfter = data.model_limits.find((model) => model.model_slug === ModelType.GPT4o)?.resets_after;
        if (!resetAfter) {
            console.log('No reset time found');
            return null;
        }

        return new Date(resetAfter);
    }

    public async fetchMemories(): Promise<FetchMemoriesResult> {
        const url = new URL('memories', ChatGPT.BASE_API_URL);

        const res = await fetch(url, { headers: this.headers });
        if (!res.ok) throw new Error('Failed to fetch memories');

        const data = await res.json();
        return data as FetchMemoriesResult;
    }

    public async getConversations(): Promise<ConversationListItem[]> {
        const url = new URL('conversations', ChatGPT.BASE_API_URL);
        url.searchParams.set('offset', '0');
        url.searchParams.set('limit', '20');
        url.searchParams.set('order', 'updated');

        const res = await fetch(url, { headers: this.headers });
        if (!res.ok) throw new Error('Failed to get conversations');

        const conversationVOs: ConversationListItemVO[] = (await res.json())['items'];
        return conversationVOs.map((conversationVO) => ({
            conversationId: conversationVO.id,
            title:          conversationVO.title
        }));
    }

    public async getConversation(conversationId: string): Promise<Conversation> {
        const url = new URL(`conversation/${conversationId}`, ChatGPT.BASE_API_URL);

        const res = await fetch(url, { headers: this.headers });
        if (!res.ok) throw new Error('Failed to get conversation');

        const conversationVO: ConversationDetailVO = await res.json();

        const messages: Record<string, Message> = {};
        for (const id in conversationVO.mapping) {
            const conversation = conversationVO.mapping[id];
            messages[id] = MessageFactory.createMessage({ 
                id,
                data:       conversation.message?.content?.parts?.[0] as string,
                role:       conversation.message?.author?.role,
                parent:     conversation.parent,
                children:   conversation.children
            });
        }

        return {
            conversationId:     conversationVO.conversation_id,
            title:              conversationVO.title,
            currentMessageId:   conversationVO.current_node,
            messages
        }
    }

    public async deleteConversation(conversationId: string): Promise<void> {
        const url = new URL(`conversation/${conversationId}`, ChatGPT.BASE_API_URL);

        const headers = {
            ...this.headers,
            'accept': 'application/json',
            'content-type': 'application/json'
        };

        const res = await fetch(url, { 
            method: 'PATCH', 
            headers,
            body:   JSON.stringify({ is_visible: false })
        });
        if (!res.ok) throw new Error('Failed to delete conversation: ' + await res.text());
    }

    private async fetchMessage(payload: CreateMessagePayload | RecreateMessagePayload, _options?: ChatGPTCreateMessageOptions): Promise<ReadableStream<Uint8Array>> {
        const url = new URL('conversation', ChatGPT.BASE_API_URL);

        const { chatRequirementsToken, proofToken, turnstileToken } = await this.getTokens();
        const headers = {
            ...this.headers,
            'accept': 'event-stream',
            'content-type': 'application/json',
            'openai-sentinel-chat-requirements-token':  chatRequirementsToken,
            'openai-sentinel-proof-token':              proofToken,
            'openai-sentinel-turnstile-token':          turnstileToken,
        };

        const res = await fetch(url, {
            method: 'POST',
            headers,
            body:   JSON.stringify(payload)
        });
        if (!res.ok || !res.body) {
            if (res.status === 429) {
                const resetTime = await this.fetchResetTime();
                throw new Error('Rate limited. Reset time: ' + resetTime);
            }

            const text = await res.text();
            throw new Error('Failed to create message. Status: ' + res.status + ' ' + text);
        }

        return res.body;
    }

    public async createMessage(message: string, options?: ChatGPTCreateMessageOptions): Promise<AsyncGenerator<ResponseStreamParseResult>> {
        const { model = ModelType.GPT4oMini } = options || {};
        if (options && ('conversationId' in options !== 'parent' in options)) {
            throw new Error('Both conversationId and parent are required or neither');
        }

        const conversationId    = options && 'conversationId' in options ? options.conversationId : undefined;
        const parent            = (options && 'parent' in options ? options.parent : null) || v1.generate();

        let instructionMeta: InstructionMessageMeta | undefined;
        if (options?.customInstruction) {
            instructionMeta = MessageMetaFactory.createInstructionMessageMeta({
                id: v1.generate(),
                ...options.customInstruction
            });
        }

        const userMessage = MessageFactory.createMessage({
            id:     v1.generate(),
            data:   message,
            role:   'user',
            parent
        });

        const meta = MessageMetaFactory.createUserMessageMeta({
            id:         userMessage.id,
            data:       userMessage.message.content.parts[0]
        });

        const payload = MessagePayloadFactory.createCreateMessagePayload({
            meta,
            parent: userMessage.parent,
            conversationId,
            model,
            instructionMeta
        });

        const res = await this.fetchMessage(payload, options);
        return ResponseStreamParser.parseV1EncodedStream(res);
    }

    public async recreateMessage(message: string, options: ChatGPTRecreateMessageOptions): Promise<AsyncGenerator<ResponseStreamParseResult>> {
        const { model = ModelType.GPT4oMini } = options || {};

        const userMessage = MessageFactory.createMessage({
            id:     options.messageId,
            data:   message,
            role:   'user',
            parent: options.parent
        });

        const meta = MessageMetaFactory.createUserMessageMeta({
            id:         userMessage.id,
            data:       userMessage.message.content.parts[0]
        });

        const payload = MessagePayloadFactory.createRecreateMessagePayload({
            meta,
            parent:         userMessage.parent,
            conversationId: options.conversationId,
            model
        });

        const res = await this.fetchMessage(payload, options);
        return ResponseStreamParser.parseV1EncodedStream(res);
    }
}