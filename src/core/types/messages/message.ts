export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
    id: string;
    message: {
        id:         string;
        author:     { role: MessageRole };
        content:    { parts: string[] };
    };
    parent:     null | string;
    children:   string[];
}

export interface MessageAuthor {
    role:       MessageRole;
    name:       null;
    metadata:   Record<string, unknown>;
}

export interface MessageContent {
    content_type:   'text' | 'user_editable_context';
    parts?:         string[];
}

export interface MessageMeta {
    id:             string;
    author:         MessageAuthor;
    content:        MessageContent;
    metadata:       { [key: string]: unknown };
    recipient:     'all' | 'assistant' | 'bio'; // 'bio' usually appears in `memory update` messages
}

export interface BaseMessageDetailVO {
    id:         string;
    message:    MessageMeta; // some message do not have `message` key
    parent:     string;
    children:   string[];
}

export type SystemMessageMeta = MessageMeta & {
    author: MessageAuthor & { role: 'system' };
    metadata: MessageMeta['metadata'] & {
        parent_id:  string;
        recipient: 'all';
    };
};
export interface SystemMessageDetailVO extends BaseMessageDetailVO {
    message: SystemMessageMeta
}

export type UserMessageMeta = MessageMeta & {
    author: MessageAuthor & { role: 'user' };
    recipient: 'all';
};
export interface UserMessageDetailVO extends BaseMessageDetailVO {
    message: UserMessageMeta;
}

export type AssistantMessageMeta = MessageMeta & {
    author: MessageAuthor & { role: 'assistant' };
    metadata: MessageMeta['metadata'] & {
        parent_id: string;
    };
    recipient: 'all';
};
export interface AssistantMessageDetailVO extends BaseMessageDetailVO {
    message: AssistantMessageMeta;
}

/** The interface for message including custom instructions */
export type InstructionMessageMeta = MessageMeta & {
    author: MessageAuthor & { role: 'user' };
    content: {
        content_type:       'user_editable_context';
        user_profile:       string;
        user_instructions:  string;
    };
    metadata: {
        user_context_message_data: {
            about_user_message:     string;
            about_model_message:    string;
        };
        is_user_system_message: true;
    };
    recipient: 'all';
};
export interface InstructionMessageDetailVO extends BaseMessageDetailVO {
    message: SystemMessageMeta;
}

export type MemoryMessageMeta = MessageMeta & {
    author: MessageAuthor & { role: 'assistant' };
    metadata: MessageMeta['metadata'] & {
        parent_id: string;
    };
    recipient: 'bio';
};
export interface MemoryMessageDetailVO extends BaseMessageDetailVO {
    message: MemoryMessageMeta;
}
