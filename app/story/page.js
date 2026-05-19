'use client';

import { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Sparkles, Volume2, Play, Pause, Languages, Share2, BookMarked, X } from 'lucide-react';

// ─── Speech ───────────────────────────────────────────────────────────────────
const langMap = {
    'Spanish':'es-ES','French':'fr-FR','German':'de-DE','Italian':'it-IT',
    'Japanese':'ja-JP','English':'en-US','Portuguese':'pt-PT','Dutch':'nl-NL',
    'Polish':'pl-PL','Swedish':'sv-SE','Finnish':'fi-FI','Czech':'cs-CZ',
    'Romanian':'ro-RO','Greek':'el-GR','Norwegian':'nb-NO','Danish':'da-DK',
    'Mandarin Chinese':'zh-CN','Korean':'ko-KR','Thai':'th-TH','Vietnamese':'vi-VN',
    'Hindi':'hi-IN','Bengali':'bn-BD','Tamil':'ta-IN','Nepali':'ne-NP',
    'Indonesian':'id-ID','Malay':'ms-MY','Tagalog':'tl-PH','Arabic':'ar-SA',
    'Turkish':'tr-TR','Russian':'ru-RU','Hebrew':'he-IL','Persian':'fa-IR',
    'Urdu':'ur-PK','Ukrainian':'uk-UA','Hungarian':'hu-HU','Croatian':'hr-HR',
    'Catalan':'ca-ES','Swahili':'sw-KE','Amharic':'am-ET',
};

const speak = (text, lang, onEnd) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const resolved = langMap[lang] || langMap[Object.keys(langMap).find(k => k.toLowerCase() === lang?.toLowerCase())] || 'en-US';
    u.lang = resolved; u.rate = 0.9;
    if (onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
};

// ─── Usage tracking (localStorage) ───────────────────────────────────────────
const STORAGE_DATE  = 'fabula_usage_date';
const STORAGE_COUNT = 'fabula_daily_count';
const STORAGE_PREM  = 'fabula_premium';
const FREE_LIMIT    = 3;

const getTodayStr = () => new Date().toISOString().split('T')[0];

function getDailyUsage() {
    if (typeof window === 'undefined') return { count: 0 };
    const date = localStorage.getItem(STORAGE_DATE);
    const count = parseInt(localStorage.getItem(STORAGE_COUNT) || '0');
    if (date !== getTodayStr()) return { count: 0 };
    return { count };
}

function incrementDailyUsage() {
    const today = getTodayStr();
    const { count } = getDailyUsage();
    localStorage.setItem(STORAGE_DATE, today);
    localStorage.setItem(STORAGE_COUNT, String(count + 1));
}

const isPremium = () => typeof window !== 'undefined' && localStorage.getItem(STORAGE_PREM) === 'true';

// ─── Session Word Bank (sessionStorage, no account needed) ────────────────────
const BANK_KEY = 'fabula_session_words';

function getSessionWords() {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(sessionStorage.getItem(BANK_KEY) || '[]'); } catch { return []; }
}

function saveSessionWord(wordData) {
    if (typeof window === 'undefined') return;
    const words = getSessionWords();
    if (!words.find(w => w.word === wordData.word)) {
        sessionStorage.setItem(BANK_KEY, JSON.stringify([...words, wordData]));
    }
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti({ active }) {
    const pieces = useMemo(() => {
        const colors = ['#e63946','#4cc9f0','#06d6a0','#ffd166','#ef476f','#7c3aed'];
        return Array.from({ length: 48 }, (_, i) => ({
            id: i, left: Math.random() * 100, color: colors[i % 6],
            delay: Math.random() * 0.6, size: 6 + Math.random() * 10,
            rotation: Math.random() * 360, isRound: Math.random() > 0.5,
        }));
    }, []);
    if (!active) return null;
    return (
        <div className="confetti-container">
            {pieces.map(p => (
                <div key={p.id} className="confetti-piece" style={{
                    left: p.left + '%', top: '-10px',
                    width: p.size + 'px', height: p.size + 'px',
                    background: p.color,
                    borderRadius: p.isRound ? '50%' : '2px',
                    animationDelay: p.delay + 's',
                    transform: `rotate(${p.rotation}deg)`,
                }} />
            ))}
        </div>
    );
}

// ─── Paywall Modal ────────────────────────────────────────────────────────────
function PaywallModal({ lang, level, topic }) {
    const [showPay, setShowPay] = useState(false);
    const [txnId, setTxnId] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const resetTime = (() => {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const hrs = Math.floor((midnight - now) / 3600000);
        const mins = Math.floor(((midnight - now) % 3600000) / 60000);
        return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    })();

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(160deg,#fdf6e3 0%,#f3e8ff 50%,#e0f2fe 100%)',
            padding: '2rem',
        }}>
            <div style={{
                background: 'white', borderRadius: 28, padding: '2.5rem',
                maxWidth: 460, width: '100%', textAlign: 'center',
                boxShadow: '0 20px 60px rgba(124,58,237,.22)',
                border: '2px solid rgba(124,58,237,.1)',
                animation: 'popIn .4s ease-out',
            }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📚</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', color: '#7c3aed', marginBottom: '.5rem' }}>
                    Daily limit reached!
                </h2>
                <p style={{ color: '#64748b', fontFamily: 'var(--font-playful)', marginBottom: '.4rem', fontSize: '.95rem' }}>
                    You've used all 3 free stories today.
                </p>
                <p style={{ color: '#94a3b8', fontSize: '.82rem', fontFamily: 'var(--font-playful)', marginBottom: '1.75rem' }}>
                    Resets in <strong style={{ color: '#7c3aed' }}>{resetTime}</strong> — or unlock unlimited access now.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1.75rem' }}>
                    <div style={{ background: '#f8fafc', borderRadius: 14, padding: '1rem', border: '2px solid #e2e8f0' }}>
                        <p style={{ fontFamily: 'var(--font-playful)', fontWeight: 700, color: '#64748b', marginBottom: '.35rem', fontSize: '.85rem' }}>Free</p>
                        <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e1b4b', fontFamily: 'var(--font-heading)' }}>3/day</p>
                        <p style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: '.2rem' }}>No account needed</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.08),rgba(14,165,233,.08))', borderRadius: 14, padding: '1rem', border: '2px solid #7c3aed' }}>
                        <p style={{ fontFamily: 'var(--font-playful)', fontWeight: 700, color: '#7c3aed', marginBottom: '.35rem', fontSize: '.85rem' }}>⭐ Premium</p>
                        <p style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e1b4b', fontFamily: 'var(--font-heading)' }}>Unlimited</p>
                        <p style={{ fontSize: '.7rem', color: '#7c3aed', marginTop: '.2rem', fontWeight: 600 }}>Only 299 ৳/month</p>
                    </div>
                </div>

                {!showPay ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                        <button onClick={() => setShowPay(true)} style={{
                            padding: '.875rem 2rem',
                            background: 'linear-gradient(135deg,#7c3aed,#0ea5e9)',
                            color: 'white', border: 'none', borderRadius: 14,
                            fontFamily: 'var(--font-playful)', fontWeight: 700, fontSize: '1rem',
                            cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,.35)',
                        }}>
                            🌟 Unlock Premium — 299 ৳/month
                        </button>
                        <Link href="/" style={{
                            display: 'block', padding: '.7rem',
                            color: '#94a3b8', fontFamily: 'var(--font-playful)',
                            fontSize: '.88rem', textDecoration: 'none',
                        }}>
                            ← Back to home · Try again in {resetTime}
                        </Link>
                    </div>
                ) : submitted ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🎉</div>
                        <p style={{ fontFamily: 'var(--font-playful)', color: '#15803d', fontWeight: 700, marginBottom: '.4rem' }}>
                            Payment submitted!
                        </p>
                        <p style={{ fontSize: '.82rem', color: '#64748b', fontFamily: 'var(--font-playful)' }}>
                            We'll verify within a few hours and activate your account. Come back soon!
                        </p>
                    </div>
                ) : (
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ fontFamily: 'var(--font-playful)', fontWeight: 700, color: '#1e1b4b', marginBottom: '1rem', fontSize: '.92rem' }}>
                            Send 299 ৳ via mobile banking:
                        </p>
                        <div style={{ background: '#fce7f3', borderRadius: 12, padding: '.9rem', marginBottom: '.6rem', border: '1px solid #f9a8d4' }}>
                            <p style={{ fontFamily: 'var(--font-playful)', fontWeight: 700, color: '#db2777', marginBottom: '.25rem', fontSize: '.88rem' }}>📱 bKash — Send Money</p>
                            <p style={{ fontSize: '.82rem', color: '#666', fontFamily: 'var(--font-ui)' }}>Number: <strong>01XXXXXXXXX</strong></p>
                            <p style={{ fontSize: '.72rem', color: '#999', fontFamily: 'var(--font-ui)' }}>Reference: "Fabula Premium"</p>
                        </div>
                        <div style={{ background: '#fff7ed', borderRadius: 12, padding: '.9rem', marginBottom: '1rem', border: '1px solid #fed7aa' }}>
                            <p style={{ fontFamily: 'var(--font-playful)', fontWeight: 700, color: '#ea580c', marginBottom: '.25rem', fontSize: '.88rem' }}>💳 Nagad — Send Money</p>
                            <p style={{ fontSize: '.82rem', color: '#666', fontFamily: 'var(--font-ui)' }}>Number: <strong>01XXXXXXXXX</strong></p>
                        </div>
                        <label style={{ fontFamily: 'var(--font-playful)', fontSize: '.83rem', color: '#555', display: 'block', marginBottom: '.35rem' }}>
                            Your Transaction ID:
                        </label>
                        <input
                            type="text" placeholder="e.g. 8FG4J2K1..."
                            value={txnId} onChange={e => setTxnId(e.target.value)}
                            style={{
                                width: '100%', padding: '.7rem 1rem', borderRadius: 10,
                                border: '2px solid #e2e8f0', fontFamily: 'var(--font-playful)',
                                fontSize: '.92rem', marginBottom: '.7rem', outline: 'none',
                            }}
                            onFocus={e => e.target.style.borderColor = '#7c3aed'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                        <button
                            disabled={!txnId.trim()}
                            onClick={() => setSubmitted(true)}
                            style={{
                                width: '100%', padding: '.75rem',
                                background: txnId.trim() ? '#7c3aed' : '#d1d5db',
                                color: 'white', border: 'none', borderRadius: 10,
                                fontFamily: 'var(--font-playful)', fontWeight: 700,
                                fontSize: '.92rem', cursor: txnId.trim() ? 'pointer' : 'default',
                                marginBottom: '.5rem',
                            }}
                        >
                            Submit Payment
                        </button>
                        <button onClick={() => setShowPay(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '.78rem', cursor: 'pointer', fontFamily: 'var(--font-playful)' }}>
                            ← Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Word Popup ───────────────────────────────────────────────────────────────
const WordPopup = ({ wordData, position, onClose, isLoading, lang }) => {
    if (!wordData && !isLoading) return null;
    const targetLang = wordData?.lang || lang || 'Spanish';
    return (
        <div className="word-popup" style={{
            top: position.y, left: position.x,
            pointerEvents: 'auto',
        }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '.65rem' }}>
                {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#555' }}>
                        <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={15} />
                        <span style={{ fontSize: '.85rem', fontFamily: 'var(--font-playful)' }}>Looking it up...</span>
                    </div>
                ) : (
                    <>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                                <h4 style={{ fontSize: '1.2rem', color: '#7c3aed', fontWeight: 700 }}>{wordData.word}</h4>
                                <button onClick={() => speak(wordData.word, targetLang)} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', padding: '.1rem' }} title="Listen">
                                    <Volume2 size={15} />
                                </button>
                            </div>
                            <span style={{ fontSize: '.7rem', fontFamily: 'var(--font-playful)', background: '#f1f5f9', padding: '.18rem .5rem', borderRadius: 4, color: '#64748b', display: 'inline-block', marginTop: '.2rem' }}>{wordData.part_of_speech}</span>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem', padding: '.15rem' }}>✕</button>
                    </>
                )}
            </div>
            {!isLoading && wordData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid rgba(0,0,0,.05)', paddingBottom: '.4rem' }}>
                        <p style={{ fontSize: '.8rem', fontFamily: 'monospace', color: '#64748b' }}>{wordData.pronunciation}</p>
                        <p style={{ fontStyle: 'italic', color: '#7c3aed', fontSize: '1rem', fontWeight: 600 }}>{wordData.translation}</p>
                    </div>
                    <p style={{ fontSize: '.9rem', color: '#334155', lineHeight: 1.5 }}>{wordData.definition}</p>
                    {wordData.example && (
                        <div style={{ background: '#fafafa', padding: '.65rem', borderRadius: 8, fontSize: '.82rem', color: '#555', borderLeft: '3px solid #c4b5fd' }}>
                            <p style={{ fontStyle: 'italic', marginBottom: '.2rem' }}>"{wordData.example}"</p>
                            {wordData.example_translation && <p style={{ color: '#94a3b8', fontSize: '.75rem' }}>{wordData.example_translation}</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Classic Exercise ─────────────────────────────────────────────────────────
function ClassicExercise({ exercise: ex, index: i, onAnswer }) {
    const [selected, setSelected] = useState(null);
    const [fillValue, setFillValue] = useState('');

    const isCorrect = selected === ex.answer || (ex.type === 'fill_in_blank' && selected && selected.toLowerCase() === ex.answer.toLowerCase());

    const typeConfig = {
        comprehension: { label: '📖 Comprehension', bg: '#eef2ff', color: '#4361ee' },
        fill_in_blank: { label: '✏️ Fill in Blank',  bg: '#fef3c7', color: '#d97706' },
        vocabulary:    { label: '📚 Vocabulary',     bg: '#ecfdf5', color: '#059669' },
    };
    const tc = typeConfig[ex.type] || typeConfig.vocabulary;

    const handleOption = (opt) => {
        if (selected) return;
        setSelected(opt);
        onAnswer(i, opt === ex.answer);
    };

    const handleFill = (val) => {
        if (selected) return;
        const t = val.trim();
        setSelected(t);
        onAnswer(i, t.toLowerCase() === ex.answer.toLowerCase());
    };

    return (
        <div className="exercise-card">
            <div className="exercise-type-badge" style={{ background: tc.bg, color: tc.color }}>{tc.label}</div>
            <p style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem', color: '#1e1b4b', fontFamily: 'var(--font-playful)', lineHeight: 1.4 }}>{ex.question}</p>

            {ex.type !== 'fill_in_blank' && ex.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                    {ex.options.map((opt, j) => {
                        let bg = 'white', borderColor = '#e2e8f0', color = '#1e1b4b', anim = 'none', opacity = 1;
                        if (selected) {
                            if (opt === ex.answer)  { bg = '#dcfce7'; borderColor = '#16a34a'; color = '#166534'; }
                            else if (opt === selected){ bg = '#fee2e2'; borderColor = '#dc2626'; color = '#991b1b'; anim = 'shake .5s ease'; }
                            else opacity = .45;
                        }
                        return (
                            <button key={j} disabled={!!selected}
                                onClick={() => handleOption(opt)}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '.75rem 1rem',
                                    fontSize: '.95rem', borderRadius: 12, border: `2px solid ${borderColor}`,
                                    cursor: selected ? 'default' : 'pointer', background: bg,
                                    fontFamily: 'var(--font-playful)', fontWeight: 500,
                                    color, opacity, animation: anim,
                                    transition: 'all .2s ease',
                                }}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            )}

            {ex.type === 'fill_in_blank' && (
                <div>
                    <input type="text" placeholder="Type your answer..." disabled={!!selected}
                        value={fillValue} onChange={e => { if (!selected) setFillValue(e.target.value); }}
                        onKeyDown={e => { if (e.key === 'Enter' && fillValue.trim() && !selected) handleFill(fillValue); }}
                        style={{
                            width: '100%', padding: '.7rem 1rem', fontSize: '.95rem',
                            borderRadius: 12, border: '2px solid #e2e8f0',
                            fontFamily: 'var(--font-playful)', marginBottom: '.65rem',
                            opacity: selected ? .5 : 1, outline: 'none',
                        }}
                        onFocus={e => e.target.style.borderColor = '#7c3aed'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                    {!selected && (
                        <button onClick={() => handleFill(fillValue)} disabled={!fillValue.trim()} style={{
                            padding: '.65rem 1.5rem', borderRadius: 12, border: 'none',
                            background: fillValue.trim() ? '#7c3aed' : '#d1d5db',
                            color: 'white', fontFamily: 'var(--font-playful)', fontWeight: 700,
                            fontSize: '.92rem', cursor: fillValue.trim() ? 'pointer' : 'default',
                        }}>Submit</button>
                    )}
                </div>
            )}

            {selected && (
                <div style={{
                    marginTop: '.9rem', padding: '.9rem', borderRadius: 12,
                    background: isCorrect ? '#f0fdf4' : '#fef2f2',
                    border: `2px solid ${isCorrect ? '#86efac' : '#fecaca'}`,
                    animation: 'popIn .3s ease-out',
                }}>
                    <p style={{ fontWeight: 700, color: isCorrect ? '#22c55e' : '#ef4444', fontFamily: 'var(--font-playful)', marginBottom: '.25rem' }}>
                        {isCorrect ? '🌟 Brilliant!' : '❌ Not quite'}
                    </p>
                    {ex.explanation && <p style={{ fontSize: '.83rem', color: isCorrect ? '#15803d' : '#991b1b', fontFamily: 'var(--font-playful)' }}>{ex.explanation}</p>}
                    {!isCorrect && <p style={{ fontSize: '.83rem', color: '#991b1b', fontWeight: 700, fontFamily: 'var(--font-playful)', marginTop: '.25rem' }}>Answer: <em>{ex.answer}</em></p>}
                </div>
            )}
        </div>
    );
}

// ─── Word Match Exercise ──────────────────────────────────────────────────────
function WordMatchExercise({ exercise, index, onAnswer }) {
    const [selectedWord, setSelectedWord] = useState(null);
    const [matched, setMatched] = useState({});
    const [shakeW, setShakeW] = useState(null);
    const [shakeT, setShakeT] = useState(null);
    const [done, setDone] = useState(false);

    const shuffledTrans = useMemo(() => {
        if (!exercise.pairs) return [];
        return [...exercise.pairs.map(p => p.translation)].sort(() => Math.random() - .5);
    }, [exercise]);

    const handleWord = (wIdx) => { if (done || matched[wIdx] !== undefined) return; setSelectedWord(wIdx); };
    const handleTrans = (tIdx) => {
        if (done || selectedWord === null) return;
        if (shuffledTrans[tIdx] === exercise.pairs[selectedWord].translation) {
            const nm = { ...matched, [selectedWord]: tIdx };
            setMatched(nm); setSelectedWord(null);
            if (Object.keys(nm).length === exercise.pairs.length) { setDone(true); onAnswer(index, true); }
        } else {
            setShakeW(selectedWord); setShakeT(tIdx);
            setTimeout(() => { setShakeW(null); setShakeT(null); setSelectedWord(null); }, 500);
        }
    };
    const matchedT = new Set(Object.values(matched));

    return (
        <div className="exercise-card">
            <div className="exercise-type-badge" style={{ background: '#fce7f3', color: '#db2777' }}>🔗 Word Match</div>
            <p style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem', fontFamily: 'var(--font-playful)' }}>
                {exercise.instruction || 'Match each word with its translation'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
                    {exercise.pairs.map((pair, wIdx) => (
                        <button key={wIdx} onClick={() => handleWord(wIdx)}
                            disabled={matched[wIdx] !== undefined || done}
                            style={{
                                padding: '.65rem .9rem', borderRadius: 12, border: '2px solid',
                                borderColor: matched[wIdx] !== undefined ? '#16a34a' : selectedWord === wIdx ? '#7c3aed' : '#e2e8f0',
                                background: matched[wIdx] !== undefined ? '#dcfce7' : selectedWord === wIdx ? 'rgba(124,58,237,.06)' : 'white',
                                fontFamily: 'var(--font-playful)', fontWeight: 700, fontSize: '.92rem',
                                cursor: matched[wIdx] !== undefined || done ? 'default' : 'pointer',
                                transition: 'all .2s', animation: shakeW === wIdx ? 'shake .5s ease' : 'none',
                                opacity: matched[wIdx] !== undefined ? .7 : 1,
                            }}>
                            {pair.word}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
                    {shuffledTrans.map((trans, tIdx) => (
                        <button key={tIdx} onClick={() => handleTrans(tIdx)}
                            disabled={matchedT.has(tIdx) || done}
                            style={{
                                padding: '.65rem .9rem', borderRadius: 12, border: '2px solid',
                                borderColor: matchedT.has(tIdx) ? '#16a34a' : '#e2e8f0',
                                background: matchedT.has(tIdx) ? '#dcfce7' : 'white',
                                fontFamily: 'var(--font-playful)', fontWeight: 500, fontSize: '.88rem',
                                cursor: matchedT.has(tIdx) || done ? 'default' : 'pointer',
                                transition: 'all .2s', animation: shakeT === tIdx ? 'shake .5s ease' : 'none',
                                opacity: matchedT.has(tIdx) ? .7 : 1,
                            }}>
                            {trans}
                        </button>
                    ))}
                </div>
            </div>
            {done && (
                <div style={{ marginTop: '.75rem', padding: '.9rem', borderRadius: 12, background: '#f0fdf4', border: '2px solid #86efac', textAlign: 'center', fontFamily: 'var(--font-playful)', fontWeight: 700, color: '#22c55e', animation: 'popIn .3s ease-out' }}>
                    🎉 All matched! Perfect!
                </div>
            )}
        </div>
    );
}

// ─── Word Scramble Exercise ───────────────────────────────────────────────────
function WordScrambleExercise({ exercise, index, onAnswer }) {
    const [sel, setSel] = useState([]);
    const [result, setResult] = useState(null);
    const letters = exercise.scrambled ? exercise.scrambled.split('') : [];
    const current = sel.map(i => letters[i]).join('');

    const handleLetter = (idx) => {
        if (sel.includes(idx) || result) return;
        const next = [...sel, idx];
        setSel(next);
        if (next.length === letters.length) {
            const attempt = next.map(i => letters[i]).join('');
            const ok = attempt.toLowerCase() === exercise.answer.toLowerCase();
            setResult(ok ? 'correct' : 'wrong');
            onAnswer(index, ok);
        }
    };

    return (
        <div className="exercise-card">
            <div className="exercise-type-badge" style={{ background: '#fef3c7', color: '#d97706' }}>🔤 Word Scramble</div>
            <p style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '.4rem', fontFamily: 'var(--font-playful)' }}>{exercise.instruction || 'Unscramble the letters'}</p>
            {exercise.hint && <p style={{ fontSize: '.85rem', color: '#64748b', marginBottom: '.9rem', fontFamily: 'var(--font-playful)', fontStyle: 'italic' }}>Hint: {exercise.hint}</p>}
            <div style={{ minHeight: 52, background: '#f8fafc', borderRadius: 12, border: '2px dashed #d1d5db', padding: '.6rem', marginBottom: '.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.2rem', flexWrap: 'wrap' }}>
                {current ? current.split('').map((lt, i) => (
                    <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 40, height: 40, background: result === 'correct' ? '#dcfce7' : result === 'wrong' ? '#fee2e2' : '#ffd166',
                        borderRadius: 8, fontFamily: 'var(--font-playful)', fontWeight: 700, fontSize: '1.05rem',
                        border: `2px solid ${result === 'correct' ? '#16a34a' : result === 'wrong' ? '#dc2626' : '#e9c46a'}`,
                        animation: result === 'wrong' ? 'shake .5s ease' : 'none',
                    }}>{lt}</span>
                )) : <span style={{ color: '#94a3b8', fontFamily: 'var(--font-playful)', fontSize: '.88rem' }}>Click letters below...</span>}
            </div>
            <div style={{ display: 'flex', gap: '.45rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '.75rem' }}>
                {letters.map((lt, idx) => (
                    <button key={idx} onClick={() => handleLetter(idx)}
                        className={`letter-tile ${sel.includes(idx) ? 'used' : ''}`}
                        style={{ animation: `tileAppear .3s ease-out ${idx * .05}s both` }}>
                        {lt.toUpperCase()}
                    </button>
                ))}
            </div>
            {!result && sel.length > 0 && (
                <div style={{ display: 'flex', gap: '.4rem', justifyContent: 'center' }}>
                    {[['Undo', () => setSel(p => p.slice(0, -1))], ['Clear', () => setSel([])]].map(([label, fn]) => (
                        <button key={label} onClick={fn} style={{ padding: '.4rem .9rem', borderRadius: 10, border: '2px solid #e2e8f0', background: 'white', fontFamily: 'var(--font-playful)', fontSize: '.82rem', cursor: 'pointer' }}>{label}</button>
                    ))}
                </div>
            )}
            {result && (
                <div style={{ marginTop: '.5rem', padding: '.9rem', borderRadius: 12, background: result === 'correct' ? '#f0fdf4' : '#fef2f2', border: `2px solid ${result === 'correct' ? '#86efac' : '#fecaca'}`, textAlign: 'center', fontFamily: 'var(--font-playful)', animation: 'popIn .3s ease-out' }}>
                    <p style={{ fontWeight: 700, color: result === 'correct' ? '#22c55e' : '#ef4444' }}>{result === 'correct' ? '🎉 Perfect!' : '❌ Not quite!'}</p>
                    {result === 'wrong' && <p style={{ fontSize: '.82rem', color: '#991b1b', marginTop: '.2rem' }}>The word was: <strong>{exercise.answer}</strong></p>}
                </div>
            )}
        </div>
    );
}

// ─── Sentence Order Exercise ──────────────────────────────────────────────────
function SentenceOrderExercise({ exercise, index, onAnswer }) {
    const [ordered, setOrdered] = useState([]);
    const [result, setResult] = useState(null);

    const shuffled = useMemo(() => {
        if (!exercise.words) return [];
        const idxs = exercise.words.map((_, i) => i);
        for (let i = idxs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idxs[i], idxs[j]] = [idxs[j], idxs[i]]; }
        return idxs.map(i => ({ word: exercise.words[i], orig: i }));
    }, [exercise]);

    const handleWord = (sIdx) => {
        if (ordered.includes(sIdx) || result) return;
        const next = [...ordered, sIdx];
        setOrdered(next);
        if (next.length === shuffled.length) {
            const attempt = next.map(i => shuffled[i].word).join(' ');
            const ok = attempt.toLowerCase() === exercise.answer.toLowerCase();
            setResult(ok ? 'correct' : 'wrong');
            onAnswer(index, ok);
        }
    };

    return (
        <div className="exercise-card">
            <div className="exercise-type-badge" style={{ background: '#ede9fe', color: '#7c3aed' }}>📝 Sentence Order</div>
            <p style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '.4rem', fontFamily: 'var(--font-playful)' }}>{exercise.instruction || 'Put the words in correct order'}</p>
            {exercise.translation && <p style={{ fontSize: '.85rem', color: '#64748b', marginBottom: '.9rem', fontFamily: 'var(--font-playful)', fontStyle: 'italic' }}>Meaning: {exercise.translation}</p>}
            <div style={{ minHeight: 52, background: '#f8fafc', borderRadius: 12, border: '2px dashed #d1d5db', padding: '.6rem .75rem', marginBottom: '.9rem', display: 'flex', alignItems: 'center', gap: '.4rem', flexWrap: 'wrap' }}>
                {ordered.length > 0 ? ordered.map((idx, i) => (
                    <span key={i} style={{
                        padding: '.38rem .75rem', borderRadius: 10, fontFamily: 'var(--font-playful)', fontWeight: 600, fontSize: '.9rem',
                        background: result === 'correct' ? '#dcfce7' : result === 'wrong' ? '#fee2e2' : '#7c3aed',
                        color: result ? (result === 'correct' ? '#166534' : '#991b1b') : 'white',
                        animation: result === 'wrong' ? 'shake .5s ease' : `popIn .2s ease-out ${i * .04}s both`,
                    }}>{shuffled[idx].word}</span>
                )) : <span style={{ color: '#94a3b8', fontFamily: 'var(--font-playful)', fontSize: '.88rem' }}>Click words below...</span>}
            </div>
            <div style={{ display: 'flex', gap: '.45rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '.75rem' }}>
                {shuffled.map((item, sIdx) => (
                    <button key={sIdx} onClick={() => handleWord(sIdx)} disabled={ordered.includes(sIdx) || !!result}
                        style={{
                            padding: '.42rem .9rem', borderRadius: 12, border: '2px solid',
                            borderColor: ordered.includes(sIdx) ? '#e2e8f0' : '#7c3aed',
                            background: ordered.includes(sIdx) ? '#f3f4f6' : 'white',
                            color: ordered.includes(sIdx) ? '#aaa' : '#7c3aed',
                            fontFamily: 'var(--font-playful)', fontWeight: 700, fontSize: '.9rem',
                            cursor: ordered.includes(sIdx) || result ? 'default' : 'pointer',
                            transition: 'all .2s', opacity: ordered.includes(sIdx) ? .38 : 1,
                        }}>
                        {item.word}
                    </button>
                ))}
            </div>
            {!result && ordered.length > 0 && (
                <div style={{ display: 'flex', gap: '.4rem', justifyContent: 'center' }}>
                    {[['Undo', () => setOrdered(p => p.slice(0,-1))], ['Clear', () => setOrdered([])]].map(([label, fn]) => (
                        <button key={label} onClick={fn} style={{ padding: '.4rem .9rem', borderRadius: 10, border: '2px solid #e2e8f0', background: 'white', fontFamily: 'var(--font-playful)', fontSize: '.82rem', cursor: 'pointer' }}>{label}</button>
                    ))}
                </div>
            )}
            {result && (
                <div style={{ marginTop: '.5rem', padding: '.9rem', borderRadius: 12, background: result === 'correct' ? '#f0fdf4' : '#fef2f2', border: `2px solid ${result === 'correct' ? '#86efac' : '#fecaca'}`, textAlign: 'center', fontFamily: 'var(--font-playful)', animation: 'popIn .3s ease-out' }}>
                    <p style={{ fontWeight: 700, color: result === 'correct' ? '#22c55e' : '#ef4444' }}>{result === 'correct' ? '🎉 Perfect sentence!' : '❌ Almost!'}</p>
                    {result === 'wrong' && <p style={{ fontSize: '.82rem', color: '#991b1b', marginTop: '.2rem' }}>Correct: <strong>{exercise.answer}</strong></p>}
                </div>
            )}
        </div>
    );
}

// ─── Quiz Dispatcher ──────────────────────────────────────────────────────────
function Quiz({ exercises, onAnswer }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {exercises.map((ex, i) => {
                switch (ex.type) {
                    case 'word_match':     return <WordMatchExercise     key={i} exercise={ex} index={i} onAnswer={onAnswer} />;
                    case 'word_scramble':  return <WordScrambleExercise  key={i} exercise={ex} index={i} onAnswer={onAnswer} />;
                    case 'sentence_order': return <SentenceOrderExercise key={i} exercise={ex} index={i} onAnswer={onAnswer} />;
                    default:               return <ClassicExercise        key={i} exercise={ex} index={i} onAnswer={onAnswer} />;
                }
            })}
        </div>
    );
}

// ─── Vocabulary Flashcard ─────────────────────────────────────────────────────
function VocabCard({ vocab, lang, flipped, onFlip }) {
    return (
        <div onClick={onFlip} style={{ perspective: 1000, cursor: 'pointer', minHeight: 240 }}>
            <div style={{
                position: 'relative', width: '100%', minHeight: 240,
                transition: 'transform .6s cubic-bezier(.23,1,.32,1)',
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
            }}>
                {/* Front */}
                <div style={{
                    position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                    background: 'white', borderRadius: 18, padding: '1.5rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,.06)',
                    border: '1.5px solid rgba(124,58,237,.1)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                        <h4 style={{ fontSize: '1.7rem', color: '#7c3aed', fontWeight: 700, wordBreak: 'break-word' }}>{vocab.word}</h4>
                        <button onClick={e => { e.stopPropagation(); speak(vocab.word, lang); }} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer' }}>
                            <Volume2 size={20} />
                        </button>
                    </div>
                    <p style={{ fontFamily: 'monospace', fontSize: '.78rem', color: '#94a3b8', marginBottom: '.65rem' }}>{vocab.pronunciation}</p>
                    <span style={{ fontSize: '.72rem', fontFamily: 'var(--font-playful)', background: '#f1f5f9', padding: '.2rem .6rem', borderRadius: 4, color: '#64748b', fontWeight: 700 }}>{vocab.part_of_speech}</span>
                    <p style={{ marginTop: '1.25rem', fontSize: '.82rem', color: '#94a3b8', fontFamily: 'var(--font-playful)' }}>Tap to reveal meaning</p>
                </div>
                {/* Back */}
                <div style={{
                    position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg,#f8f4ff,#f0f9ff)',
                    borderRadius: 18, padding: '1.5rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,.06)',
                    border: '1.5px solid rgba(124,58,237,.15)',
                }}>
                    <p style={{ fontSize: '1.35rem', fontStyle: 'italic', color: '#334155', fontWeight: 600, marginBottom: '.75rem' }}>{vocab.translation}</p>
                    <p style={{ fontSize: '.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>{vocab.definition}</p>
                    {vocab.example && (
                        <div style={{ background: 'rgba(255,255,255,.7)', padding: '.75rem', borderRadius: 10, borderLeft: '3px solid #c4b5fd', textAlign: 'left', width: '100%' }}>
                            <p style={{ fontSize: '.8rem', fontStyle: 'italic', color: '#475569', marginBottom: '.2rem' }}>"{vocab.example}"</p>
                            {vocab.example_translation && <p style={{ fontSize: '.72rem', color: '#94a3b8' }}>— {vocab.example_translation}</p>}
                        </div>
                    )}
                    <p style={{ marginTop: '.75rem', fontSize: '.8rem', color: '#94a3b8', fontFamily: 'var(--font-playful)' }}>Tap to flip back</p>
                </div>
            </div>
        </div>
    );
}

// ─── Vocab Test Mode ──────────────────────────────────────────────────────────
function VocabTest({ vocabulary, lang }) {
    const [idx, setIdx] = useState(0);
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [correct, setCorrect] = useState(0);
    const [done, setDone] = useState(false);

    const cur = vocabulary[idx];
    const check = () => {
        if (!input.trim() || result) return;
        const ok = input.trim().toLowerCase() === cur.translation.toLowerCase();
        setResult(ok ? 'correct' : 'wrong');
        if (ok) setCorrect(c => c + 1);
    };
    const next = () => {
        if (idx + 1 >= vocabulary.length) { setDone(true); return; }
        setIdx(i => i + 1); setInput(''); setResult(null);
    };

    if (done) {
        const pct = Math.round((correct / vocabulary.length) * 100);
        return (
            <div style={{ textAlign: 'center', padding: '2.5rem', background: 'white', borderRadius: 18, boxShadow: '0 4px 20px rgba(0,0,0,.06)', animation: 'popIn .4s ease-out' }}>
                <p style={{ fontSize: '3rem', marginBottom: '.75rem' }}>{pct >= 80 ? '🌟' : pct >= 50 ? '🎉' : '💪'}</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#1e1b4b', marginBottom: '.4rem' }}>
                    {pct >= 80 ? 'Incredible!' : pct >= 50 ? 'Great effort!' : 'Keep practicing!'}
                </h3>
                <p style={{ fontFamily: 'var(--font-playful)', fontSize: '1.1rem', color: '#64748b', marginBottom: '1.25rem' }}>
                    {correct} / {vocabulary.length} correct ({pct}%)
                </p>
                <button onClick={() => { setIdx(0); setInput(''); setResult(null); setCorrect(0); setDone(false); }} style={{
                    padding: '.7rem 1.75rem', background: '#7c3aed', color: 'white', border: 'none',
                    borderRadius: 12, fontFamily: 'var(--font-playful)', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer',
                }}>Try Again</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', background: 'white', borderRadius: 18, boxShadow: '0 4px 20px rgba(0,0,0,.06)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '.2rem', marginBottom: '1.5rem' }}>
                {vocabulary.map((_, i) => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < idx ? '#06d6a0' : i === idx ? '#7c3aed' : '#e2e8f0', transition: 'all .3s' }} />
                ))}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#7c3aed', marginBottom: '.35rem' }}>{cur.word}</h3>
            <p style={{ fontFamily: 'monospace', fontSize: '.78rem', color: '#94a3b8', marginBottom: '.2rem' }}>{cur.pronunciation}</p>
            <button onClick={() => speak(cur.word, lang)} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', marginBottom: '1.25rem' }}>
                <Volume2 size={20} />
            </button>
            <div style={{ maxWidth: 340, margin: '0 auto' }}>
                <input type="text" placeholder="Type the English translation..."
                    value={input} onChange={e => { if (!result) setInput(e.target.value); }}
                    onKeyDown={e => { if (e.key === 'Enter') { result ? next() : check(); } }}
                    disabled={!!result}
                    style={{
                        width: '100%', padding: '.7rem 1rem', fontSize: '1rem', borderRadius: 12,
                        border: `2px solid ${result === 'correct' ? '#16a34a' : result === 'wrong' ? '#dc2626' : '#e2e8f0'}`,
                        fontFamily: 'var(--font-playful)', textAlign: 'center', marginBottom: '.9rem',
                        background: result === 'correct' ? '#f0fdf4' : result === 'wrong' ? '#fef2f2' : 'white',
                        outline: 'none',
                    }}
                />
                {!result ? (
                    <button onClick={check} disabled={!input.trim()} style={{
                        padding: '.7rem 2rem', background: input.trim() ? '#7c3aed' : '#d1d5db',
                        color: 'white', border: 'none', borderRadius: 12,
                        fontFamily: 'var(--font-playful)', fontWeight: 700, fontSize: '.95rem',
                        cursor: input.trim() ? 'pointer' : 'default', width: '100%',
                    }}>Check</button>
                ) : (
                    <div>
                        {result === 'wrong' && <p style={{ fontFamily: 'var(--font-playful)', color: '#991b1b', marginBottom: '.6rem' }}>Answer: <strong>{cur.translation}</strong></p>}
                        <button onClick={next} style={{
                            padding: '.7rem 2rem', background: result === 'correct' ? '#06d6a0' : '#7c3aed',
                            color: 'white', border: 'none', borderRadius: 12,
                            fontFamily: 'var(--font-playful)', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer', width: '100%',
                        }}>
                            {idx + 1 >= vocabulary.length ? 'See Results' : 'Next Word →'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Interactive Text ─────────────────────────────────────────────────────────
function InteractiveText({ content, vocabulary }) {
    const vocabMap = new Map(vocabulary.map(v => [v.word.toLowerCase(), v]));
    const parts = content.split(/(\s+|[.,;!?。、！？:«»""''—\-]+)/);
    return (
        <p style={{ margin: 0 }}>
            {parts.map((part, i) => {
                const clean = part.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
                const match = vocabMap.get(clean);
                if (match) return (
                    <span key={i} style={{
                        color: '#7c3aed', fontWeight: 600,
                        borderBottom: '2px dotted rgba(124,58,237,.4)',
                        cursor: 'help', transition: 'all .15s',
                    }} title="Double-click to define">{part}</span>
                );
                return <span key={i}>{part}</span>;
            })}
        </p>
    );
}

// ─── Session Word Bank ────────────────────────────────────────────────────────
function SessionWordBank({ words }) {
    const [open, setOpen] = useState(false);
    if (!words.length) return null;
    return (
        <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(124,58,237,.05)', borderRadius: 16, border: '1.5px solid rgba(124,58,237,.12)' }}>
            <button onClick={() => setOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-playful)', fontWeight: 700, fontSize: '.95rem', color: '#7c3aed',
            }}>
                <span>📖 Your Session Word Bank ({words.length} words discovered)</span>
                <span style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .25s', fontSize: '.8rem' }}>›</span>
            </button>
            {open && (
                <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '.5rem', animation: 'fadeInUp .3s ease-out' }}>
                    {words.map((w, i) => (
                        <span key={i} className="word-bank-pill" title={`${w.translation} — ${w.definition}`}>
                            {w.word} <span style={{ opacity: .6 }}>= {w.translation}</span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Story Content ────────────────────────────────────────────────────────────
function StoryContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const lang  = searchParams.get('lang')  || 'Spanish';
    const level = searchParams.get('level') || 'Beginner';
    const topic = searchParams.get('topic') || 'Fairy Tale';

    const [story, setStory]               = useState(null);
    const [loading, setLoading]           = useState(false);
    const [blocked, setBlocked]           = useState(false);
    const [showTrans, setShowTrans]       = useState(false);
    const [audioStatus, setAudioStatus]   = useState('stopped');
    const [flipped, setFlipped]           = useState({});
    const [testMode, setTestMode]         = useState(false);
    const [score, setScore]               = useState(0);
    const [streak, setStreak]             = useState(0);
    const [maxStreak, setMaxStreak]       = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [exResults, setExResults]       = useState({});
    const [popup, setPopup]               = useState({ open: false, pos: { x:0, y:0 }, loading: false, data: null });
    const [sessionWords, setSessionWords] = useState([]);
    const [copied, setCopied]             = useState(false);

    // Check usage limit before fetching
    useEffect(() => {
        const { count } = getDailyUsage();
        const prem = isPremium();
        if (!prem && count >= FREE_LIMIT) { setBlocked(true); return; }
        setLoading(true);
        fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: lang, level, topic }),
        })
        .then(r => r.json())
        .then(data => { setStory(data); incrementDailyUsage(); })
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }, [lang, level, topic]);

    // Load session words
    useEffect(() => { setSessionWords(getSessionWords()); }, []);

    // Cleanup speech on unmount
    useEffect(() => () => { if (typeof window !== 'undefined') window.speechSynthesis.cancel(); }, []);

    // Close popup on outside click
    useEffect(() => {
        const h = e => { if (popup.open && !e.target.closest('[data-story-text]')) setPopup(p => ({ ...p, open: false })); };
        window.addEventListener('click', h);
        return () => window.removeEventListener('click', h);
    }, [popup.open]);

    const triggerConfetti = () => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2200); };

    const recordAnswer = (exerciseIdx, isCorrect) => {
        if (exResults[exerciseIdx] !== undefined) return;
        const bonus = isCorrect ? streak * 5 : 0;
        const pts = isCorrect ? 10 + bonus : 0;
        const newStreak = isCorrect ? streak + 1 : 0;
        setExResults(p => ({ ...p, [exerciseIdx]: { correct: isCorrect, points: pts } }));
        setScore(p => p + pts);
        setStreak(newStreak);
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        if (isCorrect) triggerConfetti();
    };

    const toggleAudio = () => {
        if (typeof window === 'undefined' || !story) return;
        if (audioStatus === 'playing') { window.speechSynthesis.pause(); setAudioStatus('paused'); }
        else if (audioStatus === 'paused') { window.speechSynthesis.resume(); setAudioStatus('playing'); }
        else { speak(story.content, lang, () => setAudioStatus('stopped')); setAudioStatus('playing'); }
    };

    const handleWordDoubleClick = async (e) => {
        e.stopPropagation(); e.preventDefault();
        const selection = window.getSelection();
        const word = selection.toString().trim();
        if (!word) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        let x = rect.left + rect.width / 2 - 145 + window.scrollX;
        let y = rect.bottom + window.scrollY + 10;
        if (x < 10) x = 10;
        if (x + 310 > window.innerWidth) x = window.innerWidth - 315;
        if (y + 270 > window.innerHeight + window.scrollY) y = rect.top + window.scrollY - 260;

        setPopup({ open: true, pos: { x, y }, loading: true, data: { word } });

        const clean = word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
        const known = story?.vocabulary?.find(v => v.word.toLowerCase() === clean);

        if (known) {
            setPopup(p => ({ ...p, loading: false, data: known }));
            saveSessionWord(known);
            setSessionWords(getSessionWords());
            return;
        }

        try {
            const res = await fetch('/api/define', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word, context: story?.content, language: lang }),
            });
            const data = await res.json();
            setPopup(p => p.open ? { ...p, loading: false, data } : p);
            saveSessionWord(data);
            setSessionWords(getSessionWords());
        } catch {
            setPopup(p => ({ ...p, open: false }));
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try { await navigator.share({ title: `Fabula: ${story?.title || 'Story'}`, text: `Read this ${lang} story and learn new words!`, url }); } catch {}
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true); setTimeout(() => setCopied(false), 2000);
        }
    };

    // ── Blocked by usage limit ──
    if (blocked) return <PaywallModal lang={lang} level={level} topic={topic} />;

    // ── Loading ──
    if (loading) return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            padding: '3rem', background: 'linear-gradient(160deg,#fdf6e3 0%,#f3e8ff 50%,#e0f2fe 100%)',
        }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '1.25rem', animation: 'bounce 1.2s ease-in-out infinite' }}>📖</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,4vw,2.2rem)', color: '#7c3aed', marginBottom: '.6rem' }}>
                Weaving your story...
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', fontFamily: 'var(--font-playful)', marginBottom: '1.5rem' }}>
                ✨ {level} {lang} story about {topic.toLowerCase()}
            </p>
            <div style={{ display: 'flex', gap: '.4rem', marginBottom: '1.75rem' }}>
                {['Generating story', 'Creating illustration', 'Building exercises'].map((s, i) => (
                    <span key={i} style={{
                        padding: '.28rem .7rem', background: 'rgba(124,58,237,.08)',
                        borderRadius: 50, fontSize: '.72rem', fontFamily: 'var(--font-playful)',
                        fontWeight: 600, color: '#7c3aed', animation: `pulse 1.5s ease-in-out infinite ${i * .4}s`,
                    }}>{s}</span>
                ))}
            </div>
            <Loader2 style={{ animation: 'spin 1s linear infinite', color: '#7c3aed' }} size={30} />
        </div>
    );

    // ── Error ──
    if (!story) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffdf7' }}>
            <div style={{ textAlign: 'center', padding: '2.5rem', background: 'white', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,.08)', maxWidth: 380 }}>
                <p style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>😕</p>
                <p style={{ color: '#e11d48', fontSize: '1.1rem', marginBottom: '.75rem', fontFamily: 'var(--font-playful)', fontWeight: 700 }}>Something went wrong</p>
                <p style={{ color: '#64748b', fontSize: '.88rem', marginBottom: '1.25rem', fontFamily: 'var(--font-playful)' }}>Check that your OPENAI_API_KEY is set.</p>
                <Link href="/" style={{ color: '#7c3aed', fontFamily: 'var(--font-playful)', fontWeight: 600, fontSize: '.95rem' }}>← Try again</Link>
            </div>
        </div>
    );

    const answeredCount  = Object.keys(exResults).length;
    const totalExercises = story.exercises?.length || 0;
    const correctCount   = Object.values(exResults).filter(r => r.correct).length;
    const scorePct       = totalExercises > 0 ? Math.round((correctCount / totalExercises) * 100) : 0;

    return (
        <div style={{
            position: 'relative', minHeight: '100vh',
            background: 'linear-gradient(160deg,#fdf6e3 0%,#f3e8ff 45%,#e0f2fe 80%,#fdf6e3 100%)',
            padding: '2.5rem 1.25rem 8rem',
        }}>
            <Confetti active={showConfetti} />

            {popup.open && (
                <WordPopup {...popup} wordData={popup.data} lang={lang}
                    onClose={() => setPopup(p => ({ ...p, open: false }))} />
            )}

            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* Back nav */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '.75rem' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', color: '#64748b', textDecoration: 'none', fontFamily: 'var(--font-playful)', fontSize: '.88rem', transition: 'color .2s' }}
                        onMouseOver={e => e.currentTarget.style.color = '#7c3aed'}
                        onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
                        <ArrowLeft size={15} /> Back to Stories
                    </Link>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                        {/* Meta pills */}
                        {[
                            { label: lang, bg: '#f3e8ff', color: '#7c3aed' },
                            { label: level, bg: '#ecfdf5', color: '#15803d' },
                            { label: topic, bg: '#eff6ff', color: '#2563eb' },
                        ].map(p => (
                            <span key={p.label} style={{ padding: '.25rem .65rem', background: p.bg, borderRadius: 50, fontSize: '.72rem', fontFamily: 'var(--font-playful)', fontWeight: 700, color: p.color }}>{p.label}</span>
                        ))}
                    </div>
                </div>

                {/* ── Story Card ── */}
                <div style={{
                    background: '#fffef7',
                    borderRadius: 20,
                    padding: 'clamp(1.75rem,6vw,3.5rem)',
                    boxShadow: '0 4px 6px rgba(0,0,0,.04), 0 20px 60px rgba(124,58,237,.1)',
                    border: '1.5px solid rgba(245,158,11,.15)',
                    borderTop: '4px solid #f59e0b',
                    marginBottom: '3rem',
                }}>
                    {/* Image */}
                    {story.imageUrl && (
                        <div className="story-image-frame" style={{ marginBottom: '1.75rem', position: 'relative' }}>
                            <img src={story.imageUrl} alt="Story illustration" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            <button onClick={toggleAudio} style={{
                                position: 'absolute', bottom: '1rem', right: '1rem',
                                background: 'rgba(124,58,237,.9)', color: 'white', border: 'none',
                                borderRadius: '50%', width: 50, height: 50,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,.2)',
                                transition: 'transform .2s', zIndex: 5,
                            }} title={audioStatus === 'playing' ? 'Pause' : 'Play story'}
                               onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                               onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                {audioStatus === 'playing' ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
                            </button>
                        </div>
                    )}

                    {/* Title */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{
                            fontSize: 'clamp(1.8rem,6vw,3rem)', color: '#1e1b4b',
                            fontFamily: 'var(--font-display)', lineHeight: 1.15,
                            marginBottom: '.4rem', cursor: 'help',
                        }} title="Double-click for translation"
                           onDoubleClick={e => {
                               e.stopPropagation();
                               const rect = e.currentTarget.getBoundingClientRect();
                               setPopup({ open: true, pos: { x: rect.left + rect.width / 2 - 145 + window.scrollX, y: rect.bottom + window.scrollY + 10 }, loading: false, data: { word: story.title, translation: story.title_translation, definition: 'The title of this story.', part_of_speech: 'title', pronunciation: '', lang } });
                           }}>{story.title}</h1>
                        {story.title_translation && (
                            <p style={{ fontFamily: 'var(--font-playful)', color: '#f59e0b', fontSize: '1rem', fontStyle: 'italic', fontWeight: 600 }}>{story.title_translation}</p>
                        )}
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.5rem' }}>
                        <p style={{ fontSize: '.78rem', color: '#94a3b8', fontFamily: 'var(--font-playful)', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                            <span>💡</span> Double-click any word for instant definition
                        </p>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <button onClick={() => setShowTrans(t => !t)} style={{
                                display: 'flex', alignItems: 'center', gap: '.4rem',
                                padding: '.42rem .9rem',
                                background: showTrans ? '#7c3aed' : 'transparent',
                                color: showTrans ? 'white' : '#7c3aed',
                                border: '2px solid #7c3aed', borderRadius: 50,
                                fontSize: '.8rem', fontFamily: 'var(--font-playful)', fontWeight: 600,
                                cursor: 'pointer', transition: 'all .2s',
                            }}>
                                <Languages size={14} />
                                {showTrans ? 'Hide' : 'Translate'}
                            </button>
                            <button onClick={handleShare} style={{
                                display: 'flex', alignItems: 'center', gap: '.4rem',
                                padding: '.42rem .9rem',
                                background: copied ? '#06d6a0' : 'transparent',
                                color: copied ? 'white' : '#64748b',
                                border: `2px solid ${copied ? '#06d6a0' : '#e2e8f0'}`, borderRadius: 50,
                                fontSize: '.8rem', fontFamily: 'var(--font-playful)', fontWeight: 600,
                                cursor: 'pointer', transition: 'all .2s',
                            }}>
                                <Share2 size={14} /> {copied ? 'Copied!' : 'Share'}
                            </button>
                        </div>
                    </div>

                    {/* Story text */}
                    <div style={{
                        fontFamily: 'Georgia, var(--font-body)', fontSize: 'clamp(1.1rem,2.5vw,1.3rem)',
                        lineHeight: 2, color: '#2d3748', cursor: 'text', userSelect: 'text',
                    }} onDoubleClick={handleWordDoubleClick} data-story-text="true">
                        <InteractiveText content={story.content} vocabulary={story.vocabulary || []} />
                    </div>

                    {/* Translation */}
                    {showTrans && story.content_translation && (
                        <div style={{ marginTop: '1.75rem', padding: '1.5rem', background: '#f0f7ff', borderRadius: 14, borderLeft: '4px solid #7c3aed', fontFamily: 'Georgia, serif', fontSize: '1.05rem', color: '#475569', lineHeight: 1.75, fontStyle: 'italic', animation: 'fadeInUp .3s ease-out' }}>
                            {story.content_translation}
                        </div>
                    )}

                    {/* Session Word Bank */}
                    <SessionWordBank words={sessionWords} />

                    {/* ── Exercises ── */}
                    {story.exercises?.length > 0 && (
                        <div style={{ marginTop: '3.5rem', borderTop: '2px solid rgba(124,58,237,.08)', paddingTop: '2.75rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,4vw,2rem)', color: '#1e1b4b', marginBottom: '.4rem' }}>
                                    🎮 Practice Time!
                                </h3>
                                <p style={{ fontFamily: 'var(--font-playful)', color: '#64748b', fontSize: '.9rem' }}>
                                    Answer correctly to earn points · {totalExercises} exercises
                                </p>
                            </div>

                            {/* Score bar */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                marginBottom: '1.25rem', padding: '1rem 1.4rem',
                                background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
                                borderRadius: 16, border: '2px solid rgba(245,158,11,.2)',
                                flexWrap: 'wrap', gap: '.5rem',
                            }}>
                                <div className="score-badge">⭐ {score} pts</div>
                                {streak >= 2 && <div className="streak-badge" style={{ animation: 'fireFlicker 1s ease-in-out infinite' }}>🔥 {streak} streak!</div>}
                                <div style={{ fontFamily: 'var(--font-playful)', color: '#64748b', fontSize: '.88rem' }}>
                                    {answeredCount} / {totalExercises} answered
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="progress-track" style={{ marginBottom: '2rem' }}>
                                <div className="progress-fill" style={{ width: `${totalExercises > 0 ? (answeredCount / totalExercises) * 100 : 0}%` }} />
                            </div>

                            <Quiz exercises={story.exercises} onAnswer={recordAnswer} />

                            {/* Completion */}
                            {answeredCount === totalExercises && totalExercises > 0 && (
                                <div style={{
                                    marginTop: '2rem', padding: '2rem', textAlign: 'center',
                                    background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)',
                                    borderRadius: 18, border: '2px solid #86efac',
                                    animation: 'popIn .4s ease-out',
                                }}>
                                    <p style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>
                                        {scorePct >= 80 ? '🌟' : scorePct >= 60 ? '🎉' : scorePct >= 40 ? '👍' : '💪'}
                                    </p>
                                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#1e1b4b', marginBottom: '.4rem' }}>
                                        {scorePct >= 80 ? 'Outstanding! You\'re a star!' : scorePct >= 60 ? 'Excellent work!' : scorePct >= 40 ? 'Good effort!' : 'Keep practicing!'}
                                    </h4>
                                    <p style={{ fontFamily: 'var(--font-playful)', color: '#64748b' }}>
                                        Score: <strong>{score} pts</strong> · {correctCount}/{totalExercises} correct ({scorePct}%)
                                        {maxStreak >= 3 && <span> · 🔥 Best streak: {maxStreak}</span>}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Vocabulary Section ── */}
                {(story.vocabulary || []).length > 0 && (
                    <div style={{ marginBottom: '5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
                            <div style={{ flex: 1, height: 2, background: 'linear-gradient(to right,transparent,rgba(124,58,237,.3),transparent)' }} />
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: '#1e1b4b', whiteSpace: 'nowrap' }}>📖 Word Collection</h2>
                            <div style={{ flex: 1, height: 2, background: 'linear-gradient(to right,transparent,rgba(124,58,237,.3),transparent)' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '.6rem', marginBottom: '1.75rem' }}>
                            {[
                                { active: !testMode, label: '📇 Flashcards', onClick: () => setTestMode(false), ac: '#7c3aed', bc: '#e2e8f0' },
                                { active: testMode,  label: '🧠 Test Yourself', onClick: () => setTestMode(true), ac: '#e11d48', bc: '#e2e8f0' },
                            ].map(b => (
                                <button key={b.label} onClick={b.onClick} style={{
                                    padding: '.55rem 1.1rem', borderRadius: 12,
                                    border: `2px solid ${b.active ? b.ac : b.bc}`,
                                    background: b.active ? b.ac : 'white',
                                    color: b.active ? 'white' : '#64748b',
                                    fontFamily: 'var(--font-playful)', fontWeight: 700, fontSize: '.88rem',
                                    cursor: 'pointer', transition: 'all .2s',
                                }}>{b.label}</button>
                            ))}
                        </div>

                        {!testMode && (
                            <>
                                <div style={{ background: 'rgba(124,58,237,.05)', padding: '.75rem', borderRadius: 12, marginBottom: '1.5rem', border: '1px solid rgba(124,58,237,.1)', textAlign: 'center' }}>
                                    <p style={{ fontSize: '.82rem', color: '#64748b', fontFamily: 'var(--font-playful)' }}>
                                        Tap each card to reveal meaning · {(story.vocabulary || []).length} words learned this story
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.25rem' }}>
                                    {(story.vocabulary || []).map((v, i) => (
                                        <VocabCard key={i} vocab={v} lang={lang}
                                            flipped={flipped[i] || false}
                                            onFlip={() => setFlipped(p => ({ ...p, [i]: !p[i] }))} />
                                    ))}
                                </div>
                            </>
                        )}
                        {testMode && <VocabTest vocabulary={story.vocabulary || []} lang={lang} />}
                    </div>
                )}
            </div>

            {/* Floating New Story button */}
            <button onClick={() => router.push('/')} style={{
                position: 'fixed', bottom: '2rem', right: '2rem',
                background: 'linear-gradient(135deg,#7c3aed,#0ea5e9)',
                color: 'white', border: 'none', borderRadius: '50%',
                width: 58, height: 58,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '1.4rem',
                boxShadow: '0 8px 28px rgba(124,58,237,.45)',
                transition: 'transform .2s',
            }} title="Create a new story"
               onMouseOver={e => e.currentTarget.style.transform = 'scale(1.12)'}
               onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                ✨
            </button>
        </div>
    );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function StoryPage() {
    return (
        <main style={{ minHeight: '100vh', scrollBehavior: 'smooth' }}>
            <Suspense fallback={
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#fdf6e3 0%,#f3e8ff 50%,#e0f2fe 100%)' }}>
                    <div style={{ fontSize: '3.5rem', animation: 'bounce 1s ease-in-out infinite', marginBottom: '1rem' }}>📖</div>
                    <Loader2 style={{ animation: 'spin 1s linear infinite', color: '#7c3aed' }} size={30} />
                </div>
            }>
                <StoryContent />
            </Suspense>
        </main>
    );
}
