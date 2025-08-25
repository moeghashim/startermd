import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export async function GET() {
  try {
    console.log('Testing OpenAI connection...');
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('API Key starts with sk-:', process.env.OPENAI_API_KEY?.startsWith('sk-'));
    
    if (!openai) {
      console.log('OpenAI client not initialized');
      return NextResponse.json(
        { error: 'OpenAI not configured - missing OPENAI_API_KEY' },
        { status: 500 }
      );
    }

    console.log('Making OpenAI API call...');
    // Test with a simple completion using GPT-4o-mini
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Small, fast, and cost-effective
      messages: [
        { role: "user", content: "Say 'Hello, OpenAI is working!'" }
      ],
      max_tokens: 50,
    });

    console.log('OpenAI API call successful');
    const response = completion.choices[0].message.content;

    return NextResponse.json({
      success: true,
      message: 'OpenAI connection successful!',
      model: "gpt-4o-mini",
      response,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('OpenAI test error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'OpenAI connection failed',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
