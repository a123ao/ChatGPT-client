# ChatGPT API Client

A Deno library for interacting with ChatGPT, providing conversation management and customizable chat interactions.

## Project Structure

```
ChatGPT
├── examples/
│   ├── example0.ts       # Custom instruction example
<<<<<<< HEAD
│   └── example1.ts       # Interactive chat example
=======
│   ├── example1.ts       # Interactive chat example
│   ├── example2.ts       # Interactive chat example
│   ├── example3.ts       # Attachment chat example
│   ├── example4.ts       # Temporary chat example
│   └── example5.ts       # Temporary attachment chat example
>>>>>>> 3562679 (Add temporary chat, web search message)
├── src/
│   ├── core/            # Core functionality
│   │   ├── chatGPT.ts
│   │   ├── factories/   # Message creation factories
│   │   ├── types/       # TypeScript type definitions
│   │   ├── utils/       # Utility functions
│   │   └── tokens/      # Token handling
│   └── utils/           # General utilities
├── config.ts            # Configuration
├── deno.json           # Deno configuration
└── deno.lock           # Dependency lock file
```

## Features

- Create and manage ChatGPT conversations
- Support for custom instructions and profiles
- Multiple model support (including GPT-4)
- Stream parsing capabilities

## Usage

### Basic Conversation

```typescript
import { ChatGPTClient, ModelType } from './src/index.ts';

const client = new ChatGPTClient(account);

// Create a new conversation
const response = await client.createConversation('Hello, how are you?', {
    model: ModelType.GPT4Mini,
    returnType: 'message'
});

// Get conversation history
const conversations = await client.getConversations();
const conversation = await client.getConversation(conversations[0].conversationId);
```

<<<<<<< HEAD
=======
### Temporary Conversation

```typescript
const conversationId = await output(await client.createConversation('Hello, how are you?', {
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
```

>>>>>>> 3562679 (Add temporary chat, web search message)
### Custom Instructions

You can customize the behavior of the AI by providing custom instructions:

```typescript
const response = await client.createConversation('Hello', {
    customInstruction: {
        profile: '',
        instruction: 'You are now configured to be a friendly and expressive AI assistant...'
    },
    model: ModelType.GPT4Mini,
    returnType: 'message'
});
```

### Interactive Chat

Create an interactive chat session:

```typescript
// Create conversation
const conversation = await client.createConversation(initialMessage, options);

// Continue conversation
while (true) {
    const message = prompt('>') || '';
    if (!message) break;
    
    await conversation.createMessage(message);
}
```

## Configuration

Create a `config.ts` file with your account settings:

```typescript
export default {
    accounts: {
        'YOUR_ID': {
            token:  'YOUR_TOKEN',
            cookie: 'YOUR_COOKIE'
        }
    }
};
```

## Models

The library supports different ChatGPT models through the `ModelType` enum:
- GPT4Mini
- GPT4

## Development

This project uses Deno as its runtime. Make sure you have Deno installed before running the examples.

### Running Examples

```bash
deno run -A examples/example0.ts
deno run -A examples/example1.ts
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.