
"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

interface Trade {
    id: string;
    type: string;
    outcome: string;
    amount: number; // or string if Decimal
    price: number;
    createdAt: string;
    user: {
        address: string;
        username: string | null;
    };
    market: {
        slug: string | null;
        question: string;
        image: string | null;
    };
}

export function ActivityFeed({ marketId }: { marketId?: number }) {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                // Fetch from REAL API, filtering if marketId is provided
                const url = marketId
                    ? `http://localhost:3001/trades?marketId=${marketId}`
                    : "http://localhost:3001/trades";

                const res = await fetch(url);
                if (!res.ok) throw new Error("Failed to fetch trades");
                const data = await res.json();
                setTrades(data);
            } catch (error) {
                console.error("Error fetching trades:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrades();
        // Live poll every 3s
        // const interval = setInterval(fetchTrades, 3000);
        // return () => clearInterval(interval);
    }, [marketId]);

    if (loading && trades.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-neutral-200 dark:border-zinc-800 p-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (trades.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-neutral-200 dark:border-zinc-800 p-6 text-center text-gray-500">
                No recent activity.
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-neutral-200 dark:border-zinc-800 overflow-hidden">
            {!marketId && (
                <div className="p-4 border-b border-neutral-200 dark:border-zinc-800">
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Live Activity</h2>
                </div>
            )}
            <div className="divide-y divide-neutral-200 dark:divide-zinc-800 max-h-[500px] overflow-y-auto">
                {trades.map((trade) => {
                    const isBuy = trade.type === "BUY";
                    const isYes = trade.outcome === "YES";
                    const outcomeColor = isYes ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500";
                    const actionColor = isBuy ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400";

                    return (
                        <div
                            key={trade.id}
                            className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-zinc-800/50 transition-colors"
                        >
                            {/* Market Image (only show if global feed) */}
                            {!marketId && (
                                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-zinc-800 flex-shrink-0 overflow-hidden">
                                    {trade.market.image ? (
                                        <img src={trade.market.image} alt="Market" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl">
                                            📊
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                {!marketId && (
                                    <div className="text-sm font-medium text-neutral-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate">
                                        {trade.market.question}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0`}></div>
                                    <span className="font-medium hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate max-w-[100px]">
                                        {trade.user.username || trade.user.address.substring(0, 6) + '...'}
                                    </span>
                                    <span className={actionColor}>{trade.type === 'BUY' ? 'Bought' : 'Sold'}</span>
                                    <span className={`font-semibold ${outcomeColor}`}>
                                        {trade.outcome}
                                    </span>
                                    <span>
                                        at {trade.price}¢ (${Number(trade.amount).toFixed(2)})
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-xs text-gray-400">
                                    {new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
