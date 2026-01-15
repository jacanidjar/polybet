import { Metadata } from 'next';
import { MarketPageClient } from "@/components/MarketPage.client";

// Fetch market data for SEO
async function getMarket(id: string) {
    try {
        const res = await fetch(`http://localhost:3001/markets/${id}`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const market = await getMarket(params.id);

    if (!market) {
        return {
            title: 'Market Not Found | Polybet',
        };
    }

    return {
        title: `${market.question} | Polybet`,
        description: `Trade on: ${market.question}. Current chance: ${market.chance}%. Predict the future on Polybet.`,
        openGraph: {
            images: [market.image || 'https://polybet.io/og-default.png'], // Logic: Use market image or default
        },
        twitter: {
            card: 'summary_large_image',
            title: market.question,
            description: `Trade on: ${market.question}. Current chance: ${market.chance}%`,
            images: [market.image || 'https://polybet.io/og-default.png'],
        }
    };
}

export default function MarketDetailPage({ params }: { params: { id: string } }) {
    return <MarketPageClient id={params.id} />;
}
