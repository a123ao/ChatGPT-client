import config from '../config.ts';
import { ChatGPTClient, output, ModelType } from '../src/index.ts';

if (import.meta.main) {
    const accounts  = Object.values(config.accounts);
    const client    = new ChatGPTClient(accounts[0]);

    await output(await client.createConversation('Hello, can you tell me a joke? Think twice before respons.', {
        customInstruction: {
            profile:        '',
            instruction:    ''
        },
        model:      ModelType.O3Mini,
        returnType: 'message'
    }), { showConversationId: true, showMessageDetails: true });
}