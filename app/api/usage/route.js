import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { action, lang, level, topic } = await req.json();
        console.log(`[Fabula] ${action} | ${lang} ${level} ${topic} | ${new Date().toISOString()}`);
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: true });
    }
}
