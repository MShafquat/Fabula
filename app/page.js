'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, Zap } from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const LEVELS = [
    {
        id: 'beginner', label: 'Beginner', emoji: '🌱', level: 'Beginner',
        sublabel: 'Just starting out',
        desc: '~100 words · Simple sentences · Core vocabulary',
        color: '#15803d', bg: 'rgba(21,128,61,0.07)',
    },
    {
        id: 'intermediate', label: 'Intermediate', emoji: '📖', level: 'Intermediate',
        sublabel: 'Building confidence',
        desc: '~220 words · Mixed tenses · Natural idioms',
        color: '#0ea5e9', bg: 'rgba(14,165,233,0.07)',
    },
    {
        id: 'advanced', label: 'Advanced', emoji: '🎯', level: 'Advanced',
        sublabel: 'Polishing fluency',
        desc: '~350 words · Rich vocabulary · Literary style',
        color: '#7c3aed', bg: 'rgba(124,58,237,0.07)',
    },
];

const LANGUAGES = [
    // European
    { code: 'Spanish',          emoji: '🇪🇸', label: 'Spanish',    group: 'European' },
    { code: 'French',           emoji: '🇫🇷', label: 'French',     group: 'European' },
    { code: 'German',           emoji: '🇩🇪', label: 'German',     group: 'European' },
    { code: 'Italian',          emoji: '🇮🇹', label: 'Italian',    group: 'European' },
    { code: 'Portuguese',       emoji: '🇵🇹', label: 'Portuguese', group: 'European' },
    { code: 'Dutch',            emoji: '🇳🇱', label: 'Dutch',      group: 'European' },
    { code: 'Polish',           emoji: '🇵🇱', label: 'Polish',     group: 'European' },
    { code: 'Swedish',          emoji: '🇸🇪', label: 'Swedish',    group: 'European' },
    { code: 'Danish',           emoji: '🇩🇰', label: 'Danish',     group: 'European' },
    { code: 'Finnish',          emoji: '🇫🇮', label: 'Finnish',    group: 'European' },
    { code: 'Norwegian',        emoji: '🇳🇴', label: 'Norwegian',  group: 'European' },
    { code: 'Czech',            emoji: '🇨🇿', label: 'Czech',      group: 'European' },
    { code: 'Romanian',         emoji: '🇷🇴', label: 'Romanian',   group: 'European' },
    { code: 'Greek',            emoji: '🇬🇷', label: 'Greek',      group: 'European' },
    { code: 'Ukrainian',        emoji: '🇺🇦', label: 'Ukrainian',  group: 'European' },
    { code: 'Hungarian',        emoji: '🇭🇺', label: 'Hungarian',  group: 'European' },
    { code: 'Croatian',         emoji: '🇭🇷', label: 'Croatian',   group: 'European' },
    { code: 'Catalan',          emoji: '🏳️', label: 'Catalan',    group: 'European' },
    // Asian & Pacific
    { code: 'Japanese',         emoji: '🇯🇵', label: 'Japanese',   group: 'Asian & Pacific' },
    { code: 'Mandarin Chinese', emoji: '🇨🇳', label: 'Mandarin',   group: 'Asian & Pacific' },
    { code: 'Korean',           emoji: '🇰🇷', label: 'Korean',     group: 'Asian & Pacific' },
    { code: 'Thai',             emoji: '🇹🇭', label: 'Thai',       group: 'Asian & Pacific' },
    { code: 'Vietnamese',       emoji: '🇻🇳', label: 'Vietnamese', group: 'Asian & Pacific' },
    { code: 'Hindi',            emoji: '🇮🇳', label: 'Hindi',      group: 'Asian & Pacific' },
    { code: 'Bengali',          emoji: '🇧🇩', label: 'Bengali',    group: 'Asian & Pacific' },
    { code: 'Tamil',            emoji: '🇱🇰', label: 'Tamil',      group: 'Asian & Pacific' },
    { code: 'Nepali',           emoji: '🇳🇵', label: 'Nepali',     group: 'Asian & Pacific' },
    { code: 'Indonesian',       emoji: '🇮🇩', label: 'Indonesian', group: 'Asian & Pacific' },
    { code: 'Malay',            emoji: '🇲🇾', label: 'Malay',      group: 'Asian & Pacific' },
    { code: 'Tagalog',          emoji: '🇵🇭', label: 'Tagalog',    group: 'Asian & Pacific' },
    // Middle East & Africa
    { code: 'Arabic',           emoji: '🇸🇦', label: 'Arabic',     group: 'Middle East & Africa' },
    { code: 'Turkish',          emoji: '🇹🇷', label: 'Turkish',    group: 'Middle East & Africa' },
    { code: 'Persian',          emoji: '🇮🇷', label: 'Persian',    group: 'Middle East & Africa' },
    { code: 'Urdu',             emoji: '🇵🇰', label: 'Urdu',       group: 'Middle East & Africa' },
    { code: 'Hebrew',           emoji: '🇮🇱', label: 'Hebrew',     group: 'Middle East & Africa' },
    { code: 'Russian',          emoji: '🇷🇺', label: 'Russian',    group: 'Middle East & Africa' },
    { code: 'Swahili',          emoji: '🇰🇪', label: 'Swahili',    group: 'Middle East & Africa' },
    { code: 'Amharic',          emoji: '🇪🇹', label: 'Amharic',   group: 'Middle East & Africa' },
];

const LANG_GROUPS = ['European', 'Asian & Pacific', 'Middle East & Africa'];

const GROUP_COLORS = {
    'European':           '#7c3aed',
    'Asian & Pacific':    '#0ea5e9',
    'Middle East & Africa': '#f59e0b',
};

const CATEGORIES = [
    {
        group: 'Adventure & Fantasy', emoji: '⚔️', color: '#e11d48', bg: 'rgba(225,29,72,0.06)',
        topics: [
            { code: 'High Adventure',    emoji: '⚔️', label: 'High Adventure', desc: 'Epic quests & battles' },
            { code: 'Fantasy Quest',     emoji: '🐉', label: 'Dragon Quest',    desc: 'Dragons & ancient magic' },
            { code: 'Treasure Hunt',     emoji: '💰', label: 'Treasure Hunt',   desc: 'Maps & hidden gold' },
            { code: 'Magic School',      emoji: '✨', label: 'Magic School',    desc: 'Spells & potions' },
            { code: 'Pirate Stories',    emoji: '🏴‍☠️', label: 'Pirates',        desc: 'Seas & adventure' },
            { code: 'Superhero',         emoji: '🦸', label: 'Superhero',       desc: 'Powers & heroism' },
        ],
    },
    {
        group: 'Mystery & Thriller', emoji: '🔍', color: '#7c3aed', bg: 'rgba(124,58,237,0.06)',
        topics: [
            { code: 'Detective Story',   emoji: '🕵️', label: 'Detective',       desc: 'Clues & suspects' },
            { code: 'Haunted Mystery',   emoji: '👻', label: 'Haunted',          desc: 'Spooky secrets' },
            { code: 'Victorian Mystery', emoji: '🔍', label: 'Victorian',        desc: 'Old-world intrigue' },
            { code: 'Spy Mission',       emoji: '🕶️', label: 'Spy Mission',      desc: 'Codes & danger' },
        ],
    },
    {
        group: 'Nature & Animals', emoji: '🌿', color: '#15803d', bg: 'rgba(21,128,61,0.06)',
        topics: [
            { code: 'Forest Fable',       emoji: '🦊', label: 'Forest Fable',   desc: 'Woodland creatures' },
            { code: 'Ocean Adventure',    emoji: '🌊', label: 'Ocean Deep',      desc: 'Sea wonders' },
            { code: 'Animal Kingdom',     emoji: '🦁', label: 'Safari',          desc: 'Wild animals' },
            { code: 'Dinosaur Adventures',emoji: '🦕', label: 'Dinosaurs',       desc: 'Prehistoric world' },
            { code: 'Under the Sea',      emoji: '🐙', label: 'Under the Sea',   desc: 'Ocean creatures' },
            { code: 'Enchanted Garden',   emoji: '🌸', label: 'Magic Garden',    desc: 'Flowers & fairies' },
        ],
    },
    {
        group: 'Science & Future', emoji: '🚀', color: '#0ea5e9', bg: 'rgba(14,165,233,0.06)',
        topics: [
            { code: 'Space Exploration',  emoji: '🚀', label: 'Space',           desc: 'Stars & planets' },
            { code: 'Robot Adventure',    emoji: '🤖', label: 'Robots',          desc: 'AI & machines' },
            { code: 'Time Travel',        emoji: '⏰', label: 'Time Travel',      desc: 'Past & future' },
            { code: 'Inventor Workshop',  emoji: '⚙️', label: 'Inventor',        desc: 'Gadgets & science' },
        ],
    },
    {
        group: 'Folklore & Magic', emoji: '🧚', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)',
        topics: [
            { code: 'Ancient Legend',    emoji: '📜', label: 'Ancient Legend',  desc: 'Myths & gods' },
            { code: 'Fairy Tale',        emoji: '🧚', label: 'Fairy Tale',       desc: 'Classic magic' },
            { code: 'Cultural Folk Tale',emoji: '🎭', label: 'Folk Tale',        desc: 'World traditions' },
            { code: 'Witch and Wizard',  emoji: '🪄', label: 'Witch & Wizard',  desc: 'Potions & spells' },
        ],
    },
    {
        group: 'Everyday Life', emoji: '🏫', color: '#06d6a0', bg: 'rgba(6,214,160,0.06)',
        topics: [
            { code: 'School Day',        emoji: '🎓', label: 'School Day',      desc: 'Lessons & friends' },
            { code: 'Summer Experience', emoji: '☀️', label: 'Summer Fun',      desc: 'Holidays & play' },
            { code: 'City Exploration',  emoji: '🏙️', label: 'City Life',       desc: 'Urban adventures' },
            { code: 'Friendship Adventure',emoji:'👯',label: 'Friendship',      desc: 'Bonds & loyalty' },
            { code: 'Family Discovery',  emoji: '👨‍👩‍👧‍👦', label: 'Family',    desc: 'Home & love' },
        ],
    },
    {
        group: 'Food & Culture', emoji: '🍜', color: '#e11d48', bg: 'rgba(225,29,72,0.06)',
        topics: [
            { code: 'Cooking Adventure', emoji: '👨‍🍳', label: 'Cooking',      desc: 'Recipes & kitchens' },
            { code: 'World Food Journey',emoji: '🍜', label: 'Food Journey',   desc: 'World cuisines' },
            { code: 'Street Market',     emoji: '🛒', label: 'Street Market',  desc: 'Bazaars & stalls' },
        ],
    },
    {
        group: 'Arts & Sports', emoji: '🎨', color: '#7c3aed', bg: 'rgba(124,58,237,0.06)',
        topics: [
            { code: 'Sports Champions',  emoji: '⚽', label: 'Sports',         desc: 'Games & victory' },
            { code: 'Music Journey',     emoji: '🎵', label: 'Music',          desc: 'Rhythms & songs' },
            { code: 'Art Studio',        emoji: '🎨', label: 'Art Studio',     desc: 'Colors & creativity' },
            { code: 'Dance Competition', emoji: '💃', label: 'Dance',          desc: 'Movement & rhythm' },
        ],
    },
];

// Rotating greetings: [language, script greeting, meaning]
const GREETINGS = [
    ['Spanish',  'Hola',       'Hello'],
    ['Japanese', 'こんにちは', 'Hello'],
    ['Arabic',   'مرحبا',     'Hello'],
    ['French',   'Bonjour',   'Hello'],
    ['Hindi',    'नमस्ते',    'Hello'],
    ['Korean',   '안녕하세요', 'Hello'],
    ['Bengali',  'নমস্কার',   'Hello'],
    ['Russian',  'Привет',    'Hello'],
    ['Mandarin', '你好',       'Hello'],
    ['German',   'Hallo',     'Hello'],
];

// Floating script chars (decorative)
const SCRIPT_CHARS = [
    { char: 'の', size: 56, top: '8%',  left: '4%',  delay: 0 },
    { char: 'ع',  size: 52, top: '12%', right: '5%', delay: 1.2 },
    { char: 'Ж',  size: 48, top: '70%', left: '2%',  delay: 2.4 },
    { char: '한', size: 44, top: '80%', right: '3%', delay: 0.7 },
    { char: 'α',  size: 40, top: '35%', left: '1%',  delay: 3.1 },
    { char: 'ב',  size: 46, top: '55%', right: '2%', delay: 1.8 },
    { char: 'क',  size: 42, top: '90%', left: '6%',  delay: 2.0 },
    { char: '好', size: 54, top: '20%', right: '8%', delay: 0.4 },
];

function getTodayStr() { return new Date().toISOString().split('T')[0]; }
function getDailyCount() {
    if (typeof window === 'undefined') return 0;
    const date = localStorage.getItem('fabula_usage_date');
    if (date !== getTodayStr()) return 0;
    return parseInt(localStorage.getItem('fabula_daily_count') || '0');
}
function isPremium() {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('fabula_premium') === 'true';
}

const FREE_LIMIT = 3;

// ─── Greeting Rotator ─────────────────────────────────────────────────────────
function GreetingRotator() {
    const [idx, setIdx] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const t = setInterval(() => {
            setFade(false);
            setTimeout(() => { setIdx(i => (i + 1) % GREETINGS.length); setFade(true); }, 300);
        }, 2200);
        return () => clearInterval(t);
    }, []);

    const [lang, word] = GREETINGS[idx];
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.75rem', marginBottom: '1.25rem', minHeight: '2.5rem' }}>
            <span style={{
                fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
                fontFamily: 'var(--font-display)',
                color: '#7c3aed',
                transition: 'opacity .3s ease, transform .3s ease',
                opacity: fade ? 1 : 0,
                transform: fade ? 'translateY(0)' : 'translateY(-8px)',
                display: 'inline-block',
            }}>
                {word}
            </span>
            <span style={{
                fontSize: '.8rem', fontFamily: 'var(--font-playful)', fontWeight: 600,
                color: '#94a3b8', background: '#f1f5f9', padding: '.2rem .6rem',
                borderRadius: '50px', transition: 'opacity .3s ease', opacity: fade ? 1 : 0,
            }}>
                {lang}
            </span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedLang, setSelectedLang]   = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [langSearch, setLangSearch]       = useState('');
    const [dailyCount, setDailyCount]       = useState(0);
    const [premium, setPremium]             = useState(false);

    useEffect(() => { setDailyCount(getDailyCount()); setPremium(isPremium()); }, []);

    const storiesLeft = Math.max(0, FREE_LIMIT - dailyCount);
    const canGenerate = premium || storiesLeft > 0;

    const selectedLevelObj = LEVELS.find(l => l.id === selectedLevel);

    const filteredLangs = langSearch
        ? LANGUAGES.filter(l => l.label.toLowerCase().includes(langSearch.toLowerCase()))
        : LANGUAGES;

    const handleStart = () => {
        if (!selectedLevel || !selectedLang || !selectedTopic) return;
        router.push(`/story?lang=${encodeURIComponent(selectedLang)}&level=${encodeURIComponent(selectedLevelObj.level)}&topic=${encodeURIComponent(selectedTopic)}`);
    };

    const quickStart = () => {
        router.push('/story?lang=Spanish&level=Beginner&topic=Fairy+Tale');
    };

    const goStep = (s) => { if (s < step) setStep(s); };

    const afterLevelSelect = (id) => {
        setSelectedLevel(id);
        setTimeout(() => setStep(2), 280);
    };

    const afterLangSelect = (code) => {
        setSelectedLang(code);
        setTimeout(() => setStep(3), 280);
    };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <main style={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #fdf6e3 0%, #f3e8ff 45%, #e0f2fe 80%, #fdf6e3 100%)',
            position: 'relative',
            overflow: 'hidden',
            paddingBottom: '4rem',
        }}>
            {/* Floating script characters */}
            {SCRIPT_CHARS.map((s, i) => (
                <div key={i} className="script-float" style={{
                    fontSize: s.size,
                    top: s.top,
                    left: s.left,
                    right: s.right,
                    animationDelay: `${s.delay}s`,
                    animationDuration: `${6 + s.delay}s`,
                }}>
                    {s.char}
                </div>
            ))}

            {/* Subtle star sparkles */}
            {[
                { t: '15%', l: '18%', d: 0 }, { t: '25%', r: '20%', d: 1 },
                { t: '60%', l: '12%', d: 2 }, { t: '75%', r: '15%', d: .5 },
            ].map((s, i) => (
                <div key={i} style={{
                    position: 'absolute', top: s.t, left: s.l, right: s.r,
                    fontSize: '1.1rem', opacity: .14, pointerEvents: 'none',
                    animation: `twinkle ${4 + i}s ease-in-out infinite`,
                    animationDelay: `${s.d}s`,
                }}>✦</div>
            ))}

            <div style={{ maxWidth: '780px', margin: '0 auto', padding: '2.5rem 1.25rem 2rem', position: 'relative', zIndex: 10 }}>

                {/* ── HERO ──────────────────────────────────────────────── */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 72, height: 72,
                        background: 'white',
                        borderRadius: '50%',
                        boxShadow: '0 8px 24px rgba(124,58,237,.18)',
                        marginBottom: '1rem',
                        fontSize: '2.2rem',
                        animation: 'bounce 3s ease-in-out infinite',
                    }}>📚</div>

                    <h1 style={{
                        fontSize: 'clamp(2.8rem, 9vw, 4.5rem)',
                        marginBottom: '.4rem',
                        fontFamily: 'var(--font-display)',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #f59e0b 50%, #e11d48 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1.1,
                    }}>Fabula</h1>

                    <GreetingRotator />

                    <p style={{
                        fontSize: 'clamp(.95rem, 2.5vw, 1.15rem)',
                        color: '#4c4675',
                        fontFamily: 'var(--font-playful)',
                        maxWidth: 420,
                        margin: '0 auto 1.5rem',
                        lineHeight: 1.6,
                    }}>
                        Learn any language through beautifully illustrated AI stories — exercises, vocabulary, and instant word definitions included.
                    </p>

                    {/* Trust badges */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                        {[
                            { icon: '🌍', text: '38 Languages' },
                            { icon: '📖', text: '8 Story Types' },
                            { icon: '⚡', text: 'No Account Needed' },
                        ].map(b => (
                            <span key={b.text} style={{
                                display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                                padding: '.32rem .75rem',
                                background: 'white',
                                borderRadius: '50px',
                                fontSize: '.78rem',
                                fontFamily: 'var(--font-playful)',
                                fontWeight: 600,
                                color: '#4c4675',
                                boxShadow: '0 2px 8px rgba(124,58,237,.1)',
                                border: '1px solid rgba(124,58,237,.1)',
                            }}>
                                {b.icon} {b.text}
                            </span>
                        ))}
                    </div>

                    {/* Quick Start */}
                    <button
                        onClick={quickStart}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                            padding: '.55rem 1.25rem',
                            background: 'transparent',
                            border: '2px solid #7c3aed',
                            borderRadius: '50px',
                            color: '#7c3aed',
                            fontFamily: 'var(--font-playful)',
                            fontWeight: 600, fontSize: '.85rem',
                            cursor: 'pointer',
                            transition: 'all .2s ease',
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7c3aed'; }}
                    >
                        <Zap size={14} /> Try an instant story → Spanish Beginner
                    </button>
                </div>

                {/* ── FREE COUNTER ──────────────────────────────────────── */}
                {!premium && (
                    <div className="freemium-banner">
                        <span className="free-text">
                            🎁 {storiesLeft > 0
                                ? `${storiesLeft} free ${storiesLeft === 1 ? 'story' : 'stories'} remaining today — resets at midnight`
                                : "Daily limit reached — come back tomorrow or go Premium!"}
                        </span>
                        <button className="upgrade-btn">⭐ Unlimited — 299 ৳/mo</button>
                    </div>
                )}

                {/* ── CHAPTER STEPS ─────────────────────────────────────── */}
                <div className="chapter-steps">
                    {[
                        { n: 1, label: '1. Level' },
                        { n: 2, label: '2. Language' },
                        { n: 3, label: '3. Story' },
                    ].map((ch, i) => (
                        <span key={ch.n} style={{ display: 'contents' }}>
                            {i > 0 && <div className={`chapter-connector ${step > i ? 'done' : ''}`} />}
                            <div
                                className={`chapter-step ${step === ch.n ? 'active' : step > ch.n ? 'done' : 'upcoming'}`}
                                onClick={() => goStep(ch.n)}
                            >
                                {step > ch.n ? '✓' : ch.label}
                            </div>
                        </span>
                    ))}
                </div>

                {/* ── WIZARD CARD ───────────────────────────────────────── */}
                <div style={{
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 24,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(124,58,237,0.1)',
                    border: '1.5px solid rgba(124,58,237,0.08)',
                    padding: 'clamp(1.5rem,5vw,2.75rem)',
                    minHeight: 360,
                    animation: 'pageIn .45s ease-out',
                }}>

                    {/* STEP 1: Level */}
                    {step === 1 && (
                        <div style={{ animation: 'fadeInUp .35s ease-out' }}>
                            <h2 style={{
                                textAlign: 'center', fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(1.4rem,4vw,1.8rem)', color: '#1e1b4b',
                                marginBottom: '1.75rem',
                            }}>What's your level?</h2>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {LEVELS.map(lvl => (
                                    <button
                                        key={lvl.id}
                                        onClick={() => afterLevelSelect(lvl.id)}
                                        style={{
                                            flex: '1 1 180px', maxWidth: 220,
                                            padding: '1.5rem 1rem',
                                            borderRadius: 20,
                                            border: `2.5px solid ${selectedLevel === lvl.id ? lvl.color : '#e2e8f0'}`,
                                            background: selectedLevel === lvl.id ? lvl.bg : 'white',
                                            cursor: 'pointer',
                                            transition: 'all .25s cubic-bezier(.34,1.56,.64,1)',
                                            textAlign: 'center',
                                            boxShadow: selectedLevel === lvl.id
                                                ? `0 0 0 3px ${lvl.color}22, 0 8px 24px rgba(0,0,0,0.1)`
                                                : '0 2px 8px rgba(0,0,0,0.05)',
                                            transform: selectedLevel === lvl.id ? 'translateY(-4px)' : 'translateY(0)',
                                        }}
                                        onMouseOver={e => { if (selectedLevel !== lvl.id) e.currentTarget.style.transform = 'translateY(-6px)'; }}
                                        onMouseOut={e => { if (selectedLevel !== lvl.id) e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <span style={{ fontSize: '2.6rem', display: 'block', marginBottom: '.5rem' }}>{lvl.emoji}</span>
                                        <span style={{ fontFamily: 'var(--font-playful)', fontSize: '1.1rem', fontWeight: 700, color: lvl.color, display: 'block', marginBottom: '.25rem' }}>{lvl.label}</span>
                                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '.75rem', color: '#94a3b8', display: 'block' }}>{lvl.sublabel}</span>
                                        <span style={{
                                            marginTop: '.6rem', display: 'block',
                                            fontSize: '.72rem', color: '#64748b',
                                            fontFamily: 'var(--font-ui)', lineHeight: 1.4,
                                            background: '#f8fafc', padding: '.3rem .5rem',
                                            borderRadius: 8,
                                        }}>{lvl.desc}</span>
                                    </button>
                                ))}
                            </div>

                            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.8rem', color: '#94a3b8', fontFamily: 'var(--font-playful)' }}>
                                💡 Not sure? Start with Beginner — you can always try harder levels
                            </p>
                        </div>
                    )}

                    {/* STEP 2: Language */}
                    {step === 2 && (
                        <div style={{ animation: 'fadeInUp .35s ease-out' }}>
                            <h2 style={{
                                textAlign: 'center', fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(1.4rem,4vw,1.8rem)', color: '#1e1b4b',
                                marginBottom: '1.25rem',
                            }}>Which language?</h2>

                            <div className="lang-search-wrapper">
                                <Search size={17} className="search-icon" />
                                <input
                                    type="text"
                                    className="lang-search-input"
                                    placeholder="Search 38 languages..."
                                    value={langSearch}
                                    onChange={e => setLangSearch(e.target.value)}
                                />
                            </div>

                            <div style={{ maxHeight: '54vh', overflowY: 'auto', paddingRight: '.25rem' }}>
                                {LANG_GROUPS.map(group => {
                                    const langs = filteredLangs.filter(l => l.group === group);
                                    if (!langs.length) return null;
                                    return (
                                        <div key={group} style={{ marginBottom: '1.5rem' }}>
                                            <p style={{
                                                fontFamily: 'var(--font-playful)', fontSize: '.72rem',
                                                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em',
                                                color: GROUP_COLORS[group],
                                                marginBottom: '.65rem',
                                                display: 'flex', alignItems: 'center', gap: '.4rem',
                                            }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: GROUP_COLORS[group], display: 'inline-block' }} />
                                                {group}
                                            </p>
                                            <div className="card-selector-grid">
                                                {langs.map(lang => (
                                                    <div
                                                        key={lang.code}
                                                        className={`selector-card ${selectedLang === lang.code ? 'selected' : ''}`}
                                                        onClick={() => afterLangSelect(lang.code)}
                                                    >
                                                        <span className="card-emoji">{lang.emoji}</span>
                                                        <span className="card-label">{lang.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredLangs.length === 0 && (
                                    <p style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-playful)', padding: '2rem' }}>
                                        No language found. Try a different search.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Topic */}
                    {step === 3 && (
                        <div style={{ animation: 'fadeInUp .35s ease-out' }}>
                            <h2 style={{
                                textAlign: 'center', fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(1.4rem,4vw,1.8rem)', color: '#1e1b4b',
                                marginBottom: '1.75rem',
                            }}>What's your story about?</h2>

                            <div style={{ maxHeight: '56vh', overflowY: 'auto', paddingRight: '.25rem' }}>
                                {CATEGORIES.map(cat => (
                                    <div key={cat.group} style={{ marginBottom: '1.6rem' }}>
                                        <p style={{
                                            fontFamily: 'var(--font-playful)', fontSize: '.8rem',
                                            fontWeight: 700, color: cat.color,
                                            marginBottom: '.65rem',
                                            display: 'flex', alignItems: 'center', gap: '.4rem',
                                        }}>
                                            <span style={{ display: 'inline-flex', width: 24, height: 24, borderRadius: '50%', background: cat.bg, border: `1.5px solid ${cat.color}40`, alignItems: 'center', justifyContent: 'center', fontSize: '.8rem' }}>
                                                {cat.emoji}
                                            </span>
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
                                                        boxShadow: selectedTopic === topic.code ? `0 0 0 3px ${cat.color}22, 0 8px 24px rgba(0,0,0,0.1)` : undefined,
                                                    }}
                                                >
                                                    <span className="card-emoji">{topic.emoji}</span>
                                                    <span className="card-label">{topic.label}</span>
                                                    <span className="card-desc">{topic.desc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── BOTTOM NAV ────────────────────────────────────────── */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginTop: '1.25rem', gap: '1rem', flexWrap: 'wrap',
                }}>
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '.4rem',
                                padding: '.65rem 1.1rem', borderRadius: 12,
                                border: '2px solid #e2e8f0', background: 'white',
                                fontFamily: 'var(--font-playful)', fontWeight: 600,
                                fontSize: '.9rem', color: '#64748b', cursor: 'pointer',
                                transition: 'all .2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#7c3aed'}
                            onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                    ) : <div />}

                    {/* Selection summary pills */}
                    <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
                        {selectedLevel && (
                            <span style={{ padding: '.28rem .7rem', background: '#f3e8ff', borderRadius: 50, fontSize: '.72rem', fontFamily: 'var(--font-playful)', fontWeight: 600, color: '#7c3aed' }}>
                                {LEVELS.find(l => l.id === selectedLevel)?.emoji} {LEVELS.find(l => l.id === selectedLevel)?.label}
                            </span>
                        )}
                        {selectedLang && (
                            <span style={{ padding: '.28rem .7rem', background: '#ecfdf5', borderRadius: 50, fontSize: '.72rem', fontFamily: 'var(--font-playful)', fontWeight: 600, color: '#15803d' }}>
                                {LANGUAGES.find(l => l.code === selectedLang)?.emoji} {LANGUAGES.find(l => l.code === selectedLang)?.label}
                            </span>
                        )}
                        {selectedTopic && (
                            <span style={{ padding: '.28rem .7rem', background: '#f3e8ff', borderRadius: 50, fontSize: '.72rem', fontFamily: 'var(--font-playful)', fontWeight: 600, color: '#7c3aed' }}>
                                {CATEGORIES.flatMap(c => c.topics).find(t => t.code === selectedTopic)?.emoji} {CATEGORIES.flatMap(c => c.topics).find(t => t.code === selectedTopic)?.label}
                            </span>
                        )}
                    </div>

                    {/* Generate CTA */}
                    {step === 3 && (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={handleStart}
                                disabled={!selectedLevel || !selectedLang || !selectedTopic}
                                style={{
                                    padding: '.85rem 1.75rem',
                                    borderRadius: 16,
                                    border: 'none',
                                    background: (selectedLevel && selectedLang && selectedTopic && canGenerate)
                                        ? 'linear-gradient(135deg, #7c3aed, #0ea5e9)'
                                        : '#d1d5db',
                                    color: 'white',
                                    fontFamily: 'var(--font-playful)',
                                    fontWeight: 700, fontSize: '1rem',
                                    cursor: (selectedLevel && selectedLang && selectedTopic) ? 'pointer' : 'default',
                                    boxShadow: (selectedLevel && selectedLang && selectedTopic) ? '0 8px 24px rgba(124,58,237,.4)' : 'none',
                                    transition: 'all .3s ease',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                }}
                                onMouseOver={e => { if (selectedLevel && selectedLang && selectedTopic) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {!canGenerate ? '🔒 Daily limit reached' : '📖 Open the Book!'}
                                {/* Shine sweep on hover */}
                                <style>{`.open-book-btn::after { content:''; position:absolute; top:0; left:-100%; width:60%; height:100%; background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,.25) 50%,transparent 70%); animation: shine 2s ease infinite; }`}</style>
                            </button>
                        </div>
                    )}
                </div>

                {/* ── HOW IT WORKS ──────────────────────────────────────── */}
                <div style={{ marginTop: '3.5rem' }}>
                    <p style={{ textAlign: 'center', fontFamily: 'var(--font-playful)', fontWeight: 700, color: '#94a3b8', fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '1.5rem' }}>
                        How Fabula works
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        {[
                            { icon: '📖', step: 'Read', desc: 'An illustrated story in your target language — tailored to your level' },
                            { icon: '✋', step: 'Discover', desc: 'Double-click any word for an instant definition, pronunciation & example' },
                            { icon: '🧠', step: 'Practice', desc: '6 interactive exercises + flashcards to cement every new word' },
                        ].map(item => (
                            <div key={item.step} style={{
                                background: 'rgba(255,255,255,0.75)',
                                borderRadius: 16, padding: '1.25rem',
                                textAlign: 'center',
                                border: '1.5px solid rgba(124,58,237,0.08)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{item.icon}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#7c3aed', marginBottom: '.35rem' }}>{item.step}</div>
                                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '.78rem', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FOOTER ────────────────────────────────────────────── */}
                <p style={{ marginTop: '2.5rem', textAlign: 'center', fontFamily: 'var(--font-playful)', fontSize: '.75rem', color: '#94a3b8' }}>
                    Fabula · Powered by OpenAI · 3 free stories daily, no account required
                </p>
            </div>
        </main>
    );
}
