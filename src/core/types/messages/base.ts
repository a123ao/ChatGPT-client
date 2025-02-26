import { ImageMeta, ImagePart } from './files/image.ts';

export interface MessageAuthor {
    role:       'system' | 'user' | 'assistant' | 'tool';
    name:       null;
    metadata:   Record<string, unknown>;
}

export interface MessageContent {
    content_type:   'text' | 'user_editable_context' | 'multimodal_text';
    parts?:         Array<string | ImagePart>;
}

export interface MessageMeta {
    id:         string;
    author:     MessageAuthor;
    content:    MessageContent;
    metadata:   Record<string, unknown>;
    recipient:  'all' | 'assistant' | 'bio'; // 'bio' usually appears in `memory update` messages
}

export interface Message {
    id: string;
    message: {
        id:         string;
        author:     { role: MessageAuthor['role'] };
        content:    { parts?: MessageContent['parts'] };
        metadata?: {
            attachments?: ImageMeta[];
        };
    };
    parent:     string | null;
    children:   string[];
}