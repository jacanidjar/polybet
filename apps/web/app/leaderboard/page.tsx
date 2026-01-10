"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Trophy, TrendingUp, DollarSign, Target } from "lucide-react";

interface Trader {
    rank: number;
    address: string;
    avatar: string;
    volume: number;
    trades: number;
    winRate: number;
    profit: number;
}

const MOCK_LEADERBOARD: Trader[] = [
    {
        rank: 1,
        address: "0x7a2b...4f3c",
        avatar: "from-yellow-500 to-orange-600",
        volume: 1250000,
        trades: 342,
        winRate: 68.5,
        profit: 125000,
    },
    {
        rank: 2,
        address: "0x9f1e...8d2a",
        avatar: "from-blue-500 to-purple-600",
        volume: 980000,
        trades: 287,
        winRate: 64.2,
        profit: 98000,
    },
    {
        rank: 3,
        address: "0x3c4d...1b9e",
        avatar: "from-green-500 to-teal-600",
        volume: 875000,
        trades: 256,
        winRate: 71.3,
        profit: 87500,
    },
    {
        rank: 4,
        address: "0x6e8f...2a7c",
        avatar: "from-pink-500 to-rose-600",
        volume: 720000,
        trades: 198,
        winRate: 59.8,
        profit: 72000,
    },
    {
        rank: 5,
        address: "0x1d2e...5f6a",
        avatar: "from-indigo-500 to-blue-600",
        volume: 650000,
        trades: 175,
        winRate: 66.7,
        profit: 65000,
    },
];

export default function LeaderboardPage() {
    const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "all">("7d");

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
            <Header />

            <div className="max-w-6xl mx-auto p-6 lg:p-12">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                            Leaderboard
                        </h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                        Top traders by volume and performance
                    </p>
                </div>

                {/* Timeframe Filters */}
                <div className="flex gap-2 mb-6">
                    {(["24h", "7d", "30d", "all"] as const).map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${timeframe === tf
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                }`}
                        >
                            {tf === "all" ? "All Time" : tf.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Leaderboard Table */}
                <div className="rounded-xl border border-neutral-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-neutral-50 dark:bg-zinc-800/50 border-b border-neutral-200 dark:border-zinc-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-3">Trader</div>
                        <div className="col-span-2">Volume</div>
                        <div className="col-span-2">Trades</div>
                        <div className="col-span-2">Win Rate</div>
                        <div className="col-span-2">Profit</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-neutral-200 dark:divide-zinc-800">
                        {MOCK_LEADERBOARD.map((trader) => (
                            <div
                                key={trader.rank}
                                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                {/* Rank */}
                                <div className="col-span-1 flex items-center">
                                    {trader.rank <= 3 ? (
                                        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${trader.rank === 1 ? 'bg-yellow-500/20' :
                                                trader.rank === 2 ? 'bg-gray-400/20' :
                                                    'bg-orange-600/20'
                                            }`}>
                                            <span className={`text-sm font-bold ${trader.rank === 1 ? 'text-yellow-600' :
                                                    trader.rank === 2 ? 'text-gray-600' :
                                                        'text-orange-600'
                                                }`}>
                                                {trader.rank}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                            {trader.rank}
                                        </span>
                                    )}
                                </div>

                                {/* Trader */}
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${trader.avatar} flex-shrink-0`} />
                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        {trader.address}
                                    </span>
                                </div>

                                {/* Volume */}
                                <div className="col-span-2 flex items-center">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            ${(trader.volume / 1000).toFixed(0)}K
                                        </span>
                                    </div>
                                </div>

                                {/* Trades */}
                                <div className="col-span-2 flex items-center">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            {trader.trades}
                                        </span>
                                    </div>
                                </div>

                                {/* Win Rate */}
                                <div className="col-span-2 flex items-center">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-semibold text-green-600">
                                            {trader.winRate.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>

                                {/* Profit */}
                                <div className="col-span-2 flex items-center">
                                    <span className="text-sm font-semibold text-green-600">
                                        +${(trader.profit / 1000).toFixed(0)}K
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Your Rank */}
                <div className="mt-6 rounded-xl border border-blue-500/50 bg-blue-500/5 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                            <div>
                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    Your Rank
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Connect wallet to see your position
                                </p>
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">
                            #--
                        </span>
                    </div>
                </div>
            </div>
        </main>
    );
}
