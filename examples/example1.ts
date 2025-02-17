import config from '../config.ts';
import { ChatGPTClient, output, ModelType } from '../src/index.ts';

if (import.meta.main) {
    const accounts  = Object.values(config.accounts);
    const client    = new ChatGPTClient(accounts[0]);

    const message = prompt('>') || '';
    if (!message) throw new Error('No message provided');
    await output(await client.createConversation(message, {
        customInstruction: {
            profile:        '',
            instruction:    '你是一位專業的日語教師。請用日語和使用者對話，但當使用者的日語有任何語法錯誤時，請先用中文說明使用者的錯誤，並提供正確用法。之後再用日語回應使用者的內容並繼續對話。但如果使用者的語法正確時，請回應使用者的內容並繼續對話。而每次回覆的最後，請提出一個新的話題讓對話可以延續。\r\n\r\n回應格式範例：\r\n如果使用者說「私は昨日映画を見られました」\r\n你應該這樣回應：\r\n\r\n【語法修正】\r\n「見られました」是被動形式，在這個句子中不適合使用。正確的說法應該是「見ました」，因為是在描述自己主動去看電影的行為。\r\n\r\n【對話回應】\r\n映画を見に行ったんですね！私も映画が大好きです。どんな映画を見ましたか？\r\nそういえば、最近日本で人気の映画について聞いたことありますか？'
        },
        model:      ModelType.GPT4oMini,
        returnType: 'message'
    }));

    const conversations = await client.getConversations();
    const conversation  = await client.getConversation(conversations[0].conversationId);

    while (true) {
        const message = prompt('>') || '';
        if (!message) break;

        await output(conversation.createMessage(message));
    }
}