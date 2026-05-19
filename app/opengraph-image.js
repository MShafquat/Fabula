import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Fabula — Learn Languages Through Magical Stories';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 50%, #f59e0b 100%)',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background script chars */}
                {['の', 'ع', 'Ж', '한', 'α', '好', 'क'].map((ch, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        fontSize: 80 + (i % 3) * 20,
                        opacity: 0.08,
                        color: 'white',
                        top: `${10 + i * 12}%`,
                        left: i % 2 === 0 ? `${2 + i * 2}%` : undefined,
                        right: i % 2 !== 0 ? `${2 + i * 3}%` : undefined,
                    }}>{ch}</div>
                ))}

                {/* Book icon */}
                <div style={{
                    fontSize: 96,
                    marginBottom: 24,
                    filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
                }}>📚</div>

                {/* Title */}
                <div style={{
                    fontSize: 96,
                    fontWeight: 900,
                    color: 'white',
                    letterSpacing: '-2px',
                    textShadow: '0 4px 24px rgba(0,0,0,0.3)',
                    marginBottom: 16,
                }}>Fabula</div>

                {/* Tagline */}
                <div style={{
                    fontSize: 32,
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 500,
                    marginBottom: 40,
                    textAlign: 'center',
                    maxWidth: 800,
                    lineHeight: 1.4,
                }}>
                    Learn any language through magical AI stories
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', gap: 16 }}>
                    {['🌍 38 Languages', '⚡ No Account Needed', '🎮 Interactive Exercises'].map((badge) => (
                        <div key={badge} style={{
                            padding: '10px 24px',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: 50,
                            color: 'white',
                            fontSize: 22,
                            fontWeight: 600,
                            border: '1px solid rgba(255,255,255,0.25)',
                        }}>{badge}</div>
                    ))}
                </div>
            </div>
        ),
        { ...size }
    );
}
