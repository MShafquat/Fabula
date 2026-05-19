import Stripe from 'stripe';
import { NextResponse } from 'next/server';

// Stripe sends events here — set STRIPE_WEBHOOK_SECRET from your dashboard
// stripe listen --forward-to localhost:3000/api/payment/webhook
export async function POST(req) {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await req.text();
    const sig  = req.headers.get('stripe-signature');

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Log every event for debugging
    console.log(`[Stripe Webhook] ${event.type} | ${new Date().toISOString()}`);

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            console.log(`[Stripe] New subscriber: ${session.customer_details?.email} | plan: ${session.metadata?.plan}`);
            // In a real app: save to DB, send welcome email, etc.
            break;
        }
        case 'customer.subscription.deleted':
        case 'customer.subscription.paused': {
            const sub = event.data.object;
            console.log(`[Stripe] Subscription ended: ${sub.customer}`);
            // In a real app: mark user as non-premium in DB
            break;
        }
        default:
            break;
    }

    return NextResponse.json({ received: true });
}
