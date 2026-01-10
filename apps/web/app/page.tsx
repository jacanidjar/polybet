"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MarketCard } from "@/components/MarketCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { StatsSection } from "@/components/StatsSection";
import { Toaster } from 'react-hot-toast';
import { toast } from "@/lib/toast";
import { ActivityFeed } from "@/components/ActivityFeed";

const CATEGORIES = ["All", "Politics", "Crypto", "Sports", "Pop Culture", "Science", "Business"];

interface Market {
    id: number;
    question: string;
    volume: string | number;
    chance: number;
    category: string;
    image?: string;
}

export default function Home() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarkets = async () => {
            setLoading(true);
            try {
                const url = activeCategory === 'All'
                    ? 'http://localhost:3001/markets'
                    : `http://localhost:3001/markets?category=${encodeURIComponent(activeCategory)}`;

                const res = await fetch(url);
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
    }, [activeCategory]);

    const filteredMarkets = markets;

    // Formatar volume para display e.g. 1250000 -> $1.2M
    const formatVolume = (vol: number | string) => {
        const v = Number(vol);
        if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
        if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
        return `$${v}`;
    };

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
            <Toaster position="bottom-right" />

            {/* 1. Header (Sticky) */}
            <Header />

            {/* 2. Category Bar (Sticky below header) */}
            <CategoryFilter
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />

            <div className="flex flex-col items-center p-6 lg:p-8">
                <div className="max-w-7xl w-full">

                    {/* Hero Section */}
                    {activeCategory === "All" && (
                        <div className="mb-10 mt-4">
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-xl">
                                <div className="relative z-10 max-w-2xl">
                                    <h1 className="text-4xl font-bold mb-4">
                                        The World's Largest Prediction Market
                                    </h1>
                                    <p className="text-lg text-blue-100 mb-6">
                                        Trade on news, politics, crypto, and more with instant execution.
                                    </p>
                                    <button className="px-6 py-2.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                                        Start Trading
                                    </button>
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                                <div className="absolute bottom-0 right-20 w-40 h-40 bg-purple-500/20 rounded-full translate-y-1/2 blur-xl" />
                            </div>
                        </div>
                    )}

                    {/* Stats (Only show on Home/All) */}
                    {activeCategory === "All" && (
                        <div className="mb-10">
                            <StatsSection />
                        </div>
                    )}

                    {/* Markets Grid Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                {activeCategory === "All" ? "Trending" : activeCategory}
                            </h2>
                            <span className="text-sm font-medium text-gray-400 bg-neutral-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                {filteredMarkets.length}
                            </span>
                        </div>

                        {/* Filter Toggle (Optional) */}
                        <button className="text-sm text-gray-500 hover:text-neutral-900 flex items-center gap-1">
                            <span>Filter</span>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M10 18h4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-200 border-t-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {filteredMarkets.length > 0 ? (
                                filteredMarkets.map((market) => (
                                    <MarketCard
                                        key={market.id}
                                        id={market.id}
                                        question={market.question}
                                        volume={formatVolume(market.volume)}
                                        chance={market.chance}
                                        image={market.image}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center">
                                    <div className="text-4xl mb-4">👻</div>
                                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                                        No markets found
                                    </h3>
                                    <p className="text-gray-500">
                                        Try selecting a different category
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Activity Feed Section */}
                    {activeCategory === "All" && (
                        <div className="mt-16 border-t border-neutral-200 dark:border-zinc-800 pt-10">
                            <ActivityFeed />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
