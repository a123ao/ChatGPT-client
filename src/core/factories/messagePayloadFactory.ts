import { ModelType } from '../types/index.ts';

import type { 
    UserMessageMeta,
    InstructionMessageMeta,
    BaseMessagePayload, 
    CreateMessagePayload, 
    RecreateMessagePayload, 
} from '../types/index.ts';

export interface BaseCreateMessagePayloadParams {
    meta:               UserMessageMeta;
    parent:             null | string;
    model:              ModelType;
    conversationId?:    string;
    instructionMeta?:   InstructionMessageMeta;
    attachments?:       string[];
    temporary?:         boolean;
}

export class MessagePayloadFactory {
    public static createCreateMessagePayload(params: BaseCreateMessagePayloadParams): CreateMessagePayload {
        const payload: CreateMessagePayload = {
            ...this.getDefaultPayload(),
            ...{
                action:             'next',
                messages:           [ params.meta ],
                parent_message_id:  params.parent,
                model:              params.model,
                conversation_id:    params.conversationId,
                history_and_training_disabled: params.temporary
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

        if (params.temporary) {
          (payload as any).history_and_training_disabled = true
        }

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
