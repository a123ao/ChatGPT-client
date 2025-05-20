import type { 
    Message, 
    BaseMessageDetailVO
} from './messages/index.ts';

export interface ConversationListItem {
    conversationId: string;
    title:          string;
}

export interface Conversation {
    conversationId:     string;
    title:              string;
    messages:           Record<string, Message>;
    currentMessageId:   string;
}

export interface ConversationListItemVO {
    id:             string;
    title:          string;
    mapping:        null;
    current_node:   null;
}

export interface ConversationDetailVO {
    title:              string;
    mapping:            Record<string, BaseMessageDetailVO>;
    current_node:       string;
    conversation_id:    string;
}
