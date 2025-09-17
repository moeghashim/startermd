import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages, docs } = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return new Response('OpenAI API key not configured', { status: 500 });
  }

  const systemPrompt = `You are a helpful assistant that can answer questions about the provided documentation. 

Here is the documentation content:
${docs}

Please answer questions based on this documentation. If the answer is not in the documentation, say so clearly.`;

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
