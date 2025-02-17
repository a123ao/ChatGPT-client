import { EventStreamParser } from './streamParser.ts';

import type { 
    Message, 
    SystemMessageMeta, 
    UserMessageMeta, 
    AssistantMessageMeta 
} from '../types/messages/message.ts';

// Meta recieved from the server
export type ResponseMetaType = SystemMessageMeta | UserMessageMeta | AssistantMessageMeta;
export type MetaChunkValue<T extends ResponseMetaType >  = { 
    message:            T & { status: 'finished_successfully' | 'in_progress' }, 
    conversation_id:    string 
};

// Chunk types
export type ChunkOperation  = 'add' | 'append' | 'patch' | 'replace';
export type ChunkValue      = string | BaseChunk[] | MetaChunkValue<ResponseMetaType>;

export interface BaseChunk {
    p?: string;         // path
    o?: ChunkOperation; // operation
    v?: ChunkValue;     // value
    c?: number;         // count
}

export interface MetaChunk<T extends ResponseMetaType> extends BaseChunk {
    v: MetaChunkValue<T>;
}

export const isMetaChunk = (chunk: BaseChunk): chunk is MetaChunk<ResponseMetaType> => {
    return typeof chunk.v === 'object' && chunk.v !== null && 'message' in chunk.v;
};

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
        let hadProgress = false; // Indicate if any message has been processed
        let previousMessage: Message | null = null;
        let progressingMessage: Message | null  = null;
        const completedMessages: Message[]      = [];

        for await (const { event, data } of EventStreamParser.parse(stream)) {
            if (!event || !data || event === 'delta_encoding') continue;

            try {
                const parsedData = JSON.parse(data) as BaseChunk;

                if (isMetaChunk(parsedData)) {
                    const { message } = parsedData.v;

                    const parentId = message.metadata.parent_id as string || previousMessage?.id || null;

                    completedMessages.push({
                        id:         message.id,
                        message:    {
                            id:         message.id,
                            author:     message.author,
                            content:    { parts: message.content.parts as string[] },
                        },
                        parent:     parentId,
                        children:   [],
                    });
                    previousMessage = completedMessages[completedMessages.length - 1];

                    if (message.status === 'finished_successfully') {
                        progressingMessage  = null;
                        inProgress          = false;
                        continue;
                    };

                    if (hadProgress) {
                        // Jump to the next line if there is a new message
                        yield { meta: null, part: '\n' };
                    }

                    conversationId = parsedData.v.conversation_id;

                    progressingMessage  = completedMessages[completedMessages.length - 1];
                    inProgress          = true;
                    hadProgress         = true;
                    const recipient     = message.recipient as string;

                    const meta = { 
                        ...progressingMessage, 
                        conversationId, 
                        recipient, 
                        completed: false, 
                        completedMessages: [] 
                    };
                    yield { meta, part: null };
                } else if (parsedData.o === 'patch' && progressingMessage) {
                    for (const patch of parsedData.v as BaseChunk[]) {
                        if (patch.p === '/message/content/parts/0') {
                            progressingMessage.message.content.parts[0] += patch.v as string;

                            yield { meta: null, part: patch.v as string };
                        }
                    }
                    inProgress = false;
                } else if (inProgress && progressingMessage) {
                    progressingMessage.message.content.parts[0] += parsedData.v as string;
                    yield { meta: null, part: parsedData.v as string };
                }
            } catch (err) {
                if (err instanceof Error) {
                    console.error('Error parsing stream:', err.message);
                }
                console.log(data);
            }
        }

        const meta = { 
            ...progressingMessage as Message, 
            conversationId, 
            recipient: 'all', 
            completed: true, 
            completedMessages 
        };
        yield { meta, part: null };
    }


}