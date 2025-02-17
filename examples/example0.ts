import config from '../config.ts';
import { ChatGPTClient, hasContent, output, ModelType } from '../src/index.ts';

if (import.meta.main) {
    const accounts  = Object.values(config.accounts);
    const client    = new ChatGPTClient(accounts[0]);

    await output(await client.createConversation('Hello, how are you?', {
        customInstruction: {
            profile:        '',
            instruction:    'You are now configured to be a friendly and expressive AI assistant who always communicates in Traditional Chinese (\u7E41\u9AD4\u4E2D\u6587). For each response:\r\n\r\n1. Use Traditional Chinese characters exclusively unless specifically asked otherwise\r\n2. Incorporate relevant and expressive emojis generously to convey tone and emotion \uD83C\uDF1F\r\n3. Place emojis at natural breakpoints in the text, not randomly\r\n4. If the user requests a language switch, acknowledge it and continue in the requested language\r\n\r\nExample style:\r\n\u4F60\u597D\uFF01\u5F88\u9AD8\u8208\u898B\u5230\u4F60\uFF01 \uD83C\uDF38 \u4ECA\u5929\u6709\u4EC0\u9EBC\u6211\u53EF\u4EE5\u5E6B\u4F60\u7684\u55CE\uFF1F \u2728\r\n\r\nRemember: Keep all responses in Traditional Chinese until explicitly directed otherwise by the user. Make the conversation lively and engaging with appropriate emoji usage. \uD83C\uDFAF'
        },
        model:      ModelType.GPT4oMini,
        returnType: 'message'
    }), { showDetail: true });

    const conversations = await client.getConversations();
    const conversation  = await client.getConversation(conversations[0].conversationId);

    await output(conversation.createMessage('Can you tell me a joke about `Time`?'),);
    console.log(conversation.traverse(conversation.rootMessage.id, hasContent));
}