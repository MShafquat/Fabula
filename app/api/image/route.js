import { OpenAI } from 'openai';

export const maxDuration = 60;

const artStyle = {
    Beginner:     (s) => `Magical children's picture book illustration. Watercolor washes with bold ink outlines. Scene: ${s}. Warm light, jewel-tone colors. Expressive characters. NO text anywhere.`,
    Intermediate: (s) => `Young-adult novel chapter artwork. Gouache painting, Studio Ghibli style. Scene: ${s}. Golden hour lighting, atmospheric depth. NO text anywhere.`,
    Advanced:     (s) => `Literary novel illustration. Oil painting with dramatic chiaroscuro. Scene: ${s}. Deep shadows, brilliant highlights. NO text anywhere.`,
};

export async function POST(req) {
    const { scene, level } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
        return Response.json({ error: 'No API key' }, { status: 500 });
    }
    if (!scene) {
        return Response.json({ error: 'No scene provided' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const styleFn = artStyle[level] || artStyle.Intermediate;

    try {
        const imgRes = await openai.images.generate({
            model: 'gpt-image-1',
            prompt: styleFn(scene),
            n: 1,
            size: '1024x1024',
            quality: 'low',
        });
        const b64 = imgRes.data[0]?.b64_json;
        if (!b64) return Response.json({ error: 'No image data' }, { status: 500 });
        return Response.json({ b64 });
    } catch (err) {
        console.error('Image error:', err.message);
        return Response.json({ error: err.message }, { status: 500 });
    }
}
