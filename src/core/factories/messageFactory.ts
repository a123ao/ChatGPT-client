import type { 
    MessageRole, 
    Message
} from '../types/index.ts';

export interface CreateMessageParams {
    id:         string;
    data:       string;
    role:       MessageRole;
    parent:     null | string;
    children?:  string[];
}

export class MessageFactory {
    public static createMessage(params: CreateMessageParams): Message {
        const { id, data, role, parent } = params;

        return {
            id,
            message: {
                id,
                author: { role },
                content: { parts: [ data ] },
            },
            parent,
            children: params.children || [],
        };
    }
}
