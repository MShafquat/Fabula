import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
    try {
        const { word, context, language } = await req.json();

        if (!word) {
            return NextResponse.json({ error: "Word is required" }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                word: word,
                translation: "[Mock Translation]",
                definition: "This is a mock definition because the API key is missing.",
                part_of_speech: "noun",
                pronunciation: "/mok/"
            });
        }

        const systemPrompt = `You are a dictionary helper.
    User will provide a word in "${language}" and the sentence it appears in.
    Provide the definition of the word in English, its translation, part of speech, and IPA pronunciation.
    Return STRICT JSON:
    {
      "word": "${word}",
      "translation": "...",
      "definition": "...",
      "part_of_speech": "...",
      "pronunciation": "..."
    }
    Keep it concise.`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Word: ${word}\nContext: ${context}` }],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return NextResponse.json(result);

    } catch (error) {
        console.error("Error defining word:", error);
        return NextResponse.json({ error: "Failed to define word" }, { status: 500 });
    }
}
