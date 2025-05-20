import { ModelType } from '../model.ts';

import type {
    UserMessageMeta,
    InstructionMessageMeta,
    MemoryMessageMeta
} from './meta.ts';

export interface BaseMessagePayload {
    messages:           Array<UserMessageMeta | InstructionMessageMeta | MemoryMessageMeta> | UserMessageMeta[];
    parent_message_id:  null | string;
    model:              ModelType;
    conversation_mode: {
        kind:           'primary_assistant';
        plugin_ids?:    null;
    };
    supported_encodings:    string[]; // ['v1'] indicate the version of the encoding
<<<<<<< HEAD
=======
    
>>>>>>> 3562679 (Add temporary chat, web search message)
}

export interface CreateMessagePayload extends BaseMessagePayload {
    action:             'next';
}

export interface RecreateMessagePayload extends BaseMessagePayload {
    action:             'variant';
    messages:           UserMessageMeta[];
    variant_purpose:    'comparison_implicit' | 'none';
}
