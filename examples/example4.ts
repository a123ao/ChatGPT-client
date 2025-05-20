import config from '../config.ts';
import { ChatGPTClient, hasContent, output, ModelType } from '../src/index.ts';

if (import.meta.main) {
    const accounts  = Object.values(config.accounts);
    const client    = new ChatGPTClient(accounts[0]);

    const conversationId = await output(await client.createConversation('write 100 words', {
        customInstruction: {
            profile:        '',
            instruction:    'You are now configured to be a friendly and expressive AI assistant.'
        },
        model:      ModelType.GPT4oMini,
        returnType: 'message',
        temporary: true // Temporary chat
    }), { showConversationId: true, showMessageDetails: true });

    const conversation  = await client.getTemporaryConversationId(conversationId);
    while (true) {
      const message = prompt('>') || '';
      if (!message) break;

      await output(conversation.createMessage(message));
    }

}