import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST(req) {
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const { plan = 'monthly' } = await req.json();
        const origin = req.headers.get('origin') || 'http://localhost:3000';

        // Price IDs — set these after creating products in your Stripe dashboard
        // Or use inline price_data for quick setup without pre-creating products
        const priceData = plan === 'yearly'
            ? { currency: 'usd', unit_amount: 3999, recurring: { interval: 'year' },  product_data: { name: 'Fabula Premium — Yearly',  description: 'Unlimited stories, all languages, all features' } }
            : { currency: 'usd', unit_amount:  499, recurring: { interval: 'month' }, product_data: { name: 'Fabula Premium — Monthly', description: 'Unlimited stories, all languages, all features' } };

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price_data: priceData, quantity: 1 }],
            success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:  `${origin}/?canceled=1`,
            allow_promotion_codes: true,
            billing_address_collection: 'auto',
            metadata: { plan },
        });

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (err) {
        console.error('Stripe checkout error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
