import type { MessageAuthor, MessageContent } from './base.ts';
import type { ImageMeta } from './files/image.ts';

export type BaseMessageMeta = {
    id:         string;
    author:     MessageAuthor;
    content:    MessageContent;
    metadata:   Record<string, unknown>;
    recipient:  'all' | 'assistant' | 'bio'; // 'bio' usually appears in `memory update` messages
}

export type SystemMessageMeta = BaseMessageMeta & {
    author: MessageAuthor & { role: 'system' };
    metadata: BaseMessageMeta['metadata'] & {
        parent_id:  string;
        recipient: 'all';
    };
};

export type UserMessageMeta = BaseMessageMeta & {
    author: MessageAuthor & { role: 'user' };
    metadata: BaseMessageMeta['metadata'] & {
        attachments?: ImageMeta[];
    }
    recipient: 'all';
};

export type AssistantMessageMeta = BaseMessageMeta & {
    author: MessageAuthor & { role: 'assistant' };
    metadata: BaseMessageMeta['metadata'] & {
        parent_id: string;
    };
    recipient: 'all';
};

export type InstructionMessageMeta = BaseMessageMeta & {
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

export type MemoryMessageMeta = BaseMessageMeta & {
    author: MessageAuthor & { role: 'assistant' };
    metadata: BaseMessageMeta['metadata'] & {
        parent_id: string;
    };
    recipient: 'bio';
};