'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Sparkles, ChevronLeft, Search } from 'lucide-react';

const LEVELS = [
    { id: 'beginner', label: 'Beginner', emoji: '🌱', sublabel: 'Just starting out', level: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate', emoji: '📖', sublabel: 'Building confidence', level: 'Intermediate' },
    { id: 'advanced', label: 'Advanced', emoji: '🎯', sublabel: 'Polishing fluency', level: 'Advanced' },
];

const LANGUAGES = [
    { code: 'Spanish', emoji: '🇪🇸', label: 'Spanish', group: 'European' },
    { code: 'French', emoji: '🇫🇷', label: 'French', group: 'European' },
    { code: 'German', emoji: '🇩🇪', label: 'German', group: 'European' },
    { code: 'Italian', emoji: '🇮🇹', label: 'Italian', group: 'European' },
    { code: 'Portuguese', emoji: '🇵🇹', label: 'Portuguese', group: 'European' },
    { code: 'Dutch', emoji: '🇳🇱', label: 'Dutch', group: 'European' },
    { code: 'Polish', emoji: '🇵🇱', label: 'Polish', group: 'European' },
    { code: 'Swedish', emoji: '🇸🇪', label: 'Swedish', group: 'European' },
    { code: 'Finnish', emoji: '🇫🇮', label: 'Finnish', group: 'European' },
    { code: 'Czech', emoji: '🇨🇿', label: 'Czech', group: 'European' },
    { code: 'Romanian', emoji: '🇷🇴', label: 'Romanian', group: 'European' },
    { code: 'Greek', emoji: '🇬🇷', label: 'Greek', group: 'European' },
    { code: 'Norwegian', emoji: '🇳🇴', label: 'Norwegian', group: 'European' },
    { code: 'Japanese', emoji: '🇯🇵', label: 'Japanese', group: 'Asian' },
    { code: 'Mandarin Chinese', emoji: '🇨🇳', label: 'Mandarin', group: 'Asian' },
    { code: 'Korean', emoji: '🇰🇷', label: 'Korean', group: 'Asian' },
    { code: 'Thai', emoji: '🇹🇭', label: 'Thai', group: 'Asian' },
    { code: 'Vietnamese', emoji: '🇻🇳', label: 'Vietnamese', group: 'Asian' },
    { code: 'Hindi', emoji: '🇮🇳', label: 'Hindi', group: 'Asian' },
    { code: 'Indonesian', emoji: '🇮🇩', label: 'Indonesian', group: 'Asian' },
    { code: 'Arabic', emoji: '🇸🇦', label: 'Arabic', group: 'Other' },
    { code: 'Turkish', emoji: '🇹🇷', label: 'Turkish', group: 'Other' },
    { code: 'Russian', emoji: '🇷🇺', label: 'Russian', group: 'Other' },
    { code: 'Hebrew', emoji: '🇮🇱', label: 'Hebrew', group: 'Other' },
    { code: 'Swahili', emoji: '🇰🇪', label: 'Swahili', group: 'Other' },
    { code: 'Amharic', emoji: '🇪🇹', label: 'Amharic', group: 'Other' },
];

const CATEGORIES = [
    {
        group: 'Adventure & Fantasy', color: '#e63946', topics: [
            { code: 'High Adventure', emoji: '⚔️', label: 'High Adventure' },
            { code: 'Fantasy Quest', emoji: '🐉', label: 'Fantasy Quest' },
            { code: 'Treasure Hunt', emoji: '💰', label: 'Treasure Hunt' },
            { code: 'Magic School', emoji: '✨', label: 'Magic School' },
            { code: 'Pirate Stories', emoji: '🏴‍☠️', label: 'Pirate Stories' },
            { code: 'Superhero', emoji: '🦸', label: 'Superhero' },
        ]
    },
    {
        group: 'Mystery & Drama', color: '#7b2cbf', topics: [
            { code: 'Detective Story', emoji: '🕵️', label: 'Detective Story' },
            { code: 'Suspenseful Tale', emoji: '😱', label: 'Suspenseful Tale' },
            { code: 'Victorian Mystery', emoji: '🔍', label: 'Victorian Mystery' },
        ]
    },
    {
        group: 'Nature & Animals', color: '#06d6a0', topics: [
            { code: 'Forest Fable', emoji: '🦊', label: 'Forest Fable' },
            { code: 'Ocean Adventure', emoji: '🌊', label: 'Ocean Adventure' },
            { code: 'Animal Kingdom', emoji: '🦁', label: 'Animal Kingdom' },
            { code: 'Dinosaur Adventures', emoji: '🦕', label: 'Dinosaur Adventures' },
            { code: 'Under the Sea', emoji: '🐙', label: 'Under the Sea' },
        ]
    },
    {
        group: 'Science & Future', color: '#4361ee', topics: [
            { code: 'Space Exploration', emoji: '🚀', label: 'Space' },
            { code: 'Robot Adventure', emoji: '🤖', label: 'Robots' },
            { code: 'Time Travel', emoji: '⏰', label: 'Time Travel' },
            { code: 'Clockwork Future', emoji: '🔮', label: 'Clockwork Future' },
        ]
    },
    {
        group: 'Folklore & Tradition', color: '#f4a261', topics: [
            { code: 'Ancient Legend', emoji: '📜', label: 'Ancient Legend' },
            { code: 'Fairy Tale', emoji: '🧚', label: 'Fairy Tale' },
            { code: 'Cultural Folk Tale', emoji: '🎭', label: 'Folk Tale' },
        ]
    },
    {
        group: 'Slice of Life', color: '#ff6b6b', topics: [
            { code: 'School Day', emoji: '🎓', label: 'School Day' },
            { code: 'Summer Experience', emoji: '☀️', label: 'Summer Fun' },
            { code: 'City Exploration', emoji: '🏙️', label: 'City Explorer' },
            { code: 'Friendship Adventure', emoji: '👯', label: 'Friendship' },
            { code: 'Family Discovery', emoji: '👨‍👩‍👧‍👦', label: 'Family' },
        ]
    },
    {
        group: 'Sports & Activities', color: '#2ec4b6', topics: [
            { code: 'Sports Champions', emoji: '⚽', label: 'Sports' },
            { code: 'Cooking Adventure', emoji: '👨‍🍳', label: 'Cooking' },
            { code: 'Music Journey', emoji: '🎵', label: 'Music' },
            { code: 'Art Studio', emoji: '🎨', label: 'Art Studio' },
        ]
    },
    {
        group: 'Romance & Relationships', color: '#e9c46a', topics: [
            { code: 'Courtly Romance', emoji: '💝', label: 'Romance' },
        ]
    },
];

export default function Home() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedLang, setSelectedLang] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [langSearch, setLangSearch] = useState('');

    const selectedLevelObj = LEVELS.find(a => a.id === selectedLevel);

    const filteredLanguages = langSearch
        ? LANGUAGES.filter(l => l.label.toLowerCase().includes(langSearch.toLowerCase()))
        : LANGUAGES;

    const languageGroups = ['European', 'Asian', 'Other'];

    const handleStart = () => {
        if (!selectedLevel || !selectedLang || !selectedTopic) return;
        const level = selectedLevelObj.level;
        router.push(`/story?lang=${encodeURIComponent(selectedLang)}&level=${encodeURIComponent(level)}&topic=${encodeURIComponent(selectedTopic)}`);
    };

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem 1.5rem 4rem',
            background: 'linear-gradient(135deg, #fff4e0 0%, #e8f5ff 50%, #f0fff0 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Floating decorative shapes */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '10%', left: '5%', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(76, 201, 240, 0.15)', animation: 'float 4s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', top: '20%', right: '8%', width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(230, 57, 70, 0.1)', animation: 'float 5s ease-in-out infinite', animationDelay: '1s' }} />
                <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(6, 214, 160, 0.12)', animation: 'float 6s ease-in-out infinite', animationDelay: '2s' }} />
                <div style={{ position: 'absolute', bottom: '25%', right: '12%', width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255, 209, 102, 0.2)', animation: 'float 3.5s ease-in-out infinite', animationDelay: '0.5s' }} />
            </div>

            <div style={{ zIndex: 10, width: '100%', maxWidth: '750px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <BookOpen size={56} color="#4361ee" strokeWidth={1.5} />
                            <Sparkles style={{ position: 'absolute', top: '-6px', right: '-6px', color: '#ffd166' }} size={20} />
                        </div>
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        marginBottom: '0.75rem',
                        color: '#4361ee',
                        fontFamily: 'var(--font-playful)',
                        letterSpacing: '-0.02em',
                        textTransform: 'none'
                    }}>
                        Fabula
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                        fontFamily: 'var(--font-playful)',
                        color: '#666',
                        maxWidth: '450px',
                        margin: '0 auto',
                        lineHeight: '1.5',
                        fontWeight: '400'
                    }}>
                        Learn languages through engaging stories
                    </p>
                </div>

                {/* Step Indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', alignItems: 'center' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                                onClick={() => { if (s < step) setStep(s); }}
                                style={{
                                    width: s === step ? '36px' : '10px',
                                    height: '10px',
                                    borderRadius: '5px',
                                    background: s <= step ? '#4361ee' : '#d1d5db',
                                    transition: 'all 0.3s',
                                    cursor: s < step ? 'pointer' : 'default'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                    minHeight: '350px'
                }}>
                    {/* STEP 1: Level */}
                    {step === 1 && (
                        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                            <h2 style={{
                                textAlign: 'center',
                                fontFamily: 'var(--font-playful)',
                                fontSize: '1.6rem',
                                color: '#2d2d2d',
                                marginBottom: '2rem',
                                textTransform: 'none',
                                letterSpacing: '0'
                            }}>
                                What's your level?
                            </h2>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {LEVELS.map(lvl => (
                                    <button
                                        key={lvl.id}
                                        onClick={() => { setSelectedLevel(lvl.id); setTimeout(() => setStep(2), 300); }}
                                        style={{
                                            flex: '1 1 160px',
                                            maxWidth: '200px',
                                            padding: '1.5rem 1rem',
                                            borderRadius: '20px',
                                            border: `3px solid ${selectedLevel === lvl.id ? '#4361ee' : '#e0e0e0'}`,
                                            background: selectedLevel === lvl.id ? 'rgba(67, 97, 238, 0.05)' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.25s ease',
                                            textAlign: 'center',
                                            boxShadow: selectedLevel === lvl.id ? '0 0 0 3px rgba(67, 97, 238, 0.15)' : '0 4px 12px rgba(0,0,0,0.06)',
                                        }}
                                    >
                                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>{lvl.emoji}</span>
                                        <span style={{ fontFamily: 'var(--font-playful)', fontSize: '1.1rem', fontWeight: '600', display: 'block', color: '#2d2d2d', marginBottom: '0.25rem' }}>{lvl.label}</span>
                                        <span style={{ fontFamily: 'var(--font-playful)', fontSize: '0.8rem', color: '#888' }}>{lvl.sublabel}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Language */}
                    {step === 2 && (
                        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                            <h2 style={{
                                textAlign: 'center',
                                fontFamily: 'var(--font-playful)',
                                fontSize: '1.6rem',
                                color: '#2d2d2d',
                                marginBottom: '1.5rem',
                                textTransform: 'none',
                                letterSpacing: '0'
                            }}>
                                Pick a language
                            </h2>

                            {/* Search */}
                            <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '350px', margin: '0 auto 1.5rem' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="text"
                                    placeholder="Search languages..."
                                    value={langSearch}
                                    onChange={(e) => setLangSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        borderRadius: '12px',
                                        border: '2px solid #e0e0e0',
                                        fontFamily: 'var(--font-playful)',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4361ee'}
                                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                />
                            </div>

                            {languageGroups.map(group => {
                                const langs = filteredLanguages.filter(l => l.group === group);
                                if (langs.length === 0) return null;
                                return (
                                    <div key={group} style={{ marginBottom: '1.5rem' }}>
                                        <p style={{
                                            fontFamily: 'var(--font-playful)',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            color: '#999',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            marginBottom: '0.75rem',
                                            paddingLeft: '0.25rem'
                                        }}>
                                            {group}
                                        </p>
                                        <div className="card-selector-grid">
                                            {langs.map(lang => (
                                                <div
                                                    key={lang.code}
                                                    className={`selector-card ${selectedLang === lang.code ? 'selected' : ''}`}
                                                    onClick={() => { setSelectedLang(lang.code); setTimeout(() => setStep(3), 300); }}
                                                >
                                                    <span className="card-emoji">{lang.emoji}</span>
                                                    <span className="card-label">{lang.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* STEP 3: Topic */}
                    {step === 3 && (
                        <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                            <h2 style={{
                                textAlign: 'center',
                                fontFamily: 'var(--font-playful)',
                                fontSize: '1.6rem',
                                color: '#2d2d2d',
                                marginBottom: '2rem',
                                textTransform: 'none',
                                letterSpacing: '0'
                            }}>
                                Choose your story
                            </h2>

                            {CATEGORIES.map(cat => (
                                <div key={cat.group} style={{ marginBottom: '1.75rem' }}>
                                    <p style={{
                                        fontFamily: 'var(--font-playful)',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        color: cat.color,
                                        marginBottom: '0.75rem',
                                        paddingLeft: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: cat.color,
                                            display: 'inline-block'
                                        }} />
                                        {cat.group}
                                    </p>
                                    <div className="card-selector-grid">
                                        {cat.topics.map(topic => (
                                            <div
                                                key={topic.code}
                                                className={`selector-card ${selectedTopic === topic.code ? 'selected' : ''}`}
                                                onClick={() => setSelectedTopic(topic.code)}
                                                style={{
                                                    borderColor: selectedTopic === topic.code ? cat.color : 'transparent',
                                                    boxShadow: selectedTopic === topic.code ? `0 0 0 3px ${cat.color}22, 0 8px 24px rgba(0,0,0,0.12)` : undefined,
                                                }}
                                            >
                                                <span className="card-emoji">{topic.emoji}</span>
                                                <span className="card-label">{topic.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Navigation */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1.5rem',
                    gap: '1rem'
                }}>
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '12px',
                                border: '2px solid #d1d5db',
                                background: 'white',
                                fontFamily: 'var(--font-playful)',
                                fontWeight: '500',
                                fontSize: '0.95rem',
                                color: '#666',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <ChevronLeft size={18} /> Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {/* Selection summary */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {selectedLevel && (
                            <span style={{
                                padding: '0.35rem 0.75rem',
                                background: '#eef2ff',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontFamily: 'var(--font-playful)',
                                fontWeight: '500',
                                color: '#4361ee'
                            }}>
                                {LEVELS.find(a => a.id === selectedLevel)?.emoji} {LEVELS.find(a => a.id === selectedLevel)?.label}
                            </span>
                        )}
                        {selectedLang && (
                            <span style={{
                                padding: '0.35rem 0.75rem',
                                background: '#ecfdf5',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontFamily: 'var(--font-playful)',
                                fontWeight: '500',
                                color: '#059669'
                            }}>
                                {LANGUAGES.find(l => l.code === selectedLang)?.emoji} {LANGUAGES.find(l => l.code === selectedLang)?.label}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={!selectedLevel || !selectedLang || !selectedTopic}
                        style={{
                            padding: '0.85rem 2rem',
                            borderRadius: '14px',
                            border: 'none',
                            background: (selectedLevel && selectedLang && selectedTopic) ? 'linear-gradient(135deg, #4361ee, #4cc9f0)' : '#d1d5db',
                            color: 'white',
                            fontFamily: 'var(--font-playful)',
                            fontWeight: '700',
                            fontSize: '1.05rem',
                            cursor: (selectedLevel && selectedLang && selectedTopic) ? 'pointer' : 'default',
                            boxShadow: (selectedLevel && selectedLang && selectedTopic) ? '0 8px 20px rgba(67, 97, 238, 0.3)' : 'none',
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Create My Story! ✨
                    </button>
                </div>

                {/* Footer */}
                <p style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    opacity: 0.4,
                    fontFamily: 'var(--font-playful)',
                    fontSize: '0.8rem',
                    color: '#666'
                }}>
                    Powered by Arcade & OpenAI
                </p>
            </div>
        </main>
    );
}
