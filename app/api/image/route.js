export const runtime = 'edge';

const artStyles = {
    Beginner: (scene) => `A magical children's picture book illustration. Watercolor washes with bold expressive ink outlines in the style of Quentin Blake meets Beatrix Potter. Scene: ${scene}. Soft warm amber afternoon light. Rich jewel-tone colors — emerald greens, sapphire blues, amber golds — against creamy parchment. Adorable characters with expressive big eyes and warm smiles. Whimsical magical details: glowing fireflies, floating petals, enchanted sparkles. Lush detailed foliage and environment. NO text, letters, words, or writing anywhere in the image. Utterly warm, magical, and inviting.`,
    Intermediate: (scene) => `A richly illustrated young-adult novel chapter artwork. Detailed gouache painting with confident ink linework. Studio Ghibli meets classic fairy tale illustration. Scene: ${scene}. Golden hour or magical twilight lighting. Layered composition with atmospheric depth. Characters with visible personality and emotion. Color palette: rich indigos, warm golds, deep forest greens. Beautiful textures — fabric, stone, wood grain, water. NO text or writing anywhere. Cinematic and enchanting.`,
    Advanced: (scene) => `A sophisticated literary novel illustration. Oil painting with Baroque chiaroscuro lighting. Scene: ${scene}. Rich tonal range from velvet shadows to brilliant highlights. Intricate environmental storytelling — architecture, textiles, atmospheric perspective. Characters with psychological complexity. Color story: deep midnight purples and blues with warm candlelight gold. Museum-quality masterwork rendering. NO text anywhere. Painterly, emotionally resonant.`,
};

export async function POST(req) {
    const { scene, level } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
        return Response.json({ error: 'Not configured' }, { status: 500 });
    }
    if (!scene) {
        return Response.json({ error: 'Missing scene' }, { status: 400 });
    }

    const prompt = (artStyles[level] || artStyles.Intermediate)(scene);

    const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'natural',
        }),
    });

    const data = await res.json();
    if (!res.ok) {
        console.error('DALL-E error:', data);
        return Response.json({ error: data.error?.message || 'Image generation failed' }, { status: 500 });
    }

    return Response.json({ url: data.data[0].url });
}
