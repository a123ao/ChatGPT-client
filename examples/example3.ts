import config from '../config.ts';
import { ChatGPTClient, output, ModelType, hasAttachments } from '../src/index.ts';

if (import.meta.main) {
    const accounts  = Object.values(config.accounts);
    const client    = new ChatGPTClient(accounts[0]);

    await output(await client.createConversation('Can you describe what you see in the image?', {
        model:      ModelType.GPT4o,
        returnType: 'message',
        attachments: [ './images/Fvk1RCvaEAYJH_J.jpg' ]
    }), { showConversationId: true, showMessageDetails: true });

    const conversations = await client.getConversations();
    const conversation  = await client.getConversation(conversations[0].conversationId);

    const messages = conversation.traverse(conversation.rootMessage.id, hasAttachments);

    await output(
        conversation.createMessage('Can you describe it in more detail?', {
            model:          ModelType.O3Mini,
            attachments:    messages[0].message.metadata?.attachments
        }), { showMessageDetails: true }
    );
}