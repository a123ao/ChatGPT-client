import { EventStreamParser } from './streamParser.ts';

import type { 
    Message, 
    SystemMessageMeta, 
    UserMessageMeta, 
    AssistantMessageMeta ,
    ImageMeta
} from '../types/messages/index.ts';

// Meta recieved from the server
type ResponseMetaType = SystemMessageMeta | UserMessageMeta | AssistantMessageMeta;
type MetaChunkValue<T extends ResponseMetaType >  = { 
    message:            T & { status: 'finished_successfully' | 'in_progress' }, 
    conversation_id:    string 
};

// Chunk types
type ChunkOperation  = 'add' | 'append' | 'patch' | 'replace';
type ChunkValue      = string | BaseChunk[] | MetaChunkValue<ResponseMetaType>;

interface BaseChunk {
    p?: string;         // path
    o?: ChunkOperation; // operation
    v?: ChunkValue;     // value
    c?: number;         // count
}

interface MetaChunk<T extends ResponseMetaType> extends BaseChunk {
    v: MetaChunkValue<T>;
}

const isMetaChunk = (chunk: BaseChunk): chunk is MetaChunk<ResponseMetaType> => {
    return typeof chunk.v === 'object' && chunk.v !== null && 'message' in chunk.v;
};

const isUserMetaChunk = (chunk: MetaChunk<ResponseMetaType>): chunk is MetaChunk<UserMessageMeta> => {
    return chunk.v.message.author.role === 'user';
}

const hasAttachments = (chunk: MetaChunk<ResponseMetaType>): boolean => {
    return isUserMetaChunk(chunk) && chunk.v.message.metadata.attachments !== undefined && chunk.v.message.metadata.attachments.length > 0;
}

export type ResponseMessageMeta = Message & { 
    conversationId:     string,
    recipient:          string,
    completed:          boolean, 
    completedMessages:  Message[] 
};

export type ResponseStreamParseResult = 
    | { meta: null, part: string }
    | { meta: ResponseMessageMeta, part: null }

export class ResponseStreamParser {
    public static async *parseV1EncodedStream(stream: ReadableStream<Uint8Array>): AsyncGenerator<ResponseStreamParseResult> {
        let conversationId = '';
        let inProgress  = false; // Indicate if any message is being processed like assistant or memory message
        let previousMessage: Message | null = null;
        let progressingMessage: Message | null  = null;
        const completedMessages: Message[]      = [];

        for await (const { event, data } of EventStreamParser.parse(stream)) {
            if (!event || !data || event === 'delta_encoding') continue;

            try {
                const parsedData: BaseChunk = JSON.parse(data);

                if (isMetaChunk(parsedData)) {
                    const { message } = parsedData.v;

                    const parentId = message.metadata.parent_id as string || previousMessage?.id || null;

                    completedMessages.push({
                        id:         message.id,
                        message:    {
                            id:         message.id,
                            author:     message.author,
                            content:    { parts: message.content.parts },
                            metadata:   { attachments: message.metadata.attachments as ImageMeta[] || [] }
                        },
                        parent:     parentId,
                        children:   [],
                    });
                    previousMessage = completedMessages[completedMessages.length - 1];

                    if (message.status === 'finished_successfully' && !hasAttachments(parsedData)) {
                        progressingMessage  = null;
                        inProgress          = false;
                        continue;
                    };

                    conversationId = parsedData.v.conversation_id;

                    progressingMessage  = completedMessages[completedMessages.length - 1];
                    inProgress          = true;
                    const recipient     = message.recipient;

                    const meta = { 
                        ...progressingMessage, 
                        conversationId, 
                        recipient, 
                        completed: false, 
                        completedMessages
                    };
                    yield { meta, part: null };
                } else if (parsedData.o === 'patch' && progressingMessage) {
                    for (const patch of parsedData.v as BaseChunk[]) {
                        if (patch.p === '/message/content/parts/0' && typeof patch.v === 'string') {
                            progressingMessage.message.content.parts![0] += patch.v;

                            yield { meta: null, part: patch.v };
                        }
                    }
                    inProgress = false;
<<<<<<< HEAD
                } else if (inProgress && progressingMessage && typeof parsedData.v === 'string') {
=======
                } else if (progressingMessage && typeof parsedData.v === 'string') {
>>>>>>> 3562679 (Add temporary chat, web search message)
                    progressingMessage.message.content.parts![0] += parsedData.v;
                    yield { meta: null, part: parsedData.v };
                }
            } catch (err) {
                if (err instanceof Error) {
                    console.error('Error parsing stream:', err.message);
                }
<<<<<<< HEAD
                console.log(data);
=======
>>>>>>> 3562679 (Add temporary chat, web search message)
            }
        }

        if (!progressingMessage) return;

        const meta = { 
            ...progressingMessage, 
            conversationId, 
            recipient: 'all', 
            completed: true, 
            completedMessages 
        };
        yield { meta, part: null };
    }
}