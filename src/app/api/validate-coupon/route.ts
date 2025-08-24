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

    const { couponCode } = await req.json();

    if (!couponCode) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // Retrieve the coupon from Stripe
    const coupon = await stripe.coupons.retrieve(couponCode);

    // Check if coupon is valid and active
    if (!coupon.valid) {
      return NextResponse.json(
        { error: 'This coupon is no longer valid' },
        { status: 400 }
      );
    }

    // Calculate discount amount (original price is $5.00 = 500 cents)
    const originalAmount = 500;
    let discountAmount = 0;
    let finalAmount = originalAmount;

    if (coupon.percent_off) {
      discountAmount = Math.round(originalAmount * (coupon.percent_off / 100));
      finalAmount = originalAmount - discountAmount;
    } else if (coupon.amount_off) {
      discountAmount = coupon.amount_off;
      finalAmount = Math.max(0, originalAmount - discountAmount);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        name: coupon.name,
        percent_off: coupon.percent_off,
        amount_off: coupon.amount_off,
        currency: coupon.currency,
      },
      pricing: {
        originalAmount,
        discountAmount,
        finalAmount,
      },
    });
  } catch (error: unknown) {
    console.error('Stripe coupon validation error:', error);
    
    // Handle specific Stripe errors
    if (error && typeof error === 'object' && 'type' in error && error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
