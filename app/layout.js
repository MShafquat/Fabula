import './globals.css'

export const metadata = {
    title: 'Fabula — Learn Languages Through Magical Stories',
    description: 'Master any language through beautifully illustrated AI-generated stories. No account needed. 38 languages. Interactive exercises, vocabulary flashcards, and instant word definitions included.',
    keywords: 'language learning, stories, AI, Spanish, French, Japanese, Bengali, Arabic, interactive exercises, vocabulary, flashcards',
    metadataBase: new URL('https://fabula.vercel.app'),
    openGraph: {
        title: 'Fabula — Learn Languages Through Magical Stories',
        description: 'Master any language through AI-generated illustrated stories with interactive exercises. Free, no account required.',
        type: 'website',
        siteName: 'Fabula',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Fabula — Learn Languages Through Magical Stories',
        description: 'Master any language through AI-generated illustrated stories. 38 languages. Free.',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#7c3aed',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebApplication',
                            name: 'Fabula',
                            description: 'Learn languages through AI-generated illustrated stories with interactive exercises.',
                            applicationCategory: 'EducationalApplication',
                            operatingSystem: 'Web',
                            offers: {
                                '@type': 'Offer',
                                price: '0',
                                priceCurrency: 'USD',
                                description: '3 free stories per day, no account required',
                            },
                            featureList: [
                                '38 languages supported',
                                'AI-generated illustrated stories',
                                'Interactive exercises',
                                'Vocabulary flashcards',
                                'Instant word definitions',
                                'Text-to-speech pronunciation',
                                'Session word bank',
                                'No account required',
                            ],
                        }),
                    }}
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
