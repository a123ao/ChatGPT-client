import type { 
    UserMessageMeta,
    InstructionMessageMeta,
    MessageContent,
    ImageMeta,
    ImagePart
} from '../types/index.ts';

export interface CreateUserMessageMetaParams {
    id:             string;
    data:           string;
    attachments?:   ImageMeta[];
}

export interface CreateInstructionMessageMetaParams {
    id:             string;
    profile:        string;
    instruction:    string;
}

export interface CreateMemoryMessageMetaParams {
    id:         string;
    data:       string;
    parent:     string;
}

export class MessageMetaFactory {
    public static createUserMessageMeta(params: CreateUserMessageMetaParams): UserMessageMeta {
        const { id, data } = params;

        const content: MessageContent = (() => {
            if (!params.attachments) {
                return {
                    content_type: 'text',
                    parts: [ data ]
                };
            }

            return {
                content_type: 'multimodal_text',
                parts: [
                    ...params.attachments.map<ImagePart>(attachment => ({
                        asset_pointer:  'file-service://' + attachment.id,
                        content_type:   'image_asset_pointer',
                        size_bytes: 0,
                        width:      0,
                        height:     0
                    })),
                    data,
                ],
            };
        })();

        return {
            id,
            author: {
                role:       'user',
                name:       null,
                metadata:   {},
            },
            content,
            metadata: {
                attachments: params.attachments,
            },
            recipient: 'all',
        };
    }

    public static createInstructionMessageMeta(params: CreateInstructionMessageMetaParams): InstructionMessageMeta {
        const { id, profile = '', instruction = '' } = params;

        return {
            id,
            author:         { role: 'user' , name: null, metadata: {} },
            content: {
                content_type:       'user_editable_context',
                user_profile:       `${profile}`,
                user_instructions:  `${instruction}`,
            },
            metadata: {
                user_context_message_data: {
                    about_user_message:     profile,
                    about_model_message:    instruction,
                },
                is_user_system_message: true,
                is_visually_hidden_from_conversation: true,
            },
            recipient: 'all',
        };
    }
}
