import { ModelType } from '../types/index.ts';

import type { 
    UserMessageMeta,
    InstructionMessageMeta,
    BaseMessagePayload, 
    CreateMessagePayload, 
    RecreateMessagePayload, 
    PayloadMessage 
} from '../types/index.ts';

export interface BaseCreateMessagePayloadParams {
    meta:               UserMessageMeta;
    parent:             null | string;
    model:              ModelType;
    conversationId?:    string;
    instructionMeta?:   InstructionMessageMeta
}

export class MessagePayloadFactory {
    private static createUserMessagePayload(meta: UserMessageMeta): PayloadMessage {
        return {
            id:     meta.id,
            author: { role: 'user' },
            content: { 
                content_type:   'text', 
                parts:          meta.content.parts as string[]
            },
        };
    }

    public static createCreateMessagePayload(params: BaseCreateMessagePayloadParams): CreateMessagePayload {
        const payload: CreateMessagePayload = {
            ...this.getDefaultPayload(),
            ...{
                action:             'next',
                messages:           [ this.createUserMessagePayload(params.meta) ],
                parent_message_id:  params.parent,
                model:              params.model,
                conversation_id:    params.conversationId
            }
        };

        if (params.instructionMeta) {
            payload.messages = [ params.instructionMeta, ...payload.messages ];
        }

        return payload;
    }

    public static createRecreateMessagePayload(params: BaseCreateMessagePayloadParams): RecreateMessagePayload {
        const payload: RecreateMessagePayload = {
            ...this.getDefaultPayload(),
            ...{
                action:             'variant',
                variant_purpose:    'comparison_implicit',
                messages:           [ params.meta ],
                parent_message_id:  params.parent,
                model:              params.model,
                conversation_id:    params.conversationId,
            }
        };

        return payload;
    }

    public static getDefaultPayload(): Omit<BaseMessagePayload, 'messages'> {
        return {
            parent_message_id:  '',
            model:              ModelType.GPT4oMini,
            conversation_mode: {
                kind: 'primary_assistant',
                plugin_ids: null,
            },
            supported_encodings: ['v1'],
        };
    }
}
