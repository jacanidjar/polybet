"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { TradingWidget } from "@/components/TradingWidget";
import { ProbabilityBar } from "@/components/ProbabilityBar";
import { CommentsSection } from "@/components/CommentsSection";
import { ArrowLeft, Calendar, Users, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";

import { PriceChart } from "@/components/PriceChart";
import { ActivityFeed } from "@/components/ActivityFeed";

export default function MarketDetailPage({ params }: { params: { id: string } }) {
    const [activeTab, setActiveTab] = useState<"chart" | "activity" | "positions" | "comments">("chart");
    const [market, setMarket] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarket = async () => {
            try {
                const res = await fetch(`http://localhost:3001/markets/${params.id}`);
                if (!res.ok) throw new Error('Market not found');
                const data = await res.json();
                setMarket({
                    ...data,
                    volume: typeof data.volume === 'string' ? parseFloat(data.volume) : data.volume,
                });
            } catch (error) {
                console.error("Failed to load market", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchMarket();
        }
    }, [params.id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
                <Header />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </main>
        );
    }

    if (!market) {
        return (
            <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
                <Header />
                <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
                    <h1 className="text-2xl font-bold mb-4 dark:text-white">Market not found</h1>
                    <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
                </div>
            </main>
        );
    }

    const yesPrice = market.chance;
    const noPrice = 100 - market.chance;

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
            <Header />

            <div className="max-w-7xl mx-auto p-6 lg:p-12">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Markets
                </Link>

                {/* 3 Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT SIDEBAR - Market Info */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Category Badge */}
                        <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                            {market.category}
                        </div>

                        {/* Stats */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Market Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Volume</span>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        ${Number(market.volume).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Liquidity</span>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">$100,000 (Est)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Traders</span>
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">124</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Description</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {market.description || 'No description available.'}
                            </p>
                        </div>

                        {/* Resolution */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Resolution</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Resolves</p>
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {market.endDate ? new Date(market.endDate).toLocaleDateString() : 'TBD'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <ExternalLink className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Source</p>
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">General Consensus</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER - Chart & Activity & Comments */}
                    <div className="lg:col-span-6 space-y-6">
                        {/* Market Title */}
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                                {market.question}
                            </h1>
                            <ProbabilityBar yesPercentage={yesPrice} />
                        </div>

                        {/* Tabs */}
                        <div className="rounded-xl border border-neutral-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                            <div className="flex border-b border-neutral-200 dark:border-zinc-800 overflow-x-auto">
                                {["chart", "activity", "positions", "comments"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`px-4 py-3 text-sm font-medium transition-colors capitalize whitespace-nowrap ${activeTab === tab
                                            ? "bg-neutral-50 dark:bg-zinc-800 text-neutral-900 dark:text-white border-b-2 border-blue-600"
                                            : "text-gray-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6">
                                {activeTab === "chart" && (
                                    <div className="min-h-[350px]">
                                        <PriceChart />
                                    </div>
                                )}

                                {activeTab === "activity" && (
                                    <div className="space-y-3">
                                        <ActivityFeed marketId={Number(params.id)} />
                                    </div>
                                )}

                                {activeTab === "positions" && (
                                    <div className="h-96 flex items-center justify-center">
                                        <div className="text-center">
                                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                No positions yet
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "comments" && (
                                    <CommentsSection marketId={Number(params.id)} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR - Trading Widget */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-6">
                            <TradingWidget marketId={Number(params.id)} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
