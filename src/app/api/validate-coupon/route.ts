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

    console.log('Validating coupon:', { 
      couponCode, 
      length: couponCode?.length,
      type: typeof couponCode 
    });

    if (!couponCode) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    // First try to find promotion code, then get the underlying coupon
    console.log('Looking up promotion code:', couponCode);
    
    let coupon;
    try {
      // Try to find promotion code first
      const promotionCodes = await stripe.promotionCodes.list({
        code: couponCode,
        active: true,
        limit: 1
      });
      
      if (promotionCodes.data.length > 0) {
        console.log('Found promotion code:', promotionCodes.data[0].id);
        coupon = promotionCodes.data[0].coupon;
      } else {
        // Fallback: try as direct coupon ID
        console.log('No promotion code found, trying as direct coupon ID');
        coupon = await stripe.coupons.retrieve(couponCode);
      }
    } catch {
      // If both promotion code and direct coupon fail, throw error
      throw new Error('Invalid coupon code');
    }
    
    console.log('Final coupon found:', {
      id: coupon.id,
      valid: coupon.valid,
      percent_off: coupon.percent_off,
      amount_off: coupon.amount_off
    });

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
