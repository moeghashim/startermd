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

    const { prompt, projectName, couponCode, preferredAgent } = await req.json();

    // For checkout sessions, we should use the original price and let Stripe handle the discount
    const originalAmount = 500; // Always use original $5 price for the line item
    
    console.log('Creating checkout session with:', {
      projectName,
      couponCode,
      originalAmount
    });
    
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
        preferredAgent: preferredAgent || 'Cursor',
        ...(couponCode && { couponCode }),
      },
      automatic_tax: {
        enabled: false,
      },
    };

    // Apply coupon if provided - try promotion code first, then direct coupon
    if (couponCode) {
      console.log('Applying coupon:', couponCode);
      
      try {
        // First try as promotion code
        const promotionCodes = await stripe.promotionCodes.list({
          code: couponCode,
          active: true,
          limit: 1
        });
        
        if (promotionCodes.data.length > 0) {
          console.log('Using promotion code for checkout');
          sessionParams.discounts = [{
            promotion_code: promotionCodes.data[0].id,
          }];
        } else {
          // Fallback to direct coupon
          console.log('Using direct coupon for checkout');
          sessionParams.discounts = [{
            coupon: couponCode,
          }];
        }
      } catch (error) {
        console.error('Error applying coupon to checkout:', error);
        // Try direct coupon as last resort
        sessionParams.discounts = [{
          coupon: couponCode,
        }];
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    
    console.log('Created checkout session:', {
      id: session.id,
      amount_total: session.amount_total,
      discounts: session.discounts
    });

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
