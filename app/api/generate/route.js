import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { language, level, topic } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                title: "The Mysterious Key",
                content: `Once upon a time, in a land where API keys were scarce, a developer tried to build a magnificent app. (This is a mock story because OPENAI_API_KEY is missing). Target Language: ${language}. Level: ${level}.`,
                vocabulary: [
                    { word: "developer", translation: "desarrollador", definition: "A person who writes code.", part_of_speech: "noun", pronunciation: "/de.sa.ro.ʎa.ðoɾ/", example: "El developer escribe código.", example_translation: "The developer writes code." }
                ],
                exercises: []
            });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const wordCountMap = {
            'Beginner': '100-150',
            'Intermediate': '200-250',
            'Advanced': '300-400',
        };
        const wordRange = wordCountMap[level] || '200-300';

        const systemPrompt = `You are a skilled storyteller and language teacher. Your goal is to write a short, engaging story in the target language: ${language}, suitable for a learner at the ${level} level.
    The story should be about: ${topic}.
    Write with vocabulary appropriate for ${level} learners (simpler for Beginner, more nuanced for Intermediate, sophisticated for Advanced).

    Return the response strictly as valid JSON with the following structure:
    {
      "title": "Story Title in Target Language",
      "title_translation": "English translation of the title",
      "content": "The full story text (${wordRange} words)...",
      "content_translation": "Full English translation of the story content...",
      "vocabulary": [
        {
          "word": "key word from story",
          "translation": "english translation",
          "definition": "simple definition in english",
          "part_of_speech": "noun/verb/adj/adv",
          "pronunciation": "Phonetic representation using the TARGET LANGUAGE's own sounds (e.g., IPA or native phonetics), NOT English-based phonetics.",
          "example": "Example sentence using the word.",
          "example_translation": "English translation of the example."
        }
      ],
      "exercises": [
        {
          "type": "comprehension",
          "question": "Multiple choice question about the story",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "correct option",
          "explanation": "Brief explanation of why this is correct"
        },
        {
          "type": "fill_in_blank",
          "question": "Complete: '_______ was the main character.'",
          "blanks": ["Protagonist name"],
          "answer": "Protagonist name",
          "explanation": "Brief explanation"
        },
        {
          "type": "vocabulary",
          "question": "What does '[word]' mean in this context?",
          "options": ["Definition A", "Definition B", "Definition C"],
          "answer": "correct definition",
          "explanation": "Brief explanation"
        },
        {
          "type": "word_match",
          "instruction": "Match each word with its translation",
          "pairs": [
            { "word": "word in target language", "translation": "english translation" },
            { "word": "word2", "translation": "translation2" },
            { "word": "word3", "translation": "translation3" },
            { "word": "word4", "translation": "translation4" }
          ]
        },
        {
          "type": "word_scramble",
          "instruction": "Unscramble the letters to form a word from the story",
          "scrambled": "scrambled letters of the word",
          "answer": "the correct word",
          "hint": "A short clue about the word meaning"
        },
        {
          "type": "sentence_order",
          "instruction": "Put the words in the correct order to form a sentence from the story",
          "words": ["word1", "word2", "word3", "word4", "word5"],
          "answer": "word1 word2 word3 word4 word5",
          "translation": "English translation of the sentence"
        }
      ]
    }

    Ensure the vocabulary list contains 8-12 key words from the story.
    The content should be approximately ${wordRange} words.
    Generate exactly 6 exercises: 1 comprehension (multiple choice about the story), 1 fill_in_blank, 1 vocabulary (multiple choice definitions), 1 word_match (with exactly 4 word-translation pairs from the vocabulary), 1 word_scramble (scramble a vocabulary word's letters), and 1 sentence_order (use a short sentence of 4-7 words from the story, split into individual words). Make sure the word_scramble scrambled field is a proper anagram of the answer field.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content);

        // Generate Image
        try {
            const imageStyles = {
                'Beginner': `An elegant colored pencil illustration on textured cream paper depicting "${result.title}" with a ${topic} theme. Style: fine colored pencil strokes with soft blending, gentle shading, delicate hatching, warm pastel tones mixed with rich saturated colors. Clean graceful lines, charming characters, inviting composition. Like a beautifully illustrated storybook. NO text, NO words, NO letters anywhere in the image.`,
                'Intermediate': `A refined colored pencil and soft watercolor illustration depicting "${result.title}" with a ${topic} theme. Style: detailed colored pencil work with watercolor washes, expressive yet polished line work, rich color palette, layered shading and texturing. Atmospheric and immersive, like illustrations in a quality literary novel. NO text, NO words, NO letters anywhere in the image.`,
                'Advanced': `A sophisticated colored pencil illustration with fine detail depicting "${result.title}" with a ${topic} theme. Style: masterful colored pencil rendering, precise shading, rich tonal depth, subtle color gradients, intricate details, atmospheric lighting. Evocative and cinematic composition, like a premium illustrated edition. NO text, NO words, NO letters anywhere in the image.`,
            };
            const imagePrompt = imageStyles[level] || imageStyles['Intermediate'];

            const imageResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: imagePrompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                style: "natural"
            });

            result.imageUrl = imageResponse.data[0].url;
        } catch (imgError) {
            console.error("Image generation failed:", imgError);
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error generating story:", error);
        return NextResponse.json({ error: "Failed to generate story" }, { status: 500 });
    }
}
