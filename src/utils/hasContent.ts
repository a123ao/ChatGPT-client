import type { Message } from '../core/index.ts'

export const hasContent = (message: Message) => {
    return message.message.content.parts.filter(str => str).length > 0;
}