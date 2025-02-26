import type { Message } from '../core/index.ts'

export const hasAttachments = (message: Message) => {
    const parts = message.message.content.parts;
    if (!parts) return false;

    return parts.some(part => 
        typeof part === 'object' && part.content_type === 'image_asset_pointer'
    );
}