import Link from 'next/link';
import { BookOpen, Sparkles } from 'lucide-react';

export default function Home() {
    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            background: 'linear-gradient(135deg, #faf8f3 0%, #f4e4bc 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Elements */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.05,
                pointerEvents: 'none'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: '40px',
                    width: '120px',
                    height: '120px',
                    border: '4px solid #8a0303',
                    transform: 'rotate(12deg)'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '40px',
                    width: '150px',
                    height: '150px',
                    border: '4px solid #8a0303',
                    transform: 'rotate(-6deg)'
                }}></div>
            </div>

            <div style={{
                zIndex: 10,
                width: '100%',
                maxWidth: '650px',
                margin: '0 auto'
            }}>
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <BookOpen size={72} color="#8a0303" strokeWidth={1.5} />
                            <Sparkles style={{ position: 'absolute', top: '-8px', right: '-8px', color: '#8a0303' }} size={24} />
                        </div>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(3.5rem, 10vw, 5rem)',
                        marginBottom: '1.5rem',
                        color: '#8a0303',
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '0.02em',
                        textShadow: '3px 3px 0px rgba(244, 228, 188, 0.6)'
                    }}>
                        Fabula
                    </h1>

                    <p style={{
                        fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                        fontFamily: 'var(--font-body)',
                        fontStyle: 'italic',
                        color: '#555555',
                        maxWidth: '500px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        Weave your path to fluency through the magic of storytelling
                    </p>
                </div>

                {/* Form Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    border: '2px solid rgba(0, 0, 0, 0.08)',
                    padding: 'clamp(2rem, 5vw, 3rem)'
                }}>
                    <form action="/story" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Language Selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <label style={{
                                display: 'block',
                                textAlign: 'center',
                                fontFamily: 'var(--font-sc)',
                                fontSize: '1.25rem',
                                color: '#8a0303',
                                letterSpacing: '0.05em'
                            }}>
                                Choose Your Language
                            </label>
                            <select name="lang" style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.95)',
                                border: '2px solid #d1d5db',
                                borderRadius: '12px',
                                fontFamily: 'var(--font-body)',
                                fontSize: '1.1rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                            }}>
                                <option value="Spanish">🇪🇸 Spanish</option>
                                <option value="French">🇫🇷 French</option>
                                <option value="German">🇩🇪 German</option>
                                <option value="Italian">🇮🇹 Italian</option>
                                <option value="Japanese">🇯🇵 Japanese</option>
                            </select>
                        </div>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #d1d5db, transparent)' }}></div>
                            <Sparkles size={16} style={{ color: '#9ca3af' }} />
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #d1d5db, transparent)' }}></div>
                        </div>

                        {/* Level Selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <label style={{
                                display: 'block',
                                textAlign: 'center',
                                fontFamily: 'var(--font-sc)',
                                fontSize: '1.25rem',
                                color: '#8a0303',
                                letterSpacing: '0.05em'
                            }}>
                                Your Skill Level
                            </label>
                            <select name="level" style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.95)',
                                border: '2px solid #d1d5db',
                                borderRadius: '12px',
                                fontFamily: 'var(--font-body)',
                                fontSize: '1.1rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                            }}>
                                <option value="Beginner">📖 Apprentice (Beginner)</option>
                                <option value="Intermediate">✍️ Scribe (Intermediate)</option>
                                <option value="Advanced">🎓 Scholar (Advanced)</option>
                            </select>
                        </div>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #d1d5db, transparent)' }}></div>
                            <Sparkles size={16} style={{ color: '#9ca3af' }} />
                            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #d1d5db, transparent)' }}></div>
                        </div>

                        {/* Topic Selection */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <label style={{
                                display: 'block',
                                textAlign: 'center',
                                fontFamily: 'var(--font-sc)',
                                fontSize: '1.25rem',
                                color: '#8a0303',
                                letterSpacing: '0.05em'
                            }}>
                                Choose Your Tale
                            </label>
                            <select name="topic" style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.95)',
                                border: '2px solid #d1d5db',
                                borderRadius: '12px',
                                fontFamily: 'var(--font-body)',
                                fontSize: '1.1rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                            }}>
                                <option value="Fable">🦊 Ancient Fable</option>
                                <option value="Mystery">🔍 Victorian Mystery</option>
                                <option value="Adventure">⚔️ High Adventure</option>
                                <option value="SciFi">🔮 Clockwork Future</option>
                                <option value="Romance">💝 Courtly Romance</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <div style={{ paddingTop: '1.5rem' }}>
                            <button type="submit" style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'center',
                                fontSize: '1.5rem',
                                textDecoration: 'none',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                background: '#1a1a1a',
                                color: '#ffffff',
                                border: '2px solid #1a1a1a',
                                fontFamily: 'var(--font-sc)',
                                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}>
                                Open the Book ✨
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p style={{
                    marginTop: '2.5rem',
                    textAlign: 'center',
                    opacity: 0.5,
                    fontFamily: 'var(--font-sc)',
                    fontSize: '0.875rem',
                    letterSpacing: '0.1em',
                    color: '#555555'
                }}>
                    Powered by Arcade & OpenAI
                </p>
            </div>
        </main>
    );
}
