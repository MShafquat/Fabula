'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Sparkles, Volume2, Play, Pause, Languages } from 'lucide-react';

const speak = (text, lang, onEnd) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
        'Spanish': 'es-ES',
        'French': 'fr-FR',
        'German': 'de-DE',
        'Italian': 'it-IT',
        'Japanese': 'ja-JP',
        'English': 'en-US'
    };
    // Ensure case-insensitive mapping and fallback
    const resolvedLang = langMap[lang] || langMap[Object.keys(langMap).find(k => k.toLowerCase() === lang?.toLowerCase())] || 'en-US';
    utterance.lang = resolvedLang;
    utterance.rate = 0.9;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
};

const WordPopup = ({ wordData, position, onClose, isLoading, lang }) => {
    if (!wordData && !isLoading) return null;

    const targetLang = wordData.lang || lang || 'Spanish';

    return (
        <div
            style={{
                position: 'absolute',
                zIndex: 1000,
                background: '#fffef0', // Warm parchment yellow
                padding: '1.25rem',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                border: '2px solid #8a0303',
                minWidth: '280px',
                maxWidth: '350px',
                top: position.y + 'px',
                left: position.x + 'px',
                pointerEvents: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555' }}>
                        <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={16} />
                        <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-sc)' }}>Consulting the Oracle...</span>
                    </div>
                ) : (
                    <>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h4 style={{ fontSize: '1.25rem', color: '#8a0303', fontWeight: 'bold' }}>{wordData.word}</h4>
                                <button
                                    onClick={() => speak(wordData.word, targetLang)}
                                    style={{ background: 'none', border: 'none', color: '#8a0303', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    title="Listen"
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-sc)', textTransform: 'uppercase', background: '#f5f5f5', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#666', marginTop: '0.25rem', display: 'inline-block' }}>{wordData.part_of_speech}</span>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}>✕</button>
                    </>
                )}
            </div>

            {!isLoading && wordData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#666' }}>{wordData.pronunciation}</p>
                        <p style={{ fontStyle: 'italic', color: '#8a0303', fontSize: '1.1rem', fontWeight: '500' }}>{wordData.translation}</p>
                    </div>

                    <p style={{ fontSize: '0.95rem', color: '#333', lineHeight: '1.5' }}>{wordData.definition}</p>

                    {wordData.example && (
                        <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: '#555', borderLeft: '3px solid #dac292' }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '0.25rem' }}>"{wordData.example}"</p>
                            {wordData.example_translation && (
                                <p style={{ color: '#888', fontSize: '0.75rem' }}>{wordData.example_translation}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

function Quiz({ exercises }) {
    const [answers, setAnswers] = useState({});

    const handleOptionClick = (exerciseIndex, option) => {
        if (answers[exerciseIndex]) return;
        setAnswers(prev => ({ ...prev, [exerciseIndex]: option }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {exercises.map((ex, i) => {
                const selected = answers[i];
                const isCorrect = selected === ex.answer;

                return (
                    <div key={i} style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.08)'
                    }}>
                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem', color: '#1a1a1a' }}>{ex.question}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {ex.options && ex.options.map((opt, j) => {
                                let btnStyle = {
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '0.75rem 1rem',
                                    fontSize: '1rem',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s',
                                    border: '1px solid',
                                    cursor: selected ? 'default' : 'pointer',
                                    background: 'white',
                                    fontFamily: 'var(--font-body)'
                                };

                                if (selected) {
                                    if (opt === ex.answer) {
                                        btnStyle.background = '#dcfce7';
                                        btnStyle.borderColor = '#16a34a';
                                        btnStyle.color = '#166534';
                                    } else if (opt === selected) {
                                        btnStyle.background = '#fee2e2';
                                        btnStyle.borderColor = '#dc2626';
                                        btnStyle.color = '#991b1b';
                                    } else {
                                        btnStyle.borderColor = '#e5e7eb';
                                        btnStyle.opacity = 0.5;
                                    }
                                } else {
                                    btnStyle.borderColor = '#d1d5db';
                                }

                                return (
                                    <button
                                        key={j}
                                        style={btnStyle}
                                        onClick={() => handleOptionClick(i, opt)}
                                        disabled={!!selected}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                        {selected && (
                            <div style={{
                                marginTop: '1rem',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                color: isCorrect ? '#16a34a' : '#dc2626',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Sparkles size={16} />
                                {isCorrect ? "Masterfully done!" : `A learning moment. The correct answer is: ${ex.answer}`}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function InteractiveText({ content, vocabulary }) {
    const vocabMap = new Map();
    vocabulary.forEach(v => vocabMap.set(v.word.toLowerCase(), v));

    const words = content.split(/(\s+|[.,;!?。、！？]+)/);

    return (
        <p>
            {words.map((part, i) => {
                const cleanPart = part.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
                const vocabMatch = vocabMap.get(cleanPart);

                if (vocabMatch) {
                    return (
                        <span
                            key={i}
                            style={{
                                color: '#8a0303',
                                fontWeight: 'bold',
                                borderBottom: '2px dotted rgba(138, 3, 3, 0.4)',
                                transition: 'all 0.2s',
                                cursor: 'help'
                            }}
                            title="Double-click to define"
                        >
                            {part}
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </p>
    );
}

function StoryContent() {
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') || 'Spanish';
    const level = searchParams.get('level') || 'Beginner';
    const topic = searchParams.get('topic') || 'Fable';

    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTranslation, setShowTranslation] = useState(false);
    const [audioStatus, setAudioStatus] = useState('stopped'); // stopped, playing, paused

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined') {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const toggleStoryAudio = () => {
        if (typeof window === 'undefined') return;

        if (audioStatus === 'playing') {
            window.speechSynthesis.pause();
            setAudioStatus('paused');
        } else if (audioStatus === 'paused') {
            window.speechSynthesis.resume();
            setAudioStatus('playing');
        } else {
            speak(story.content, lang, () => setAudioStatus('stopped'));
            setAudioStatus('playing');
        }
    };
    const [popupState, setPopupState] = useState({
        isOpen: false,
        position: { x: 0, y: 0 },
        isLoading: false,
        data: null
    });

    useEffect(() => {
        async function fetchStory() {
            setLoading(true);
            try {
                const res = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ language: lang, level, topic }),
                });
                const data = await res.json();
                setStory(data);
            } catch (e) {
                console.error("Failed to generate", e);
            } finally {
                setLoading(false);
            }
        }
        fetchStory();
    }, [lang, level, topic]);

    useEffect(() => {
        const handleClick = (e) => {
            if (popupState.isOpen) {
                if (e.target.closest('[data-story-text]')) return;
                setPopupState(prev => ({ ...prev, isOpen: false }));
            }
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [popupState.isOpen]);

    const handleWordDoubleClick = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const selection = window.getSelection();
        const word = selection.toString().trim();

        if (!word) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Calculate position relative to document
        let x = rect.left + (rect.width / 2) - 140 + window.scrollX;
        let y = rect.bottom + window.scrollY + 8;

        // Boundaries check
        if (x < 10) x = 10;
        if (x + 300 > window.innerWidth) x = window.innerWidth - 310;
        // Flip above if not enough space at bottom
        if (y + 250 > window.innerHeight + window.scrollY) {
            y = rect.top + window.scrollY - 200;
        }

        setPopupState({
            isOpen: true,
            position: { x, y },
            isLoading: true,
            data: { word }
        });

        const cleanWord = word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
        const knownVocab = story?.vocabulary?.find(v => v.word.toLowerCase() === cleanWord);

        if (knownVocab) {
            setPopupState(prev => ({
                ...prev,
                isLoading: false,
                data: knownVocab
            }));
            return;
        }

        try {
            const res = await fetch('/api/define', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word, context: story.content, language: lang }),
            });
            const data = await res.json();

            setPopupState(prev => {
                if (!prev.isOpen) return prev;
                return { ...prev, isLoading: false, data };
            });

        } catch (err) {
            console.error(err);
            setPopupState(prev => ({ ...prev, isOpen: false }));
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '3rem',
                background: 'linear-gradient(135deg, #faf8f3 0%, #f4e4bc 100%)'
            }}>
                <Loader2 style={{ animation: 'spin 1s linear infinite', marginBottom: '1.5rem', color: '#8a0303' }} size={64} />
                <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#1a1a1a', marginBottom: '1rem' }}>The Scribe is Dipping Their Quill</h2>
                <p style={{ color: '#555', fontSize: '1.25rem', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>Conjuring a {level} {lang} {topic}...</p>
            </div>
        );
    }

    if (!story) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f3' }}>
                <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#8a0303', fontSize: '1.2rem', marginBottom: '1rem' }}>The magic failed to bind the words.</p>
                    <Link href="/" style={{ color: '#555', textDecoration: 'underline' }}>Return to Library</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #faf8f3 0%, #f4e4bc 100%)',
            padding: '3rem 1.5rem'
        }}>
            {popupState.isOpen && (
                <WordPopup
                    {...popupState}
                    onClose={() => setPopupState(p => ({ ...p, isOpen: false }))}
                    wordData={popupState.data}
                    lang={lang}
                />
            )}

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: '#555',
                    textDecoration: 'none',
                    marginBottom: '2rem',
                    fontFamily: 'var(--font-sc)',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s'
                }}>
                    <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Return to Library
                </Link>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.12)',
                    borderRadius: '16px',
                    padding: 'clamp(2rem, 8vw, 4rem)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    marginBottom: '4rem'
                }}>
                    {story.imageUrl && (
                        <div style={{
                            width: '100%',
                            marginBottom: '2rem',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
                            background: '#fafafa',
                            border: '1px solid #eee',
                            position: 'relative'
                        }}>
                            <img
                                src={story.imageUrl}
                                alt="Story Illustration"
                                style={{ width: '100%', height: 'auto', display: 'block', mixBlendMode: 'multiply' }}
                            />
                            <button
                                onClick={toggleStoryAudio}
                                style={{
                                    position: 'absolute',
                                    bottom: '1rem',
                                    right: '1rem',
                                    background: 'rgba(138, 3, 3, 0.9)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    transition: 'transform 0.2s',
                                    zIndex: 10
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                title={audioStatus === 'playing' ? "Pause" : "Play story"}
                            >
                                {audioStatus === 'playing' ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                            </button>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1
                            style={{
                                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                                marginBottom: '0.5rem',
                                color: '#8a0303',
                                fontFamily: 'var(--font-heading)',
                                lineHeight: '1.1',
                                cursor: 'help'
                            }}
                            title="Double-click for translation"
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                const rect = e.currentTarget.getBoundingClientRect();
                                setPopupState({
                                    isOpen: true,
                                    position: {
                                        x: rect.left + (rect.width / 2) - 140 + window.scrollX,
                                        y: rect.bottom + window.scrollY + 8
                                    },
                                    isLoading: false,
                                    data: {
                                        word: story.title,
                                        translation: story.title_translation,
                                        definition: "The title of our tale.",
                                        part_of_speech: "Title",
                                        lang: lang
                                    }
                                });
                            }}
                        >
                            {story.title}
                        </h1>
                        {story.title_translation && (
                            <p style={{
                                fontFamily: 'var(--font-sc)',
                                color: '#666',
                                fontSize: '1rem',
                                opacity: 0.8
                            }}>
                                {story.title_translation}
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <button
                            onClick={() => setShowTranslation(!showTranslation)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: showTranslation ? '#8a0303' : 'transparent',
                                color: showTranslation ? 'white' : '#8a0303',
                                border: '1px solid #8a0303',
                                borderRadius: '20px',
                                fontSize: '0.875rem',
                                fontFamily: 'var(--font-sc)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Languages size={16} />
                            {showTranslation ? "Hide Translation" : "Show Translation"}
                        </button>
                    </div>

                    <div
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'clamp(1.2rem, 3vw, 1.4rem)',
                            lineHeight: '1.9',
                            color: '#2d3748',
                            cursor: 'text',
                            userSelect: 'text'
                        }}
                        onDoubleClick={handleWordDoubleClick}
                        data-story-text="true"
                    >
                        <InteractiveText
                            content={story.content}
                            vocabulary={story.vocabulary}
                        />
                    </div>

                    {showTranslation && story.content_translation && (
                        <div style={{
                            marginTop: '2rem',
                            padding: '2rem',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            borderLeft: '4px solid #dac292',
                            fontFamily: 'var(--font-body)',
                            fontSize: '1.1rem',
                            color: '#475569',
                            lineHeight: '1.7',
                            fontStyle: 'italic'
                        }}>
                            <p>{story.content_translation}</p>
                        </div>
                    )}

                    {story.exercises && story.exercises.length > 0 && (
                        <div style={{ marginTop: '5rem', borderTop: '2px solid #f1f5f9', paddingTop: '4rem' }}>
                            <h3 style={{
                                fontFamily: 'var(--font-sc)',
                                fontSize: '1.8rem',
                                marginBottom: '2.5rem',
                                color: '#8a0303',
                                textAlign: 'center',
                                letterSpacing: '0.1em'
                            }}>Chamber of Reflection</h3>
                            <Quiz exercises={story.exercises} />
                        </div>
                    )}
                </div>

                {/* Lexicon Section */}
                <div style={{ marginBottom: '6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, #dac292, transparent)' }}></div>
                        <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: '#1a1a1a', letterSpacing: '0.05em' }}>Lexicon</h2>
                        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, #dac292, transparent)' }}></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {story.vocabulary.map((vocab, i) => (
                            <div key={i} style={{
                                padding: '2rem',
                                background: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                border: '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <h4 style={{ fontSize: '1.5rem', color: '#8a0303', fontWeight: 'bold' }}>{vocab.word}</h4>
                                        <button
                                            onClick={() => speak(vocab.word, lang)}
                                            style={{ background: 'none', border: 'none', color: '#8a0303', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                            title="Listen"
                                        >
                                            <Volume2 size={18} />
                                        </button>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-sc)', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '20px', color: '#64748b', fontWeight: 'bold', border: '1px solid #e2e8f0' }}>{vocab.part_of_speech}</span>
                                </div>
                                <p style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: '#94a3b8', marginBottom: '0.5rem' }}>{vocab.pronunciation}</p>
                                <p style={{ fontSize: '1.2rem', fontStyle: 'italic', color: '#334155', fontWeight: '500', marginBottom: '1rem' }}>{vocab.translation}</p>
                                <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', marginBottom: '1.5rem' }}>{vocab.definition}</p>

                                {vocab.example && (
                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #cbd5e1' }}>
                                        <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#475569', marginBottom: '0.4rem' }}>"{vocab.example}"</p>
                                        {vocab.example_translation && (
                                            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{vocab.example_translation}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StoryPage() {
    return (
        <main style={{ minHeight: '100vh', scrollBehavior: 'smooth' }}>
            <Suspense fallback={
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f3' }}>
                    <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={48} color="#8a0303" />
                </div>
            }>
                <StoryContent />
            </Suspense>
        </main>
    );
}
