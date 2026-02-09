'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Sparkles, Volume2, Play, Pause, Languages } from 'lucide-react';

const langMap = {
    'Spanish': 'es-ES', 'French': 'fr-FR', 'German': 'de-DE',
    'Italian': 'it-IT', 'Japanese': 'ja-JP', 'English': 'en-US',
    'Portuguese': 'pt-PT', 'Dutch': 'nl-NL', 'Polish': 'pl-PL',
    'Swedish': 'sv-SE', 'Finnish': 'fi-FI', 'Czech': 'cs-CZ',
    'Romanian': 'ro-RO', 'Greek': 'el-GR', 'Norwegian': 'nb-NO',
    'Mandarin Chinese': 'zh-CN', 'Korean': 'ko-KR', 'Thai': 'th-TH',
    'Vietnamese': 'vi-VN', 'Hindi': 'hi-IN', 'Indonesian': 'id-ID',
    'Arabic': 'ar-SA', 'Turkish': 'tr-TR', 'Russian': 'ru-RU',
    'Hebrew': 'he-IL', 'Swahili': 'sw-KE', 'Amharic': 'am-ET',
};

const speak = (text, lang, onEnd) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const resolvedLang = langMap[lang] || langMap[Object.keys(langMap).find(k => k.toLowerCase() === lang?.toLowerCase())] || 'en-US';
    utterance.lang = resolvedLang;
    utterance.rate = 0.9;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
};

// ============================================
// CONFETTI
// ============================================

function Confetti({ active }) {
    const pieces = useMemo(() => {
        const colors = ['#e63946', '#4cc9f0', '#06d6a0', '#ffd166', '#ef476f', '#4361ee'];
        return Array.from({ length: 40 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            color: colors[i % 6],
            delay: Math.random() * 0.5,
            size: 6 + Math.random() * 8,
            rotation: Math.random() * 360,
            isRound: Math.random() > 0.5,
        }));
    }, []);

    if (!active) return null;

    return (
        <div className="confetti-container">
            {pieces.map(p => (
                <div key={p.id} className="confetti-piece" style={{
                    left: p.left + '%',
                    top: '-10px',
                    width: p.size + 'px',
                    height: p.size + 'px',
                    background: p.color,
                    borderRadius: p.isRound ? '50%' : '2px',
                    animationDelay: p.delay + 's',
                    transform: `rotate(${p.rotation}deg)`,
                }} />
            ))}
        </div>
    );
}

// ============================================
// WORD POPUP
// ============================================

const WordPopup = ({ wordData, position, onClose, isLoading, lang }) => {
    if (!wordData && !isLoading) return null;
    const targetLang = wordData?.lang || lang || 'Spanish';

    return (
        <div
            style={{
                position: 'absolute',
                zIndex: 1000,
                background: '#fffef0',
                padding: '1.25rem',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                border: '2px solid var(--crimson)',
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
                        <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-playful)' }}>Looking it up...</span>
                    </div>
                ) : (
                    <>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h4 style={{ fontSize: '1.25rem', color: 'var(--crimson)', fontWeight: 'bold' }}>{wordData.word}</h4>
                                <button
                                    onClick={() => speak(wordData.word, targetLang)}
                                    style={{ background: 'none', border: 'none', color: 'var(--crimson)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    title="Listen"
                                >
                                    <Volume2 size={16} />
                                </button>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-playful)', textTransform: 'uppercase', background: '#f5f5f5', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#666', marginTop: '0.25rem', display: 'inline-block' }}>{wordData.part_of_speech}</span>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}>✕</button>
                    </>
                )}
            </div>

            {!isLoading && wordData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#666' }}>{wordData.pronunciation}</p>
                        <p style={{ fontStyle: 'italic', color: 'var(--crimson)', fontSize: '1.1rem', fontWeight: '500' }}>{wordData.translation}</p>
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

// ============================================
// CLASSIC EXERCISE (comprehension, fill_in_blank, vocabulary MC)
// ============================================

function ClassicExercise({ exercise: ex, index: i, onAnswer }) {
    const [selected, setSelected] = useState(null);
    const [fillValue, setFillValue] = useState('');

    const isCorrect = selected === ex.answer || (ex.type === 'fill_in_blank' && selected && selected.toLowerCase() === ex.answer.toLowerCase());

    const handleOptionClick = (option) => {
        if (selected) return;
        setSelected(option);
        onAnswer(i, option === ex.answer);
    };

    const handleFillSubmit = (value) => {
        if (selected) return;
        const trimmed = value.trim();
        setSelected(trimmed);
        onAnswer(i, trimmed.toLowerCase() === ex.answer.toLowerCase());
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.5)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.08)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {ex.type && (
                <div style={{
                    display: 'inline-block',
                    background: ex.type === 'comprehension' ? '#eef2ff' : ex.type === 'fill_in_blank' ? '#fef3c7' : '#ecfdf5',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: ex.type === 'comprehension' ? '#4361ee' : ex.type === 'fill_in_blank' ? '#d97706' : '#059669',
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-playful)'
                }}>
                    {ex.type === 'comprehension' ? '📖 Comprehension' : ex.type === 'fill_in_blank' ? '✏️ Fill in Blank' : '📚 Vocabulary'}
                </div>
            )}

            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem', color: '#1a1a1a', fontFamily: 'var(--font-playful)' }}>{ex.question}</p>

            {ex.type !== 'fill_in_blank' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {ex.options && ex.options.map((opt, j) => {
                        let btnStyle = {
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.75rem 1rem',
                            fontSize: '1rem',
                            borderRadius: '12px',
                            transition: 'all 0.2s',
                            border: '2px solid',
                            cursor: selected ? 'default' : 'pointer',
                            background: 'white',
                            fontFamily: 'var(--font-playful)',
                            fontWeight: '500'
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
                                btnStyle.animation = 'shake 0.5s ease';
                            } else {
                                btnStyle.borderColor = '#e5e7eb';
                                btnStyle.opacity = 0.5;
                            }
                        } else {
                            btnStyle.borderColor = '#d1d5db';
                        }

                        return (
                            <button key={j} style={btnStyle} onClick={() => handleOptionClick(opt)} disabled={!!selected}>
                                {opt}
                            </button>
                        );
                    })}
                </div>
            )}

            {ex.type === 'fill_in_blank' && (
                <div>
                    <input
                        type="text"
                        placeholder="Type your answer..."
                        disabled={!!selected}
                        value={fillValue}
                        onChange={(e) => { if (!selected) setFillValue(e.target.value); }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && fillValue.trim() && !selected) {
                                handleFillSubmit(fillValue);
                            }
                        }}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            fontSize: '1rem',
                            borderRadius: '12px',
                            border: '2px solid #d1d5db',
                            fontFamily: 'var(--font-playful)',
                            marginBottom: '0.75rem',
                            opacity: selected ? '0.5' : '1'
                        }}
                    />
                    {!selected && (
                        <button
                            onClick={() => handleFillSubmit(fillValue)}
                            disabled={!fillValue.trim()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: fillValue.trim() ? 'var(--ocean-blue)' : '#ccc',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: fillValue.trim() ? 'pointer' : 'default',
                                fontSize: '1rem',
                                fontFamily: 'var(--font-playful)',
                                fontWeight: '600'
                            }}
                        >
                            Submit Answer
                        </button>
                    )}
                </div>
            )}

            {selected && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: isCorrect ? '#f0fdf4' : '#fef2f2',
                    border: `2px solid ${isCorrect ? '#86efac' : '#fecaca'}`,
                    animation: 'popIn 0.3s ease-out'
                }}>
                    <div style={{
                        fontSize: '0.95rem',
                        fontWeight: 'bold',
                        color: isCorrect ? '#22c55e' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        fontFamily: 'var(--font-playful)'
                    }}>
                        {isCorrect ? "Brilliant!" : "Not quite right"}
                    </div>
                    {ex.explanation && (
                        <p style={{ fontSize: '0.85rem', color: isCorrect ? '#15803d' : '#991b1b', marginBottom: '0.25rem', fontFamily: 'var(--font-playful)' }}>
                            {ex.explanation}
                        </p>
                    )}
                    {!isCorrect && (
                        <p style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 'bold', fontFamily: 'var(--font-playful)' }}>
                            Correct answer: <span style={{ fontStyle: 'italic' }}>{ex.answer}</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================
// WORD MATCH EXERCISE
// ============================================

function WordMatchExercise({ exercise, index, onAnswer }) {
    const [selectedWord, setSelectedWord] = useState(null);
    const [matched, setMatched] = useState({});
    const [shakeWord, setShakeWord] = useState(null);
    const [shakeTrans, setShakeTrans] = useState(null);
    const [done, setDone] = useState(false);

    const shuffledTranslations = useMemo(() => {
        if (!exercise.pairs) return [];
        return [...exercise.pairs.map(p => p.translation)].sort(() => Math.random() - 0.5);
    }, [exercise]);

    const handleWordClick = (wordIdx) => {
        if (done || matched[wordIdx] !== undefined) return;
        setSelectedWord(wordIdx);
    };

    const handleTransClick = (transIdx) => {
        if (done || selectedWord === null) return;
        const correctTrans = exercise.pairs[selectedWord].translation;

        if (shuffledTranslations[transIdx] === correctTrans) {
            const newMatched = { ...matched, [selectedWord]: transIdx };
            setMatched(newMatched);
            setSelectedWord(null);

            if (Object.keys(newMatched).length === exercise.pairs.length) {
                setDone(true);
                onAnswer(index, true);
            }
        } else {
            setShakeWord(selectedWord);
            setShakeTrans(transIdx);
            setTimeout(() => {
                setShakeWord(null);
                setShakeTrans(null);
                setSelectedWord(null);
            }, 500);
        }
    };

    const matchedTransIndices = new Set(Object.values(matched));

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.5)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.08)',
        }}>
            <div style={{
                display: 'inline-block',
                background: '#fce7f3',
                padding: '0.3rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#db2777',
                marginBottom: '0.75rem',
                fontFamily: 'var(--font-playful)'
            }}>
                🔗 Word Match
            </div>

            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'var(--font-playful)' }}>
                {exercise.instruction || 'Match each word with its translation'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Words column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {exercise.pairs.map((pair, wIdx) => (
                        <button key={wIdx} onClick={() => handleWordClick(wIdx)} disabled={matched[wIdx] !== undefined || done} style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: '2px solid',
                            borderColor: matched[wIdx] !== undefined ? 'var(--correct-green)' : selectedWord === wIdx ? 'var(--ocean-blue)' : '#d1d5db',
                            background: matched[wIdx] !== undefined ? '#dcfce7' : selectedWord === wIdx ? '#eef2ff' : 'white',
                            cursor: matched[wIdx] !== undefined || done ? 'default' : 'pointer',
                            fontFamily: 'var(--font-playful)',
                            fontWeight: '600',
                            fontSize: '1rem',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            animation: shakeWord === wIdx ? 'shake 0.5s ease' : 'none',
                            opacity: matched[wIdx] !== undefined ? 0.7 : 1
                        }}>
                            {pair.word}
                        </button>
                    ))}
                </div>

                {/* Translations column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {shuffledTranslations.map((trans, tIdx) => (
                        <button key={tIdx} onClick={() => handleTransClick(tIdx)} disabled={matchedTransIndices.has(tIdx) || done} style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: '2px solid',
                            borderColor: matchedTransIndices.has(tIdx) ? 'var(--correct-green)' : '#d1d5db',
                            background: matchedTransIndices.has(tIdx) ? '#dcfce7' : 'white',
                            cursor: matchedTransIndices.has(tIdx) || done ? 'default' : 'pointer',
                            fontFamily: 'var(--font-playful)',
                            fontWeight: '500',
                            fontSize: '0.95rem',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            animation: shakeTrans === tIdx ? 'shake 0.5s ease' : 'none',
                            opacity: matchedTransIndices.has(tIdx) ? 0.7 : 1
                        }}>
                            {trans}
                        </button>
                    ))}
                </div>
            </div>

            {done && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: '#f0fdf4',
                    border: '2px solid #86efac',
                    textAlign: 'center',
                    fontFamily: 'var(--font-playful)',
                    fontWeight: '600',
                    color: '#22c55e',
                    animation: 'popIn 0.3s ease-out'
                }}>
                    All matched! Great job!
                </div>
            )}
        </div>
    );
}

// ============================================
// WORD SCRAMBLE EXERCISE
// ============================================

function WordScrambleExercise({ exercise, index, onAnswer }) {
    const [selectedIndices, setSelectedIndices] = useState([]);
    const [result, setResult] = useState(null);

    const letters = exercise.scrambled ? exercise.scrambled.split('') : [];
    const currentWord = selectedIndices.map(i => letters[i]).join('');

    const handleLetterClick = (idx) => {
        if (selectedIndices.includes(idx) || result) return;
        const newSelected = [...selectedIndices, idx];
        setSelectedIndices(newSelected);

        if (newSelected.length === letters.length) {
            const attempt = newSelected.map(i => letters[i]).join('');
            const isCorrect = attempt.toLowerCase() === exercise.answer.toLowerCase();
            setResult(isCorrect ? 'correct' : 'wrong');
            onAnswer(index, isCorrect);
        }
    };

    const handleClear = () => {
        if (result) return;
        setSelectedIndices([]);
    };

    const handleUndo = () => {
        if (result) return;
        setSelectedIndices(prev => prev.slice(0, -1));
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.5)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.08)',
        }}>
            <div style={{
                display: 'inline-block',
                background: '#fef3c7',
                padding: '0.3rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#d97706',
                marginBottom: '0.75rem',
                fontFamily: 'var(--font-playful)'
            }}>
                🔤 Word Scramble
            </div>

            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem', fontFamily: 'var(--font-playful)' }}>
                {exercise.instruction || 'Unscramble the letters to form a word'}
            </p>

            {exercise.hint && (
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem', fontFamily: 'var(--font-playful)', fontStyle: 'italic' }}>
                    Hint: {exercise.hint}
                </p>
            )}

            {/* Current word display */}
            <div style={{
                minHeight: '56px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '2px dashed #d1d5db',
                padding: '0.75rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                flexWrap: 'wrap'
            }}>
                {currentWord ? (
                    currentWord.split('').map((letter, i) => (
                        <span key={i} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            background: result === 'correct' ? '#dcfce7' : result === 'wrong' ? '#fee2e2' : 'var(--sunshine)',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-playful)',
                            fontWeight: '600',
                            fontSize: '1.1rem',
                            border: `2px solid ${result === 'correct' ? '#16a34a' : result === 'wrong' ? '#dc2626' : '#e9c46a'}`,
                            animation: result === 'wrong' ? 'shake 0.5s ease' : 'none'
                        }}>
                            {letter}
                        </span>
                    ))
                ) : (
                    <span style={{ color: '#999', fontFamily: 'var(--font-playful)', fontSize: '0.9rem' }}>Click the letters below...</span>
                )}
            </div>

            {/* Letter tiles */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
                {letters.map((letter, idx) => (
                    <button key={idx} onClick={() => handleLetterClick(idx)} className={`letter-tile ${selectedIndices.includes(idx) ? 'used' : ''}`} style={{
                        animation: `tileAppear 0.3s ease-out ${idx * 0.05}s both`,
                    }}>
                        {letter.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Controls */}
            {!result && (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button onClick={handleUndo} disabled={selectedIndices.length === 0} style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        border: '2px solid #d1d5db',
                        background: 'white',
                        fontFamily: 'var(--font-playful)',
                        fontWeight: '500',
                        fontSize: '0.85rem',
                        opacity: selectedIndices.length === 0 ? 0.5 : 1,
                        cursor: selectedIndices.length === 0 ? 'default' : 'pointer'
                    }}>
                        Undo
                    </button>
                    <button onClick={handleClear} disabled={selectedIndices.length === 0} style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        border: '2px solid #d1d5db',
                        background: 'white',
                        fontFamily: 'var(--font-playful)',
                        fontWeight: '500',
                        fontSize: '0.85rem',
                        opacity: selectedIndices.length === 0 ? 0.5 : 1,
                        cursor: selectedIndices.length === 0 ? 'default' : 'pointer'
                    }}>
                        Clear
                    </button>
                </div>
            )}

            {result && (
                <div style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: result === 'correct' ? '#f0fdf4' : '#fef2f2',
                    border: `2px solid ${result === 'correct' ? '#86efac' : '#fecaca'}`,
                    textAlign: 'center',
                    fontFamily: 'var(--font-playful)',
                    animation: 'popIn 0.3s ease-out'
                }}>
                    <p style={{ fontWeight: '600', color: result === 'correct' ? '#22c55e' : '#ef4444', marginBottom: '0.25rem' }}>
                        {result === 'correct' ? 'Perfect!' : 'Not quite!'}
                    </p>
                    {result === 'wrong' && (
                        <p style={{ fontSize: '0.85rem', color: '#991b1b' }}>
                            The word was: <strong>{exercise.answer}</strong>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================
// SENTENCE ORDER EXERCISE
// ============================================

function SentenceOrderExercise({ exercise, index, onAnswer }) {
    const [orderedIndices, setOrderedIndices] = useState([]);
    const [result, setResult] = useState(null);

    const shuffledWords = useMemo(() => {
        if (!exercise.words) return [];
        const indices = exercise.words.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices.map(i => ({ word: exercise.words[i], originalIndex: i }));
    }, [exercise]);

    const handleWordClick = (shuffleIdx) => {
        if (orderedIndices.includes(shuffleIdx) || result) return;
        const newOrdered = [...orderedIndices, shuffleIdx];
        setOrderedIndices(newOrdered);

        if (newOrdered.length === shuffledWords.length) {
            const attempt = newOrdered.map(i => shuffledWords[i].word).join(' ');
            const isCorrect = attempt.toLowerCase() === exercise.answer.toLowerCase();
            setResult(isCorrect ? 'correct' : 'wrong');
            onAnswer(index, isCorrect);
        }
    };

    const handleUndo = () => {
        if (result) return;
        setOrderedIndices(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        if (result) return;
        setOrderedIndices([]);
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.5)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.08)',
        }}>
            <div style={{
                display: 'inline-block',
                background: '#ede9fe',
                padding: '0.3rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#7c3aed',
                marginBottom: '0.75rem',
                fontFamily: 'var(--font-playful)'
            }}>
                📝 Sentence Order
            </div>

            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem', fontFamily: 'var(--font-playful)' }}>
                {exercise.instruction || 'Put the words in the correct order'}
            </p>

            {exercise.translation && (
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem', fontFamily: 'var(--font-playful)', fontStyle: 'italic' }}>
                    Translation: {exercise.translation}
                </p>
            )}

            {/* Sentence building area */}
            <div style={{
                minHeight: '56px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '2px dashed #d1d5db',
                padding: '0.75rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
            }}>
                {orderedIndices.length > 0 ? (
                    orderedIndices.map((idx, i) => (
                        <span key={i} style={{
                            padding: '0.5rem 0.75rem',
                            background: result === 'correct' ? '#dcfce7' : result === 'wrong' ? '#fee2e2' : 'var(--sky-blue)',
                            color: result === 'correct' ? '#166534' : result === 'wrong' ? '#991b1b' : 'white',
                            borderRadius: '10px',
                            fontFamily: 'var(--font-playful)',
                            fontWeight: '500',
                            fontSize: '0.95rem',
                            animation: result === 'wrong' ? 'shake 0.5s ease' : `popIn 0.2s ease-out ${i * 0.05}s both`
                        }}>
                            {shuffledWords[idx].word}
                        </span>
                    ))
                ) : (
                    <span style={{ color: '#999', fontFamily: 'var(--font-playful)', fontSize: '0.9rem' }}>Click words to build the sentence...</span>
                )}
            </div>

            {/* Available words */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1rem' }}>
                {shuffledWords.map((item, sIdx) => (
                    <button key={sIdx} onClick={() => handleWordClick(sIdx)} disabled={orderedIndices.includes(sIdx) || !!result} style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '12px',
                        border: '2px solid',
                        borderColor: orderedIndices.includes(sIdx) ? '#e5e7eb' : 'var(--ocean-blue)',
                        background: orderedIndices.includes(sIdx) ? '#f3f4f6' : 'white',
                        color: orderedIndices.includes(sIdx) ? '#aaa' : 'var(--ocean-blue)',
                        fontFamily: 'var(--font-playful)',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        cursor: orderedIndices.includes(sIdx) || result ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: orderedIndices.includes(sIdx) ? 0.4 : 1
                    }}>
                        {item.word}
                    </button>
                ))}
            </div>

            {/* Controls */}
            {!result && (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button onClick={handleUndo} disabled={orderedIndices.length === 0} style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        border: '2px solid #d1d5db',
                        background: 'white',
                        fontFamily: 'var(--font-playful)',
                        fontWeight: '500',
                        fontSize: '0.85rem',
                        opacity: orderedIndices.length === 0 ? 0.5 : 1,
                        cursor: orderedIndices.length === 0 ? 'default' : 'pointer'
                    }}>
                        Undo
                    </button>
                    <button onClick={handleClear} disabled={orderedIndices.length === 0} style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        border: '2px solid #d1d5db',
                        background: 'white',
                        fontFamily: 'var(--font-playful)',
                        fontWeight: '500',
                        fontSize: '0.85rem',
                        opacity: orderedIndices.length === 0 ? 0.5 : 1,
                        cursor: orderedIndices.length === 0 ? 'default' : 'pointer'
                    }}>
                        Clear
                    </button>
                </div>
            )}

            {result && (
                <div style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: result === 'correct' ? '#f0fdf4' : '#fef2f2',
                    border: `2px solid ${result === 'correct' ? '#86efac' : '#fecaca'}`,
                    textAlign: 'center',
                    fontFamily: 'var(--font-playful)',
                    animation: 'popIn 0.3s ease-out'
                }}>
                    <p style={{ fontWeight: '600', color: result === 'correct' ? '#22c55e' : '#ef4444', marginBottom: '0.25rem' }}>
                        {result === 'correct' ? 'Perfect sentence!' : 'Not quite right!'}
                    </p>
                    {result === 'wrong' && (
                        <p style={{ fontSize: '0.85rem', color: '#991b1b' }}>
                            Correct order: <strong>{exercise.answer}</strong>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================
// QUIZ (Exercise Dispatcher)
// ============================================

function Quiz({ exercises, onAnswer }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {exercises.map((ex, i) => {
                switch (ex.type) {
                    case 'word_match':
                        return <WordMatchExercise key={`ex-${i}`} exercise={ex} index={i} onAnswer={onAnswer} />;
                    case 'word_scramble':
                        return <WordScrambleExercise key={`ex-${i}`} exercise={ex} index={i} onAnswer={onAnswer} />;
                    case 'sentence_order':
                        return <SentenceOrderExercise key={`ex-${i}`} exercise={ex} index={i} onAnswer={onAnswer} />;
                    default:
                        return <ClassicExercise key={`ex-${i}`} exercise={ex} index={i} onAnswer={onAnswer} />;
                }
            })}
        </div>
    );
}

// ============================================
// VOCABULARY CARD
// ============================================

function VocabularyCard({ vocab, lang, isFlipped, onFlip }) {
    return (
        <div
            onClick={onFlip}
            style={{
                perspective: '1000px',
                cursor: 'pointer',
                padding: '2rem',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9',
                minHeight: '280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease-out',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transformStyle: 'preserve-3d'
            }}
        >
            <div style={{
                backfaceVisibility: 'hidden',
                width: '100%',
                textAlign: 'center'
            }}>
                {!isFlipped ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '1.8rem', color: 'var(--crimson)', fontWeight: 'bold', wordBreak: 'break-word' }}>{vocab.word}</h4>
                                <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#94a3b8', marginTop: '0.5rem' }}>{vocab.pronunciation}</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); speak(vocab.word, lang); }}
                                style={{ background: 'none', border: 'none', color: 'var(--crimson)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}
                                title="Listen"
                            >
                                <Volume2 size={24} />
                            </button>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-playful)', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '20px', color: '#64748b', fontWeight: 'bold', border: '1px solid #e2e8f0', display: 'inline-block' }}>{vocab.part_of_speech}</div>
                        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#999', fontFamily: 'var(--font-playful)' }}>Click to reveal</p>
                    </div>
                ) : (
                    <div>
                        <p style={{ fontSize: '1.4rem', fontStyle: 'italic', color: '#334155', fontWeight: '500', marginBottom: '1rem' }}>{vocab.translation}</p>
                        <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', marginBottom: '1.5rem' }}>{vocab.definition}</p>
                        {vocab.example && (
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #cbd5e1', marginTop: '1rem', textAlign: 'left' }}>
                                <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#475569', marginBottom: '0.4rem' }}>"{vocab.example}"</p>
                                {vocab.example_translation && (
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>— {vocab.example_translation}</p>
                                )}
                            </div>
                        )}
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#999', fontFamily: 'var(--font-playful)' }}>Click to flip back</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// VOCABULARY TEST MODE
// ============================================

function VocabTest({ vocabulary, lang, onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [correctCount, setCorrectCount] = useState(0);
    const [finished, setFinished] = useState(false);

    const current = vocabulary[currentIndex];

    const handleSubmit = () => {
        if (!input.trim() || result) return;
        const isCorrect = input.trim().toLowerCase() === current.translation.toLowerCase();
        setResult(isCorrect ? 'correct' : 'wrong');
        if (isCorrect) setCorrectCount(prev => prev + 1);
    };

    const handleNext = () => {
        if (currentIndex + 1 >= vocabulary.length) {
            setFinished(true);
            onComplete?.(correctCount + (result === 'correct' ? 0 : 0));
            return;
        }
        setCurrentIndex(prev => prev + 1);
        setInput('');
        setResult(null);
    };

    if (finished) {
        const percentage = Math.round((correctCount / vocabulary.length) * 100);
        return (
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                animation: 'popIn 0.4s ease-out'
            }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    {percentage >= 80 ? '🌟' : percentage >= 50 ? '👏' : '💪'}
                </p>
                <h3 style={{ fontFamily: 'var(--font-playful)', fontSize: '1.8rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                    {percentage >= 80 ? 'Amazing!' : percentage >= 50 ? 'Good effort!' : 'Keep practicing!'}
                </h3>
                <p style={{ fontFamily: 'var(--font-playful)', fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
                    {correctCount} / {vocabulary.length} correct ({percentage}%)
                </p>
                <button onClick={() => { setCurrentIndex(0); setInput(''); setResult(null); setCorrectCount(0); setFinished(false); }} style={{
                    padding: '0.75rem 2rem',
                    background: 'var(--ocean-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontFamily: 'var(--font-playful)',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: 'pointer'
                }}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div style={{
            padding: '2rem',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            textAlign: 'center'
        }}>
            <p style={{ fontFamily: 'var(--font-playful)', fontSize: '0.85rem', color: '#999', marginBottom: '1.5rem' }}>
                Word {currentIndex + 1} of {vocabulary.length}
            </p>

            {/* Progress dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '2rem' }}>
                {vocabulary.map((_, i) => (
                    <div key={i} style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: i < currentIndex ? 'var(--correct-green)' : i === currentIndex ? 'var(--ocean-blue)' : '#e0e0e0',
                        transition: 'all 0.3s'
                    }} />
                ))}
            </div>

            <h3 style={{ fontFamily: 'var(--font-playful)', fontSize: '2rem', color: 'var(--crimson)', marginBottom: '0.5rem' }}>
                {current.word}
            </h3>
            <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{current.pronunciation}</p>
            <button onClick={() => speak(current.word, lang)} style={{
                background: 'none',
                border: 'none',
                color: 'var(--ocean-blue)',
                cursor: 'pointer',
                marginBottom: '1.5rem',
                fontSize: '1rem'
            }}>
                <Volume2 size={20} />
            </button>

            <div style={{ maxWidth: '350px', margin: '0 auto' }}>
                <input
                    type="text"
                    placeholder="Type the English translation..."
                    value={input}
                    onChange={(e) => { if (!result) setInput(e.target.value); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { result ? handleNext() : handleSubmit(); } }}
                    disabled={!!result}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1.1rem',
                        borderRadius: '12px',
                        border: `2px solid ${result === 'correct' ? '#16a34a' : result === 'wrong' ? '#dc2626' : '#d1d5db'}`,
                        fontFamily: 'var(--font-playful)',
                        textAlign: 'center',
                        marginBottom: '1rem',
                        background: result === 'correct' ? '#f0fdf4' : result === 'wrong' ? '#fef2f2' : 'white'
                    }}
                />

                {!result ? (
                    <button onClick={handleSubmit} disabled={!input.trim()} style={{
                        padding: '0.75rem 2rem',
                        background: input.trim() ? 'var(--ocean-blue)' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontFamily: 'var(--font-playful)',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: input.trim() ? 'pointer' : 'default',
                        width: '100%'
                    }}>
                        Check
                    </button>
                ) : (
                    <div>
                        {result === 'wrong' && (
                            <p style={{ fontFamily: 'var(--font-playful)', color: '#991b1b', marginBottom: '0.75rem' }}>
                                Answer: <strong>{current.translation}</strong>
                            </p>
                        )}
                        <button onClick={handleNext} style={{
                            padding: '0.75rem 2rem',
                            background: result === 'correct' ? 'var(--correct-green)' : 'var(--ocean-blue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontFamily: 'var(--font-playful)',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            width: '100%'
                        }}>
                            {currentIndex + 1 >= vocabulary.length ? 'See Results' : 'Next Word'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// INTERACTIVE TEXT
// ============================================

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
                                color: 'var(--crimson)',
                                fontWeight: 'bold',
                                borderBottom: '2px dotted rgba(230, 57, 70, 0.4)',
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

// ============================================
// STORY CONTENT (Main Component)
// ============================================

function StoryContent() {
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') || 'Spanish';
    const level = searchParams.get('level') || 'Beginner';
    const topic = searchParams.get('topic') || 'Fable';

    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTranslation, setShowTranslation] = useState(false);
    const [audioStatus, setAudioStatus] = useState('stopped');
    const [flippedCards, setFlippedCards] = useState({});
    const [vocabTestMode, setVocabTestMode] = useState(false);

    // Scoring
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [exerciseResults, setExerciseResults] = useState({});

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined') {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const triggerConfetti = () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
    };

    const recordAnswer = (exerciseIndex, isCorrect) => {
        if (exerciseResults[exerciseIndex] !== undefined) return;

        const streakBonus = isCorrect ? streak * 5 : 0;
        const points = isCorrect ? 10 + streakBonus : 0;
        const newStreak = isCorrect ? streak + 1 : 0;

        setExerciseResults(prev => ({ ...prev, [exerciseIndex]: { correct: isCorrect, points } }));
        setScore(prev => prev + points);
        setStreak(newStreak);
        if (newStreak > maxStreak) setMaxStreak(newStreak);

        if (isCorrect) triggerConfetti();
    };

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

        let x = rect.left + (rect.width / 2) - 140 + window.scrollX;
        let y = rect.bottom + window.scrollY + 8;

        if (x < 10) x = 10;
        if (x + 300 > window.innerWidth) x = window.innerWidth - 310;
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
            setPopupState(prev => ({ ...prev, isLoading: false, data: knownVocab }));
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

    // Loading screen
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
                background: 'linear-gradient(135deg, #fff4e0 0%, #e8f5ff 50%, #f0fff0 100%)'
            }}>
                <div style={{ animation: 'bounce 1s ease-in-out infinite', marginBottom: '1.5rem', fontSize: '4rem' }}>
                    📖
                </div>
                <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-playful)', color: 'var(--ink)', marginBottom: '1rem', textTransform: 'none' }}>
                    Creating your story...
                </h2>
                <p style={{ color: '#666', fontSize: '1.1rem', fontFamily: 'var(--font-playful)' }}>
                    Creating a {level.toLowerCase()} {lang} story about {topic.toLowerCase()}
                </p>
                <Loader2 style={{ animation: 'spin 1s linear infinite', marginTop: '2rem', color: 'var(--ocean-blue)' }} size={32} />
            </div>
        );
    }

    if (!story) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffdf7' }}>
                <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😅</p>
                    <p style={{ color: 'var(--crimson)', fontSize: '1.2rem', marginBottom: '1rem', fontFamily: 'var(--font-playful)' }}>Something went wrong!</p>
                    <Link href="/" style={{ color: 'var(--ocean-blue)', textDecoration: 'underline', fontFamily: 'var(--font-playful)' }}>Try again</Link>
                </div>
            </div>
        );
    }

    const answeredCount = Object.keys(exerciseResults).length;
    const totalExercises = story.exercises?.length || 0;

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fff4e0 0%, #e8f5ff 50%, #f0fff0 100%)',
            padding: '3rem 1.5rem'
        }}>
            <Confetti active={showConfetti} />

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
                    fontFamily: 'var(--font-playful)',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s'
                }}>
                    <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Stories
                </Link>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.12)',
                    borderRadius: '20px',
                    padding: 'clamp(2rem, 8vw, 4rem)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    marginBottom: '4rem'
                }}>
                    {story.imageUrl && (
                        <div style={{
                            width: '100%',
                            marginBottom: '2rem',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
                            background: '#fafafa',
                            border: '3px solid #f0e6d3',
                            position: 'relative'
                        }}>
                            <img
                                src={story.imageUrl}
                                alt="Story Illustration"
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                            <button
                                onClick={toggleStoryAudio}
                                style={{
                                    position: 'absolute',
                                    bottom: '1rem',
                                    right: '1rem',
                                    background: 'rgba(67, 97, 238, 0.9)',
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
                                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                                marginBottom: '0.5rem',
                                color: 'var(--crimson)',
                                fontFamily: 'var(--font-playful)',
                                lineHeight: '1.2',
                                cursor: 'help',
                                textTransform: 'none'
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
                                fontFamily: 'var(--font-playful)',
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
                                background: showTranslation ? 'var(--ocean-blue)' : 'transparent',
                                color: showTranslation ? 'white' : 'var(--ocean-blue)',
                                border: '2px solid var(--ocean-blue)',
                                borderRadius: '20px',
                                fontSize: '0.875rem',
                                fontFamily: 'var(--font-playful)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: '500'
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
                            vocabulary={story.vocabulary || []}
                        />
                    </div>

                    {showTranslation && story.content_translation && (
                        <div style={{
                            marginTop: '2rem',
                            padding: '2rem',
                            background: '#f0f7ff',
                            borderRadius: '12px',
                            borderLeft: '4px solid var(--ocean-blue)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '1.1rem',
                            color: '#475569',
                            lineHeight: '1.7',
                            fontStyle: 'italic'
                        }}>
                            <p>{story.content_translation}</p>
                        </div>
                    )}

                    {/* Exercises Section */}
                    {story.exercises && story.exercises.length > 0 && (
                        <div style={{ marginTop: '4rem', borderTop: '2px solid #f1f5f9', paddingTop: '3rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h3 style={{
                                    fontFamily: 'var(--font-playful)',
                                    fontSize: '1.8rem',
                                    marginBottom: '1rem',
                                    color: 'var(--ink)',
                                    textTransform: 'none',
                                    letterSpacing: '0'
                                }}>
                                    Practice Time!
                                </h3>
                            </div>

                            {/* Score Bar */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '2rem',
                                padding: '1rem 1.5rem',
                                background: 'linear-gradient(135deg, #fff4e0, #fffdf7)',
                                borderRadius: '16px',
                                border: '2px solid var(--sunshine)',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                            }}>
                                <div className="score-badge">
                                    ⭐ {score} pts
                                </div>
                                {streak >= 2 && (
                                    <div className="streak-badge" style={{ animation: 'fireFlicker 1s ease-in-out infinite' }}>
                                        🔥 {streak} streak!
                                    </div>
                                )}
                                <div style={{ fontFamily: 'var(--font-playful)', color: '#666', fontSize: '0.9rem' }}>
                                    {answeredCount} / {totalExercises} done
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ maxWidth: '100%', margin: '0 auto 2rem' }}>
                                <div style={{
                                    background: '#f0f0f0',
                                    borderRadius: '20px',
                                    height: '12px',
                                    overflow: 'hidden',
                                    border: '2px solid #e0e0e0'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        background: 'linear-gradient(90deg, var(--ocean-blue), var(--sky-blue))',
                                        width: `${totalExercises > 0 ? (answeredCount / totalExercises) * 100 : 0}%`,
                                        transition: 'width 0.5s ease',
                                        borderRadius: '20px'
                                    }}></div>
                                </div>
                            </div>

                            <Quiz exercises={story.exercises} onAnswer={recordAnswer} />

                            {/* All done message */}
                            {answeredCount === totalExercises && totalExercises > 0 && (
                                <div style={{
                                    marginTop: '2rem',
                                    padding: '2rem',
                                    background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                                    borderRadius: '16px',
                                    border: '2px solid var(--correct-green)',
                                    textAlign: 'center',
                                    animation: 'popIn 0.4s ease-out'
                                }}>
                                    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</p>
                                    <h4 style={{ fontFamily: 'var(--font-playful)', fontSize: '1.4rem', color: 'var(--ink)', textTransform: 'none', marginBottom: '0.5rem' }}>
                                        All exercises complete!
                                    </h4>
                                    <p style={{ fontFamily: 'var(--font-playful)', color: '#666', fontSize: '1rem' }}>
                                        Final score: <strong>{score} points</strong>
                                        {maxStreak >= 3 && <span> | Best streak: 🔥 {maxStreak}</span>}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Lexicon Section */}
                <div style={{ marginBottom: '6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, var(--ocean-blue), transparent)' }}></div>
                        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-playful)', color: 'var(--ink)', letterSpacing: '0', textTransform: 'none' }}>Vocabulary</h2>
                        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, transparent, var(--ocean-blue), transparent)' }}></div>
                    </div>

                    {/* Toggle between cards and test mode */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '0.75rem' }}>
                        <button
                            onClick={() => setVocabTestMode(false)}
                            style={{
                                padding: '0.6rem 1.25rem',
                                borderRadius: '12px',
                                border: '2px solid',
                                borderColor: !vocabTestMode ? 'var(--ocean-blue)' : '#d1d5db',
                                background: !vocabTestMode ? 'var(--ocean-blue)' : 'white',
                                color: !vocabTestMode ? 'white' : '#666',
                                fontFamily: 'var(--font-playful)',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            📇 Flash Cards
                        </button>
                        <button
                            onClick={() => setVocabTestMode(true)}
                            style={{
                                padding: '0.6rem 1.25rem',
                                borderRadius: '12px',
                                border: '2px solid',
                                borderColor: vocabTestMode ? 'var(--coral)' : '#d1d5db',
                                background: vocabTestMode ? 'var(--coral)' : 'white',
                                color: vocabTestMode ? 'white' : '#666',
                                fontFamily: 'var(--font-playful)',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            🧠 Test Yourself!
                        </button>
                    </div>

                    {vocabTestMode ? (
                        <VocabTest vocabulary={story.vocabulary || []} lang={lang} />
                    ) : (
                        <>
                            <div style={{ background: '#f0f7ff', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #dbeafe' }}>
                                <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666', fontFamily: 'var(--font-playful)' }}>
                                    Click each card to reveal its meaning!
                                </p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {(story.vocabulary || []).map((vocab, i) => (
                                    <VocabularyCard
                                        key={i}
                                        vocab={vocab}
                                        lang={lang}
                                        isFlipped={flippedCards[i] || false}
                                        onFlip={() => setFlippedCards(prev => ({ ...prev, [i]: !prev[i] }))}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function StoryPage() {
    return (
        <main style={{ minHeight: '100vh', scrollBehavior: 'smooth' }}>
            <Suspense fallback={
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fff4e0 0%, #e8f5ff 50%, #f0fff0 100%)' }}>
                    <div style={{ animation: 'bounce 1s ease-in-out infinite', fontSize: '3rem', marginBottom: '1rem' }}>📖</div>
                    <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={32} color="#4361ee" />
                </div>
            }>
                <StoryContent />
            </Suspense>
        </main>
    );
}
