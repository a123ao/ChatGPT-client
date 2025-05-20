import config from '../config.ts';
import { ChatGPTClient, output, ModelType, hasAttachments } from '../src/index.ts';

if (import.meta.main) {
    const accounts  = Object.values(config.accounts);
    const client    = new ChatGPTClient(accounts[0]);

    const conversationId = await output(await client.createConversation('Can you describe what you see in the image?', {
        model:      ModelType.GPT4o,
        returnType: 'message',
        attachments: [ '../images/Fvk1RCvaEAYJH_J.jpg' ],
        temporary: true
    }), { showConversationId: true, showMessageDetails: true });


    const conversation  = await client.getTemporaryConversationId(conversationId);
    while (true) {
      const message = prompt('>') || '';
      if (!message) break;

      await output(conversation.createMessage(message));
    }
}