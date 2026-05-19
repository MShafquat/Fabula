import { OpenAI } from 'openai';

export const maxDuration = 60;

const DELIM = '---METADATA---';

const grammarFocus = {
    Beginner:     'present tense verbs, singular/plural nouns, basic adjective agreement. Short punchy sentences. Repeat key patterns 3-4 times.',
    Intermediate: 'past and future tenses side-by-side, 1-2 idiomatic expressions, subordinate clauses (because/although/when).',
    Advanced:     "subjunctive mood, conditional sentences, passive voice, literary devices. Grammar as a stylistic choice, not a textbook example.",
};

const artStyle = {
    Beginner:     (s) => `Magical children's picture book illustration. Watercolor washes with bold ink outlines, Quentin Blake meets Beatrix Potter. Scene: ${s}. Warm amber light, jewel-tone colors on creamy parchment. Adorable expressive characters. NO text or letters anywhere.`,
    Intermediate: (s) => `Young-adult novel chapter artwork. Gouache painting, Studio Ghibli meets classic fairy tale illustration. Scene: ${s}. Golden hour lighting, layered atmospheric depth. Characters with visible personality. NO text anywhere.`,
    Advanced:     (s) => `Literary novel illustration. Oil painting with Baroque chiaroscuro. Scene: ${s}. Velvet shadows to brilliant highlights. Characters with psychological complexity. NO text anywhere.`,
};

function buildPrompt(language, level, topic) {
    const wordRange = { Beginner: '100-150', Intermediate: '200-250', Advanced: '300-400' }[level] || '200-250';
    return `You are an award-winning author writing a ${level}-level ${language} story about "${topic}" for language learners.

THE DETECTIVE PRINCIPLE: Grammar patterns are hidden clues woven invisibly so learners absorb them naturally. Never announce a rule; demonstrate it 3-4 times.

STORY REQUIREMENTS:
- Story body ENTIRELY in ${language} (no English in the story text)
- ${wordRange} words — tight, every sentence earns its place
- Open with a vivid hook. Clear arc: hook → tension → resolution
- Grammar focus (${level}): ${grammarFocus[level] || grammarFocus.Intermediate}
- Dialogue sounds like real speech. Weave 8-12 vocabulary words naturally.

OUTPUT FORMAT — use EXACTLY this structure:
[Write the full story here in ${language}]
${DELIM}
{"title":"story title in ${language}","title_translation":"English title","content_translation":"full English translation","imagePromptScene":"one vivid cinematic sentence describing the most striking visual moment","vocabulary":[{"word":"","translation":"","definition":"","part_of_speech":"","pronunciation":"IPA for ${language}","example":"","example_translation":""}],"exercises":[{"type":"comprehension","question":"","options":["","","",""],"answer":"","explanation":""},{"type":"fill_in_blank","question":"","answer":"","explanation":""},{"type":"vocabulary","question":"","options":["","",""],"answer":"","explanation":""},{"type":"word_match","instruction":"","pairs":[{"word":"","translation":""},{"word":"","translation":""},{"word":"","translation":""},{"word":"","translation":""}]},{"type":"word_scramble","instruction":"","scrambled":"","answer":"","hint":""},{"type":"sentence_order","instruction":"","words":[],"answer":"","translation":""}]}`;
}

const MOCK_STORY = 'En un pueblo entre montañas de plata, había una biblioteca donde los libros podían hablar. Cada tarde, el viejo bibliotecario abría las puertas y los niños corrían adentro. "¡Cuéntame una historia!" pedían. Los libros susurraban y comenzaban. (Add OPENAI_API_KEY for real stories.)';
const MOCK_META = { title: 'La Biblioteca Encantada', title_translation: 'The Enchanted Library', content_translation: 'In a silver-mountain town, a library where books could speak.', imagePromptScene: 'A glowing magical library at dusk, floating books and golden light', vocabulary: [{ word: 'biblioteca', translation: 'library', definition: 'A place where books are kept.', part_of_speech: 'noun', pronunciation: '/bi.blio.ˈte.ka/', example: 'La biblioteca tiene miles de libros.', example_translation: 'The library has thousands of books.' }], exercises: [] };

export async function POST(req) {
    const { language, level, topic } = await req.json();
    const enc = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (obj) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

            // Mock mode (no API key)
            if (!process.env.OPENAI_API_KEY) {
                for (const ch of MOCK_STORY) send({ type: 'token', text: ch });
                send({ type: 'meta', ...MOCK_META });
                send({ type: 'done' });
                controller.close();
                return;
            }

            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

            try {
                // ── 1. Stream story text ──────────────────────────────────
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o',
                    stream: true,
                    messages: [{ role: 'system', content: buildPrompt(language, level, topic) }],
                    temperature: 0.85,
                });

                let inStory = true;
                let tail = '';       // buffer last N chars to detect delimiter across chunks
                let metaBuffer = '';

                for await (const chunk of completion) {
                    const delta = chunk.choices[0]?.delta?.content ?? '';
                    if (!delta) continue;

                    if (inStory) {
                        const combined = tail + delta;
                        const delimIdx = combined.indexOf(DELIM);

                        if (delimIdx !== -1) {
                            // Delimiter found — stream everything before it
                            const before = combined.slice(0, delimIdx);
                            if (before) send({ type: 'token', text: before });
                            metaBuffer = combined.slice(delimIdx + DELIM.length);
                            inStory = false;
                        } else {
                            // Stream safe portion (hold back enough chars to catch split delimiter)
                            const safeLen = Math.max(0, combined.length - DELIM.length);
                            if (safeLen > 0) send({ type: 'token', text: combined.slice(0, safeLen) });
                            tail = combined.slice(safeLen);
                        }
                    } else {
                        metaBuffer += delta;
                    }
                }
                // Flush tail if delimiter was never found
                if (inStory && tail) send({ type: 'token', text: tail });

                // ── 2. Parse metadata ─────────────────────────────────────
                let parsed = null;
                try {
                    // Strip any leading/trailing whitespace or markdown fences
                    const clean = metaBuffer.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
                    parsed = JSON.parse(clean);
                    send({ type: 'meta', ...parsed });
                } catch (e) {
                    console.error('Metadata parse error:', e.message, '| raw:', metaBuffer.slice(0, 200));
                }

                // ── 3. Generate illustration ──────────────────────────────
                const scene = parsed?.imagePromptScene;
                if (scene) {
                    try {
                        const styleFn = artStyle[level] || artStyle.Intermediate;
                        const imgRes = await openai.images.generate({
                            model: 'gpt-image-1',
                            prompt: styleFn(scene),
                            n: 1,
                            size: '1024x1024',
                            quality: 'low',
                        });
                        const b64 = imgRes.data[0]?.b64_json;
                        if (b64) send({ type: 'image', b64 });
                    } catch (imgErr) {
                        console.error('Image generation error:', imgErr.message);
                    }
                }

                send({ type: 'done' });
                controller.close();
            } catch (err) {
                console.error('Generation error:', err.message);
                send({ type: 'error', message: err.message });
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
}
