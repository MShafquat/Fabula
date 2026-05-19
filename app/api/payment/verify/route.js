import Stripe from 'stripe';
import { NextResponse } from 'next/server';

// Called by the success page to verify a completed checkout session
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid' || session.status === 'complete') {
            return NextResponse.json({
                ok: true,
                plan: session.metadata?.plan || 'monthly',
                email: session.customer_details?.email,
                customerId: session.customer,
            });
        }

        return NextResponse.json({ ok: false, status: session.status });
    } catch (err) {
        console.error('Verify error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
