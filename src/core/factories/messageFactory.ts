import type { MessageAuthor, Message, ImageMeta } from '../types/index.ts';
import { MessageContentFactory } from './messageContentFactory.ts';

export interface CreateMessageParams {
    id:             string;
    data:           string;
    role:           MessageAuthor['role'];
    parent:         string | null;
    children?:      string[];
    attachments?:   ImageMeta[];
}

export class MessageFactory {
    public static createMessage(params: CreateMessageParams): Message {
        const { id, data, role, parent } = params;

        return {
            id,
            message: {
                id,
                author: { role },
                content: MessageContentFactory.createMessageContent(data, params.attachments),
                metadata: { attachments: params.attachments || [] },
            },
            parent,
            children: params.children || [],
        };
    }
}
