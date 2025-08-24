import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 500 }
      );
    }

    const { prompt, projectName, couponCode, finalAmount } = await req.json();

    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount: finalAmount || 500, // Use final amount after coupon discount, default to $5.00
      currency: 'usd',
      metadata: {
        prompt: prompt.substring(0, 500), // Limit for metadata
        projectName: projectName || 'Unnamed Project',
        ...(couponCode && { couponCode }),
      },
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
