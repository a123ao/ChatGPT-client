import process from 'node:process';
import { ResponseStreamParseResult, Message } from '../core/index.ts';

export interface OutputOptions {
    showConversationId?: boolean;
    showMessageDetails?: boolean;
}

export const output = async (
<<<<<<< HEAD
    stream:     AsyncGenerator<ResponseStreamParseResult>, 
=======
    stream:     AsyncGenerator<ResponseStreamParseResult>,
>>>>>>> 3562679 (Add temporary chat, web search message)
    options?:   OutputOptions
) => {
    const { showMessageDetails = false, showConversationId = false } = options || {};

    let firstResponse   = true;
    let inProgress      = false;
<<<<<<< HEAD
    const completedMessage: Message[] = [];
    for await (const { meta, part } of stream) {
        if (meta) {
=======
    let conversationId: string = '';
    const completedMessage: Message[] = [];

    for await (const { meta, part } of stream) {
        if (meta) {
            if (meta.conversationId) {
              conversationId = meta.conversationId;
            }
>>>>>>> 3562679 (Add temporary chat, web search message)
            // Print conversation ID as soon as it is available
            if (firstResponse) {
                if (showConversationId) process.stdout.write(`Conversation ID: ${meta.conversationId}\n`);
                firstResponse = false;
            }

            // Stop printing if conversation is completed
            if (meta.completed) {
                completedMessage.push(...meta.completedMessages);
                break;
            }

            // Jump to new line if the output has been in other message
            if (inProgress) {
                process.stdout.write('\n\n');
            }

            // Print message header
            if (meta.recipient === 'bio') {
                process.stdout.write(`---📘Memory Updating📘---\n`);
            } else if (meta.message.author.role === 'tool') {
                process.stdout.write('---💭Assistant Thinking💭---\n');
            } else if (meta.message.author.role === 'assistant') {
<<<<<<< HEAD
                process.stdout.write(`---💬Assistant Response💬---\n`);
=======
              if (meta.message.author.metadata.real_author === 'tool:web') {
                process.stdout.write(`---💬Assistant Searching Web---\n`);
              } else {
                process.stdout.write(`---💬Assistant Response💬---\n`);
              }
>>>>>>> 3562679 (Add temporary chat, web search message)
            } else {
                inProgress = false;
                continue;
            }

            // Print message details
            if (showMessageDetails) {
                process.stdout.write(`Thread: ${meta.parent} -> ${meta.id}\n`);
                process.stdout.write('-\n');
            }

            inProgress = true;
        }

        if (part) {
            process.stdout.write(part);
        }
    }

    const attachments = completedMessage.flatMap(m => m.message.metadata?.attachments || []);
    if (showMessageDetails && attachments.length) {
        process.stdout.write('\n--\n');
        process.stdout.write(`Attachments: ${JSON.stringify(attachments.map(a => { return { id: a.id, name: a.name }}))}\n`);
    }

    process.stdout.write('\n\n');
<<<<<<< HEAD
=======
    return conversationId;
>>>>>>> 3562679 (Add temporary chat, web search message)
}