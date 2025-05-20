import { ImageMeta, ImagePart } from './files/image.ts';

export interface MessageAuthor {
<<<<<<< HEAD
    role:       'system' | 'user' | 'assistant' | 'tool';
    name:       null;
    metadata:   Record<string, unknown>;
}

=======
  role: 'system' | 'user' | 'assistant' | 'tool';
  name: string | null;
  metadata: Record<string, any>;
}


>>>>>>> 3562679 (Add temporary chat, web search message)
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
<<<<<<< HEAD
        id:         string;
        author:     { role: MessageAuthor['role'] };
=======
        id:   string;
        author: { 
            role: MessageAuthor['role'],
            metadata: MessageAuthor['metadata'],
        };
>>>>>>> 3562679 (Add temporary chat, web search message)
        content:    { parts?: MessageContent['parts'] };
        metadata?: {
            attachments?: ImageMeta[];
        };
    };
    parent:     string | null;
    children:   string[];
}