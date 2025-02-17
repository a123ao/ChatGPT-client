import { ModelType } from '../model.ts';

import type { 
    UserMessageMeta, 
    InstructionMessageMeta, 
    MemoryMessageMeta 
} from './message.ts';

export interface PayloadMessage {
    id:         string;
    author:     { role: string };
    content:    { content_type: 'text', parts: string[] };
}

export interface BaseMessagePayload {
    messages:           (PayloadMessage | InstructionMessageMeta | MemoryMessageMeta)[] | UserMessageMeta[];
    parent_message_id:  null | string;
    model:              ModelType;
    conversation_mode: {
        kind:           'primary_assistant';
        plugin_ids?:    null;
    };
    supported_encodings:    string[]; // ['v1'] indicate the version of the encoding
}

export interface CreateMessagePayload extends BaseMessagePayload {
    action:             'next';
    messages:           (PayloadMessage | InstructionMessageMeta | MemoryMessageMeta)[];
}

export interface RecreateMessagePayload extends BaseMessagePayload {
    action:             'variant';
    messages:           UserMessageMeta[];
    variant_purpose:    'comparison_implicit' | 'none';
}
