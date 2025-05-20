export interface EventStreamData {
    event?: string;
    data?:  string;
}

export class EventStreamParser {
    public static async *parse(
        stream: ReadableStream<Uint8Array>,
        options: { delimiter?: string; log?: boolean; encoding?: string } = {}
    ) {
        const { delimiter = '\n\n', log = false, encoding = 'utf-8' } = options;

        const reader = stream
            .pipeThrough(new TextDecoderStream(encoding, { fatal: true }))
            .getReader();

        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const parts = (buffer + value).split(delimiter);
                buffer = parts.pop() || '';

                for (const part of parts) {
                    if (log) console.log('Part:', part);
                    yield EventStreamParser.parsePart(part);
                }
            }
        } catch (err) {
            console.error('Error parsing stream:', err);
            throw err;
        } finally {
            await reader.cancel();
        }
    }

    private static parsePart(part: string): EventStreamData {
        const lines = part.split('\n');

        const result: EventStreamData = {};
        for (const line of lines) {
            if (line.startsWith(':')) {
                continue;
            } else if (line.startsWith('event:')) {
                result.event = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
                result.data = line.slice(5).trim();
            }
        }

        return result;
    }
}
