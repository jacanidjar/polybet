"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { MarketCard } from "@/components/MarketCard";
import { StatsSection } from "@/components/StatsSection";
import { TopicsGrid } from "@/components/TopicsGrid";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Toaster } from 'react-hot-toast';
import { toast } from "@/lib/toast";
import { Flame, Clock, TrendingUp, Droplets } from "lucide-react";

interface Market {
    id: number;
    slug?: string;
    question: string;
    volume: string | number;
    chance: number;
    category: string;
    image?: string;
}

const BROWSE_FILTERS = [
    { id: 'volume', label: 'Top Volume', icon: Flame },
    { id: 'newest', label: 'Newest', icon: Clock },
    { id: 'ending', label: 'Ending Soon', icon: Clock },
    { id: 'liquidity', label: 'Liquidity', icon: Droplets },
];

export default function Home() {
    const searchParams = useSearchParams();
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);

    // URL State
    const activeCategory = searchParams.get('category') || 'All';
    const searchQuery = searchParams.get('search') || '';
    const activeSort = searchParams.get('sort') || 'volume';

    const updateUrl = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'All') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        window.history.pushState(null, '', `?${params.toString()}`);
        // Trigger re-render by forcing simple navigation or state update? 
        // Better: let's use window.location for simplicity in this MVP or a local state that mirrors URL
        window.location.search = params.toString();
    };

    useEffect(() => {
        const fetchMarkets = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (activeCategory !== 'All') params.append('category', activeCategory);
                if (searchQuery) params.append('search', searchQuery);
                if (activeSort) params.append('sort', activeSort);

                const res = await fetch(`http://localhost:3001/markets?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch markets');
                const data = await res.json();

                const formatted = data.map((m: any) => ({
                    ...m,
                    volume: typeof m.volume === 'string' ? parseFloat(m.volume) : m.volume,
                }));

                setMarkets(formatted);
            } catch (error) {
                console.error("Error loading markets:", error);
                toast.error("Failed to connect to backend", { id: 'api-error' });
            } finally {
                setLoading(false);
            }
        };

        fetchMarkets();
    }, [activeCategory, searchQuery, activeSort]);

    // Format volume e.g. 1250000 -> $1.2M
    const formatVolume = (vol: number | string) => {
        const v = Number(vol);
        if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
        if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
        return `$${v}`;
    };

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
            <Toaster position="bottom-right" />
            <Header />

            <div className="flex flex-col items-center p-6 lg:p-8">
                <div className="max-w-7xl w-full">

                    {/* Show Hero & Stats ONLY on Home (Active Category All + No Search) */}
                    {activeCategory === "All" && !searchQuery && (
                        <>
                            <div className="mb-10 mt-4">
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-xl">
                                    <div className="relative z-10 max-w-2xl">
                                        <h1 className="text-4xl font-bold mb-4">
                                            The World's Largest Prediction Market
                                        </h1>
                                        <p className="text-lg text-blue-100 mb-6">
                                            Trade on news, politics, crypto, and more with instant execution.
                                        </p>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                                </div>
                            </div>
                            <div className="mb-10">
                                <StatsSection />
                            </div>
                        </>
                    )}

                    {/* Topics Grid (Visual Categories) */}
                    {!searchQuery && (
                        <TopicsGrid
                            activeCategory={activeCategory}
                            onCategoryChange={(cat) => updateUrl('category', cat)}
                        />
                    )}

                    {/* Browse Filters (Tabs) */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                        {BROWSE_FILTERS.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => updateUrl('sort', f.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeSort === f.id
                                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                                    : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
                                    }`}
                            >
                                <f.icon size={14} />
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Markets Grid Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                {searchQuery ? `Results for "${searchQuery}"` : (activeCategory === "All" ? "Trending" : activeCategory)}
                            </h2>
                            <span className="text-sm font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                                {markets.length}
                            </span>
                        </div>
                    </div>

                    {/* Loading & Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-200 border-t-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {markets.length > 0 ? (
                                markets.map((market) => (
                                    <MarketCard
                                        key={market.id}
                                        id={market.id}
                                        slug={market.slug}
                                        question={market.question}
                                        volume={formatVolume(market.volume)}
                                        chance={market.chance}
                                        image={market.image}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                                        No markets found 👻
                                    </h3>
                                    <p className="text-gray-500">
                                        Try adjusting your filters or search query.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Activity Feed Section */}
                    {activeCategory === "All" && !searchQuery && (
                        <div className="mt-16 border-t border-neutral-200 dark:border-zinc-800 pt-10">
                            <ActivityFeed />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
