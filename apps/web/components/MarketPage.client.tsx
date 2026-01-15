"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { TradingWidget } from "@/components/TradingWidget";
import { CommentsSection } from "@/components/CommentsSection";
import Link from "next/link";
import { PriceChart } from "@/components/PriceChart";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AccordionItem } from "@/components/AccordionItem";

export function MarketPageClient({ id }: { id: string }) {
    const [market, setMarket] = useState<any>(null);
    const [relatedMarkets, setRelatedMarkets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:3001/markets/${id}`);
                if (!res.ok) throw new Error('Market not found');
                const data = await res.json();

                const formattedMarket = {
                    ...data,
                    volume: typeof data.volume === 'string' ? parseFloat(data.volume) : data.volume,
                };
                setMarket(formattedMarket);

                if (formattedMarket.category) {
                    const relatedRes = await fetch(`http://localhost:3001/markets?category=${formattedMarket.category}`);
                    if (relatedRes.ok) {
                        const relatedData = await relatedRes.json();
                        setRelatedMarkets(relatedData
                            .filter((m: any) => m.id !== formattedMarket.id)
                            .slice(0, 3)
                        );
                    }
                }

            } catch (error) {
                console.error("Failed to load market", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

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

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950 pb-20">
            <Header />

            <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
                {/* Breadcrumb / Back */}
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
                    <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Markets</Link>
                    <span>/</span>
                    <span className="text-zinc-900 dark:text-white font-medium truncat max-w-[200px]">{market.category}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COLUMN (MAIN CONTENT) - 70% */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Header Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                {market.image ? (
                                    <img src={market.image} className="w-16 h-16 rounded-xl object-cover shadow-sm bg-white" />
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl shadow-sm">
                                        🎲
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white leading-tight mb-2">
                                        {market.question}
                                    </h1>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-bold text-blue-600">{market.chance}%</span>
                                            <span className="text-sm font-medium text-zinc-500 mt-2">chance</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="h-[400px] w-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm relative">
                            <div className="absolute top-4 left-4 z-10 flex gap-2">
                                <button className="px-3 py-1 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-900 dark:text-white">1D</button>
                                <button className="px-3 py-1 text-xs font-bold text-zinc-500 hover:bg-zinc-50">1W</button>
                                <button className="px-3 py-1 text-xs font-bold text-zinc-500 hover:bg-zinc-50">ALL</button>
                            </div>
                            <PriceChart />
                        </div>

                        {/* Mobile Trading Widget */}
                        <div className="lg:hidden">
                            {market && <TradingWidget marketId={market.id} />}
                        </div>

                        {/* Collapsible Rules & Context */}
                        <div className="space-y-3">
                            <AccordionItem title="Rules" className="bg-transparent border-none">
                                <div className="prose dark:prose-invert text-sm max-w-none">
                                    <p>This market will resolve to "Yes" if {market.question} by the resolution date of {new Date(market.endDate).toLocaleDateString()}.</p>
                                    <p className="mt-2">Resolution Source: General Consensus and credible reporting.</p>
                                </div>
                            </AccordionItem>

                            <AccordionItem title="Market Context" defaultOpen={true}>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {market.description || "No additional context provided for this market."}
                                </div>
                            </AccordionItem>
                        </div>

                        {/* Comments & Activity */}
                        <div className="mt-8 space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Comments</h3>
                                {market && <CommentsSection marketId={market.id} />}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Activity Feed</h3>
                                <ActivityFeed marketId={market.id} />
                            </div>
                        </div>

                        {/* Related Markets */}
                        {relatedMarkets.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Related Markets</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {relatedMarkets.map((rm) => (
                                        <div key={rm.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900 flex items-center gap-3 hover:shadow-md transition-shadow">
                                            <Link href={`/markets/${rm.slug || rm.id}`} className="flex-1 flex gap-3 items-center">
                                                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0" />
                                                <div className="flex-col min-w-0">
                                                    <div className="text-sm font-bold text-zinc-900 dark:text-white truncate line-clamp-1">{rm.question}</div>
                                                    <div className="text-xs text-zinc-500">{rm.category}</div>
                                                </div>
                                            </Link>
                                            <div className="text-green-600 font-bold text-sm">{rm.chance}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN (SIDEBAR) - 30% - Sticky */}
                    <div className="hidden lg:block lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            {market && <TradingWidget marketId={market.id} />}

                            {/* Mini Stats in Sidebar */}
                            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-zinc-500">Volume</span>
                                    <span className="font-semibold dark:text-white">${Number(market.volume).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-zinc-500">EndDate</span>
                                    <span className="font-semibold dark:text-white">{new Date(market.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500">Liquidity</span>
                                    <span className="font-semibold dark:text-white">$142,302</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
