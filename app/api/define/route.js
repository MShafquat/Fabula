import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { word, context, language } = await req.json();

        if (!word) return NextResponse.json({ error: "Word is required" }, { status: 400 });

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({
                word, translation: "[Translation]",
                definition: "API key not configured — set OPENAI_API_KEY.",
                part_of_speech: "noun", pronunciation: word,
                example: "", example_translation: "", lang: language
            });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            temperature: 0.2,
            messages: [{
                role: "system",
                content: `You are an expert ${language} dictionary. A learner double-clicked the word "${word}" while reading this text: "${(context || '').slice(0, 300)}..."

Return ONLY valid JSON:
{
  "word": "${word}",
  "translation": "English translation of this specific word",
  "definition": "Clear 1-sentence English definition",
  "part_of_speech": "noun/verb/adjective/adverb/etc",
  "pronunciation": "IPA phonetic notation for ${language}",
  "example": "A natural example sentence using this word in ${language}",
  "example_translation": "English translation of the example",
  "lang": "${language}"
}`
            }],
        });

        const data = JSON.parse(completion.choices[0].message.content);
        data.lang = language;
        return NextResponse.json(data);

    } catch (error) {
        console.error("Define error:", error);
        return NextResponse.json({ error: "Failed to define word" }, { status: 500 });
    }
}
