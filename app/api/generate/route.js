export const runtime = 'edge';

const grammarFocus = {
    Beginner:     'present tense verbs, singular/plural nouns, basic adjective agreement. Use short punchy sentences. Repeat key grammar patterns 3-4 times so the learner absorbs them without noticing.',
    Intermediate: 'past and future tenses side-by-side to show contrast, 1-2 idiomatic expressions used naturally, subordinate clauses (because/although/when). Let the grammar emerge through the story.',
    Advanced:     "subjunctive mood, conditional sentences (if/would), passive voice, literary devices like metaphor and personification. Grammar should feel like a sophisticated author's stylistic choice.",
};

const artStyle = {
    Beginner:     (s) => `Magical children's picture book illustration. Watercolor washes with bold ink outlines in the style of Quentin Blake meets Beatrix Potter. Scene: ${s}. Warm amber light. Jewel-tone colors — emerald, sapphire, amber — against creamy parchment. Adorable expressive characters. Whimsical details: glowing fireflies, floating petals, enchanted sparkles. NO text or letters anywhere. Warm, magical, inviting.`,
    Intermediate: (s) => `Richly illustrated young-adult novel artwork. Gouache painting with confident ink linework, Studio Ghibli meets classic fairy tale illustration. Scene: ${s}. Golden hour lighting, layered atmospheric composition. Characters with visible personality. Color palette: rich indigos, warm golds, deep forest greens. NO text anywhere. Cinematic and enchanting.`,
    Advanced:     (s) => `Sophisticated literary novel illustration. Oil painting with Baroque chiaroscuro. Scene: ${s}. Velvet shadows to brilliant highlights. Intricate environmental storytelling. Characters with psychological complexity. Deep midnight purples with warm candlelight gold. Museum-quality rendering. NO text anywhere. Painterly, emotionally resonant.`,
};

function buildPrompt(language, level, topic) {
    const wordRange = { Beginner: '100-150', Intermediate: '200-250', Advanced: '300-400' }[level] || '200-250';
    return `You are an award-winning author writing a ${level}-level ${language} story about "${topic}" for language learners. Think Hemingway's clarity, Roald Dahl's warmth, Studio Ghibli's wonder.

THE DETECTIVE PRINCIPLE: Grammar patterns are hidden clues — woven invisibly so learners absorb them naturally. Never announce a rule; demonstrate it 3-4 times.

REQUIREMENTS:
- Story body ENTIRELY in ${language} (no English in "content")
- ${wordRange} words — tight, every sentence earns its place
- Open with a vivid hook — drop the reader into tension, wonder, or curiosity
- Grammar focus (${level}): ${grammarFocus[level] || grammarFocus.Intermediate}
- Dialogue sounds like real speech, not textbook translations
- Weave exactly 8-12 vocabulary words naturally

VOCABULARY: Memorable because of the emotional context they appear in. Include IPA phonetics for ${language}.
IMAGE SCENE: One cinematic sentence — specific characters, setting, exact quality of light, emotional atmosphere.
EXERCISES: Designed like puzzle pieces, not quizzes.

Return ONLY valid JSON:
{
  "title": "story title in ${language}",
  "title_translation": "English translation",
  "content": "full story in ${language} (${wordRange} words)",
  "content_translation": "full English translation",
  "imagePromptScene": "one vivid cinematic sentence",
  "vocabulary": [{"word":"","translation":"","definition":"","part_of_speech":"","pronunciation":"","example":"","example_translation":""}],
  "exercises": [
    {"type":"comprehension","question":"","options":["","","",""],"answer":"","explanation":""},
    {"type":"fill_in_blank","question":"","answer":"","explanation":""},
    {"type":"vocabulary","question":"","options":["","",""],"answer":"","explanation":""},
    {"type":"word_match","instruction":"","pairs":[{"word":"","translation":""},{"word":"","translation":""},{"word":"","translation":""},{"word":"","translation":""}]},
    {"type":"word_scramble","instruction":"","scrambled":"","answer":"","hint":""},
    {"type":"sentence_order","instruction":"","words":[],"answer":"","translation":""}
  ]
}`;
}

const MOCK = {
    title: 'La Biblioteca Encantada',
    title_translation: 'The Enchanted Library',
    content: 'En un pueblo entre montañas de plata, había una biblioteca donde los libros podían hablar. Cada tarde, el viejo bibliotecario abría las puertas y los niños corrían adentro. "Cuéntame una historia," pedían. Los libros susurraban sus páginas y comenzaban. (Mock — add OPENAI_API_KEY for real stories.)',
    content_translation: 'In a town nestled between silver mountains, there was a library where books could speak.',
    imagePromptScene: 'A glowing magical library at dusk, floating books and golden light streaming from enchanted windows, children reading among towering bookshelves',
    vocabulary: [
        { word: 'biblioteca', translation: 'library', definition: 'A place where books are kept.', part_of_speech: 'noun', pronunciation: '/bi.blio.ˈte.ka/', example: 'La biblioteca tiene miles de libros.', example_translation: 'The library has thousands of books.' },
    ],
    exercises: [],
};

export async function POST(req) {
    const { language, level, topic } = await req.json();
    const enc = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (obj) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

            // Mock mode
            if (!process.env.OPENAI_API_KEY) {
                for (const word of MOCK.content.split(' ')) {
                    send({ type: 'token', text: word + ' ' });
                }
                const { content: _, ...meta } = MOCK;
                send({ type: 'meta', ...meta });
                send({ type: 'done' });
                controller.close();
                return;
            }

            try {
                // ── 1. Stream story from GPT-4o ───────────────────────────
                const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
                    body: JSON.stringify({
                        model: 'gpt-4o',
                        stream: true,
                        response_format: { type: 'json_object' },
                        messages: [{ role: 'system', content: buildPrompt(language, level, topic) }],
                        temperature: 0.85,
                    }),
                });

                const reader = gptRes.body.getReader();
                const dec = new TextDecoder();
                let fullJson = '';
                // State machine: find "content":" in the JSON stream, then forward chars
                let lookBuf = '';
                let inContent = false;
                let escaped = false;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const raw = dec.decode(value, { stream: true });

                    for (const line of raw.split('\n')) {
                        if (!line.startsWith('data: ')) continue;
                        const payload = line.slice(6).trim();
                        if (payload === '[DONE]') continue;
                        try {
                            const delta = JSON.parse(payload).choices?.[0]?.delta?.content ?? '';
                            fullJson += delta;

                            for (const ch of delta) {
                                if (inContent) {
                                    if (escaped) {
                                        escaped = false;
                                        if (ch === 'n') send({ type: 'token', text: '\n' });
                                        else if (ch === '"') send({ type: 'token', text: '"' });
                                        else if (ch === '\\') send({ type: 'token', text: '\\' });
                                        else send({ type: 'token', text: ch });
                                    } else if (ch === '\\') {
                                        escaped = true;
                                    } else if (ch === '"') {
                                        inContent = false;
                                    } else {
                                        send({ type: 'token', text: ch });
                                    }
                                } else {
                                    lookBuf += ch;
                                    if (lookBuf.endsWith('"content":"')) { inContent = true; lookBuf = ''; }
                                    else if (lookBuf.length > 15) lookBuf = lookBuf.slice(-15);
                                }
                            }
                        } catch { /* skip malformed SSE line */ }
                    }
                }

                // ── 2. Parse full JSON for metadata ──────────────────────
                try {
                    const parsed = JSON.parse(fullJson);
                    const { content: _, ...meta } = parsed;
                    send({ type: 'meta', ...meta });

                    // ── 3. Generate illustration ──────────────────────────
                    const scene = parsed.imagePromptScene;
                    if (scene) {
                        try {
                            const styleFn = artStyle[level] || artStyle.Intermediate;
                            const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
                                body: JSON.stringify({ model: 'dall-e-3', prompt: styleFn(scene), n: 1, size: '1792x1024', quality: 'standard', style: 'natural' }),
                            });
                            const imgJson = await imgRes.json();
                            const url = imgJson.data?.[0]?.url;
                            if (url) send({ type: 'image', url });
                        } catch (imgErr) { console.error('Image generation error:', imgErr.message); }
                    }
                } catch (parseErr) { console.error('JSON parse error:', parseErr.message); }

                send({ type: 'done' });
                controller.close();
            } catch (err) {
                console.error('Stream error:', err.message);
                send({ type: 'error', message: err.message });
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
}
