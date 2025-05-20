import { MessageContent, ImageMeta, ImagePart } from '../types/index.ts';

export class MessageContentFactory {
    public static createMessageContent(data: string, attachments?: ImageMeta[]): MessageContent {
        if (!attachments?.length) {
            return {
                content_type: 'text',
                parts: [ data ]
            };
        }

        return {
            content_type: 'multimodal_text',
            parts: [
                ...attachments.map<ImagePart>(attachment => ({
                    asset_pointer:  'file-service://' + attachment.id,
                    content_type:   'image_asset_pointer',
                    size_bytes: 0,
                    width:      0,
                    height:     0
                })),
                data,
            ],
        };
    }
}