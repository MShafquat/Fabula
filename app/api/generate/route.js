import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req) {
    try {
        const { language, level, topic } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                title: "The Enchanted Library",
                title_translation: "The Enchanted Library",
                content: `In a town nestled between silver mountains, there was a library where books could speak. Every evening, the old librarian would open the doors and children would come running. "Tell me a story," they would beg. The books would rustle their pages and begin. (Mock story — set OPENAI_API_KEY to generate real stories in ${language}.)`,
                content_translation: "In a town nestled between silver mountains, there was a library where books could speak.",
                imagePromptScene: "A glowing magical library at dusk, with floating books and golden light streaming from enchanted windows, children reading among towering bookshelves",
                vocabulary: [
                    { word: "biblioteca", translation: "library", definition: "A place where books are kept and can be borrowed.", part_of_speech: "noun", pronunciation: "/bi.blio.ˈte.ka/", example: "La biblioteca tiene miles de libros.", example_translation: "The library has thousands of books." },
                    { word: "encantado", translation: "enchanted", definition: "Under a magical spell; filled with wonder.", part_of_speech: "adjective", pronunciation: "/en.kan.ˈta.ðo/", example: "El castillo estaba encantado.", example_translation: "The castle was enchanted." }
                ],
                exercises: []
            });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const wordCountMap = { Beginner: '100-150', Intermediate: '200-250', Advanced: '300-400' };
        const wordRange = wordCountMap[level] || '200-300';

        const grammarFocus = {
            Beginner:     'present tense verbs, singular/plural nouns, basic adjective agreement. Use short punchy sentences. Repeat key grammar patterns 3-4 times so the learner absorbs them without noticing.',
            Intermediate: 'past and future tenses side-by-side to show contrast, 1-2 idiomatic expressions used naturally, subordinate clauses (because/although/when). Let the grammar emerge through the story rather than instruction.',
            Advanced:     'subjunctive mood, conditional sentences (if/would), passive voice, literary devices like metaphor and personification. Grammar should feel like a sophisticated author\'s stylistic choice, not a textbook example.',
        };

        const systemPrompt = `You are an award-winning author who writes gripping, beautifully observed short stories for language learners. Your stories read like literature — not textbook exercises. Think the narrative clarity of Hemingway, the warmth of Roald Dahl, the wonder of Studio Ghibli.

THE DETECTIVE PRINCIPLE: Just as a great detective story hides its clues in plain sight — grammar patterns should be woven invisibly into the prose. The learner discovers them naturally, like a reader piecing together a mystery. Never announce a grammar rule. Let the story demonstrate it 3-4 times so it lodges in memory.

STORY REQUIREMENTS:
- Write the story body ENTIRELY in ${language} (no English in the "content" field)
- Target length: ${wordRange} words — tight and purposeful, every sentence earns its place
- Open with a vivid hook — drop the reader into a moment of tension, wonder, or curiosity
- Build through a clear arc: inciting incident → rising tension → satisfying resolution with emotional resonance
- Grammar focus for this level (${level}): ${grammarFocus[level] || grammarFocus.Intermediate}
- Dialogue must sound like real speech, not translated textbook sentences
- Weave exactly 8-12 vocabulary words naturally — choose words the learner will want to use tomorrow

VOCABULARY: Select words that are:
- Memorable because of the emotional context they appear in (not just frequent)
- Actually pivotal to the story — learner will double-click to discover them
- Covering a range: 1-2 advanced words, mostly mid-frequency useful words
- Provide IPA phonetic notation specific to ${language}

IMAGE SCENE: Write one cinematic sentence describing the single most visually arresting moment — include the specific characters, their expressions, the exact setting, the quality of light, and the emotional atmosphere.

EXERCISES: Designed like puzzle pieces, not quizzes:
- comprehension: Ask about character motivation or a subtle plot detail — not obvious recall (4 options)
- fill_in_blank: The missing word should be one the learner now understands from context
- vocabulary: Test the nuanced meaning — use plausible distractors that share a superficial similarity
- word_match: Pick 4 pairs where the connection surprises or delights the learner
- word_scramble: Pick a 5-8 letter word from the story, provide a true anagram (double-check letter counts)
- sentence_order: Use a sentence whose word order reveals something interesting about ${language} grammar

Return ONLY valid JSON, no markdown, no code fences:
{
  "title": "story title in ${language}",
  "title_translation": "English translation of title",
  "content": "full story text in ${language} (${wordRange} words)",
  "content_translation": "full English translation",
  "imagePromptScene": "one vivid sentence describing the most beautiful visual moment in the story",
  "vocabulary": [
    {
      "word": "word in ${language}",
      "translation": "English meaning",
      "definition": "clear English definition in 1 sentence",
      "part_of_speech": "noun/verb/adjective/adverb/etc",
      "pronunciation": "IPA phonetic notation for ${language}",
      "example": "natural example sentence in ${language}",
      "example_translation": "English translation of example"
    }
  ],
  "exercises": [
    { "type": "comprehension", "question": "question in English", "options": ["A","B","C","D"], "answer": "exact correct option text", "explanation": "why this is correct" },
    { "type": "fill_in_blank", "question": "Complete: '___' in the context of the story", "answer": "the missing word in ${language}", "explanation": "brief explanation" },
    { "type": "vocabulary", "question": "What does '[word]' mean in this story?", "options": ["correct","wrong1","wrong2"], "answer": "correct", "explanation": "context" },
    { "type": "word_match", "instruction": "Match each ${language} word to its English meaning", "pairs": [{"word":"w1","translation":"t1"},{"word":"w2","translation":"t2"},{"word":"w3","translation":"t3"},{"word":"w4","translation":"t4"}] },
    { "type": "word_scramble", "instruction": "Unscramble to find a word from the story", "scrambled": "ANAGRAM_OF_ANSWER", "answer": "the target word", "hint": "English hint about meaning" },
    { "type": "sentence_order", "instruction": "Put the words in correct ${language} order", "words": ["w1","w2","w3","w4","w5"], "answer": "w1 w2 w3 w4 w5", "translation": "English translation" }
  ]
}`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
            temperature: 0.85,
        });

        const result = JSON.parse(completion.choices[0].message.content);

        // Generate stunning storybook illustration
        try {
            const scene = result.imagePromptScene || `A magical ${topic} scene with warm lighting`;

            const artStyles = {
                Beginner: `A magical children's picture book illustration. Watercolor washes with bold expressive ink outlines in the style of Quentin Blake meets Beatrix Potter. Scene: ${scene}. Soft warm amber afternoon light. Rich jewel-tone colors — emerald greens, sapphire blues, amber golds — against creamy parchment. Adorable characters with expressive big eyes and warm smiles. Whimsical magical details: glowing fireflies, floating petals, enchanted sparkles. Lush detailed foliage and environment. NO text, letters, words, or writing anywhere in the image. NO pencils, pens, paintbrushes, or drawing tools in scene. Utterly warm, magical, and inviting.`,
                Intermediate: `A richly illustrated young-adult novel chapter artwork. Detailed gouache painting technique with confident ink linework. Visual storytelling inspired by Studio Ghibli and classic fairy tale illustration masters. Scene: ${scene}. Dynamic composition with layered foreground, middle, and background. Golden hour or magical twilight lighting. Atmospheric depth and detailed environmental storytelling. Characters with visible personality and emotion. Color palette: rich indigos, warm golds, deep forest greens, accent rose. Beautiful textures — fabric, stone, wood grain, water. NO text or writing. NO art tools or drawing implements. Cinematic and enchanting.`,
                Advanced: `A sophisticated literary novel illustration. Oil painting technique with Baroque compositional depth and luminous chiaroscuro lighting. Scene: ${scene}. Rich tonal range from velvet shadows to brilliant highlights. Intricate environmental storytelling — architecture, textiles, atmospheric perspective. Characters portrayed with psychological complexity through expression and posture. Color story: deep midnight purples and blues punctuated with warm candlelight gold, jewel-like accent colors throughout. Museum-quality masterwork rendering. NO text anywhere. NO drawing instruments. Painterly, emotionally resonant, visually arresting.`,
            };

            const imagePrompt = artStyles[level] || artStyles.Intermediate;

            const imageResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: imagePrompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                style: "natural",
            });

            result.imageUrl = imageResponse.data[0].url;
        } catch (imgErr) {
            console.error("Image generation failed:", imgErr.message);
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error generating story:", error);
        return NextResponse.json({ error: "Failed to generate story" }, { status: 500 });
    }
}
