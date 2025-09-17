import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, docs } = await req.json();

  const systemPrompt = `You are a helpful assistant that can answer questions about the provided documentation. 

Here is the documentation content:
${docs}

Please answer questions based on this documentation. If the answer is not in the documentation, say so clearly.`;

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
  });

  return result.toDataStreamResponse();
}
