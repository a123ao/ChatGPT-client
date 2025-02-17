import process from 'node:process';
import { ResponseStreamParseResult } from '../core/index.ts';

export interface OutputOptions {
    showDetail?: boolean;
}

export const output = async (
    stream:     AsyncGenerator<ResponseStreamParseResult>, 
    options?:   OutputOptions
) => {
    let firstResponse = true;
    for await (const { meta, part } of stream) {
        if (meta) {
            if (firstResponse) {
                if (options?.showDetail) process.stdout.write(`Conversation ID: ${meta.conversationId}\n`);
                firstResponse = false;
            }

            if (meta.completed) {
                process.stdout.write('\n\n');
                break;
            }

            if (meta.recipient === 'bio') {
                process.stdout.write(`---Memory Updated---\n`);
            } else {
                process.stdout.write(`---Assistant Response---\n`);
            }
        }

        if (part) {
            process.stdout.write(part);
        }
    }
}