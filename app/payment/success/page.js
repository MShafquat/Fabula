'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const [status, setStatus] = useState('verifying'); // verifying | success | error
    const [email, setEmail]   = useState('');

    useEffect(() => {
        if (!sessionId) { setStatus('error'); return; }

        fetch(`/api/payment/verify?session_id=${sessionId}`)
            .then(r => r.json())
            .then(data => {
                if (data.ok) {
                    // Unlock premium in localStorage for this device
                    localStorage.setItem('fabula_premium', 'true');
                    localStorage.setItem('fabula_premium_email', data.email || '');
                    localStorage.setItem('fabula_premium_since', new Date().toISOString());
                    setEmail(data.email || '');
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            })
            .catch(() => setStatus('error'));
    }, [sessionId]);

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(160deg,#fdf6e3 0%,#f3e8ff 50%,#e0f2fe 100%)',
            padding: '2rem',
        }}>
            <div style={{
                background: 'white', borderRadius: 28, padding: '3rem',
                maxWidth: 460, width: '100%', textAlign: 'center',
                boxShadow: '0 20px 60px rgba(124,58,237,.18)',
                border: '2px solid rgba(124,58,237,.1)',
                animation: 'popIn .4s ease-out',
            }}>
                {status === 'verifying' && (
                    <>
                        <Loader2 style={{ animation: 'spin 1s linear infinite', color: '#7c3aed', margin: '0 auto 1.5rem' }} size={40} />
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#1e1b4b' }}>Verifying payment...</h2>
                        <p style={{ fontFamily: 'var(--font-playful)', color: '#64748b', marginTop: '.5rem' }}>Just a moment</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'bounce .8s ease-in-out' }}>🎉</div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', color: '#7c3aed', marginBottom: '.5rem' }}>
                            Welcome to Premium!
                        </h2>
                        <p style={{ fontFamily: 'var(--font-playful)', color: '#64748b', marginBottom: '.4rem', fontSize: '.95rem' }}>
                            Unlimited stories, all 38 languages, beautiful illustrations.
                        </p>
                        {email && (
                            <p style={{ fontFamily: 'var(--font-ui)', color: '#94a3b8', fontSize: '.82rem', marginBottom: '1.75rem' }}>
                                Receipt sent to <strong>{email}</strong>
                            </p>
                        )}

                        {/* Benefits recap */}
                        <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.06),rgba(14,165,233,.06))', borderRadius: 16, padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
                            {[
                                '✅ Unlimited stories every day',
                                '✅ All 38 languages unlocked',
                                '✅ HD illustrated stories',
                                '✅ Full exercise suite',
                                '✅ Session word bank',
                                '✅ Cancel anytime',
                            ].map(b => (
                                <p key={b} style={{ fontFamily: 'var(--font-playful)', fontSize: '.88rem', color: '#1e1b4b', marginBottom: '.35rem' }}>{b}</p>
                            ))}
                        </div>

                        <Link href="/" style={{
                            display: 'inline-block', padding: '1rem 2.5rem',
                            background: 'linear-gradient(135deg,#7c3aed,#0ea5e9)',
                            color: 'white', textDecoration: 'none',
                            borderRadius: 16, fontFamily: 'var(--font-playful)',
                            fontWeight: 700, fontSize: '1.05rem',
                            boxShadow: '0 8px 24px rgba(124,58,237,.35)',
                        }}>
                            📚 Start Reading Now
                        </Link>
                        <p style={{ marginTop: '1rem', fontSize: '.75rem', color: '#94a3b8', fontFamily: 'var(--font-playful)' }}>
                            Premium is active on this device. To use on another device, contact support.
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#e11d48', marginBottom: '.5rem' }}>
                            Verification failed
                        </h2>
                        <p style={{ fontFamily: 'var(--font-playful)', color: '#64748b', marginBottom: '1.5rem', fontSize: '.9rem' }}>
                            Payment may still have gone through — check your email for a Stripe receipt. If you were charged, contact us and we'll sort it out.
                        </p>
                        <Link href="/" style={{ color: '#7c3aed', fontFamily: 'var(--font-playful)', fontWeight: 600, textDecoration: 'none' }}>
                            ← Back to home
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <main style={{ minHeight: '100vh' }}>
            <Suspense fallback={
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#fdf6e3 0%,#f3e8ff 50%,#e0f2fe 100%)' }}>
                    <Loader2 style={{ animation: 'spin 1s linear infinite', color: '#7c3aed' }} size={36} />
                </div>
            }>
                <SuccessContent />
            </Suspense>
        </main>
    );
}
