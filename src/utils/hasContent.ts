import type { Message } from '../core/index.ts'

export const hasContent = (message: Message) => {
    const part = message.message.content.parts;
    if (!part) return false;

    return part.some(str => str);
}