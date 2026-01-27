import { OpenAI } from "openai";
import { NextResponse } from "next/server";



export async function POST(req) {
    try {
        const { language, level, topic } = await req.json();

        if (!process.env.OPENAI_API_KEY) {
            // Mock response for development if no key
            return NextResponse.json({
                title: "The Mysterious Key",
                content: `Once upon a time, in a land where API keys were scarce, a developer tried to build a magnificent app. (This is a mock story because OPENAI_API_KEY is missing). Target Language: ${language}. Level: ${level}.`,
                vocabulary: [
                    { word: "developer", translation: "desarrollador", definition: "A person who writes code." }
                ],
                exercises: []
            });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const systemPrompt = `You are a skilled storyteller and language teacher. Your goal is to write a short story in the target language: ${language}, suitable for a learner at the ${level} level. 
    The story should be about: ${topic}.
    
    Return the response strictly as valid JSON with the following structure:
    {
      "title": "Story Title in Target Language",
      "title_translation": "English translation of the title",
      "content": "The full story text...",
      "content_translation": "Full English translation of the story content...",
      "vocabulary": [
        { 
          "word": "word from story", 
          "translation": "english translation", 
          "definition": "simple definition in english",
          "part_of_speech": "noun/verb/adj",
          "pronunciation": "Phonetic representation using the TARGET LANGUAGE's own sounds (e.g., IPA or native phonetics), NOT English-based phonetics.",
          "example": "Example sentence using the word.",
          "example_translation": "English translation of the example."
        }
      ],
      "exercises": [
         { "question": "Question about the story?", "options": ["A", "B", "C"], "answer": "correct option" }
      ]
    }
    
    Ensure the vocabulary list contains 5-10 key words from the story.
    The content should be approximately 200-300 words.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content);

        // Generate Image
        try {
            const imagePrompt = `Sketch-style color illustration for a storybook. Scene: ${result.title}. Style: clean lines, minimal details. Hand-drawn feel. ${topic} theme. No text.`;

            const imageResponse = await openai.images.generate({
                model: "dall-e-2",
                prompt: imagePrompt,
                n: 1,
                size: "512x512",
            });

            result.imageUrl = imageResponse.data[0].url;
        } catch (imgError) {
            console.error("Image generation failed:", imgError);
            // Fallback or leave undefined (frontend handles placeholder)
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error generating story:", error);
        return NextResponse.json({ error: "Failed to generate story" }, { status: 500 });
    }
}
