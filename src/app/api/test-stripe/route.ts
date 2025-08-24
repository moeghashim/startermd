import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  : null;

export async function GET() {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured - missing STRIPE_SECRET_KEY' },
        { status: 500 }
      );
    }

    // Test the connection by retrieving account info
    const account = await stripe.accounts.retrieve();
    
    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        country: account.country,
        default_currency: account.default_currency,
        email: account.email,
      },
      message: 'Stripe connection successful!'
    });
  } catch (error) {
    console.error('Stripe test error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Stripe connection failed',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
