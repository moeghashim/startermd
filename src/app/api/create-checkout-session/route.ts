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

    const { prompt, projectName, couponCode } = await req.json();

    // For checkout sessions, we should use the original price and let Stripe handle the discount
    const originalAmount = 500; // Always use original $5 price for the line item
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI-Generated Development Files',
              description: `Custom AI-generated files for ${projectName || 'your project'}`,
            },
            unit_amount: originalAmount, // Use original price, discount applied separately
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/?canceled=true`,
      metadata: {
        prompt: prompt.substring(0, 500), // Limit for metadata
        projectName: projectName || 'Unnamed Project',
        ...(couponCode && { couponCode }),
      },
      automatic_tax: {
        enabled: false,
      },
    };

    // Apply coupon if provided - Stripe will calculate the discount automatically
    if (couponCode) {
      sessionParams.discounts = [{
        coupon: couponCode,
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    
    // Return more specific error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
