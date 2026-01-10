"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ChevronDown, ExternalLink } from "lucide-react";

interface Trade {
    id: number;
    user: {
        name: string;
        avatar: string;
    };
    action: "bought" | "sold";
    outcome: string;
    outcomeType: "positive" | "negative";
    price: number;
    amount: number;
    market: {
        name: string;
        category: string;
        icon: string;
    };
    timestamp: string;
}

// Gerar usuários fake realistas
const FAKE_USERS = [
    { name: "0x7a2b...4f3c", avatar: "from-blue-500 to-purple-600" },
    { name: "0x9f1e...8d2a", avatar: "from-green-500 to-teal-600" },
    { name: "0x3c4d...1b9e", avatar: "from-pink-500 to-rose-600" },
    { name: "0x6e8f...2a7c", avatar: "from-orange-500 to-red-600" },
    { name: "0x1d2e...5f6a", avatar: "from-indigo-500 to-blue-600" },
    { name: "0x8b3a...9c2d", avatar: "from-yellow-500 to-orange-600" },
    { name: "0x4f7e...1a8b", avatar: "from-purple-500 to-pink-600" },
    { name: "0x2c9d...6e4f", avatar: "from-cyan-500 to-blue-600" },
];

const MARKETS = [
    { name: "Will Trump win the 2024 Election?", category: "Politics", icon: "🏛️" },
    { name: "Bitcoin to hit $100k in 2024?", category: "Crypto", icon: "₿" },
    { name: "Fed to cut rates in March?", category: "Business", icon: "📊" },
    { name: "Lakers to win NBA Championship?", category: "Sports", icon: "🏀" },
    { name: "SpaceX Starship launch successful?", category: "Science", icon: "🚀" },
    { name: "Taylor Swift to release new album?", category: "Pop Culture", icon: "🎵" },
];

// Gerar trades fake realistas
const generateMockTrades = (): Trade[] => {
    const trades: Trade[] = [];
    const now = Date.now();

    for (let i = 0; i < 50; i++) {
        const user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
        const market = MARKETS[Math.floor(Math.random() * MARKETS.length)];
        const action = Math.random() > 0.5 ? "bought" : "sold";
        const isYes = Math.random() > 0.5;
        const price = Math.floor(Math.random() * 90) + 10; // 10-99¢
        const amount = Math.floor(Math.random() * 1000) + 50; // $50-$1050

        const minutesAgo = i * 2; // 2 minutos entre cada trade
        const timestamp = minutesAgo === 0 ? "now" :
            minutesAgo < 60 ? `${minutesAgo}m ago` :
                `${Math.floor(minutesAgo / 60)}h ago`;

        trades.push({
            id: i + 1,
            user,
            action,
            outcome: isYes ? "Yes" : "No",
            outcomeType: isYes ? "positive" : "negative",
            price,
            amount,
            market,
            timestamp,
        });
    }

    return trades;
};

export default function ActivityPage() {
    const [filter, setFilter] = useState<"all" | "buys" | "sells">("all");
    const [trades, setTrades] = useState<Trade[]>([]);

    // Gerar trades apenas no cliente para evitar hydration error
    useEffect(() => {
        setTrades(generateMockTrades());
    }, []);

    const filteredTrades = filter === "all"
        ? trades
        : trades.filter(t => filter === "buys" ? t.action === "bought" : t.action === "sold");

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
            <Header />

            <div className="max-w-5xl mx-auto p-6 lg:p-12">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                        Activity
                    </h1>

                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-full text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-colors">
                            All
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-full text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-colors">
                            Min amount
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-neutral-200 dark:border-zinc-800 overflow-hidden">
                    <div className="divide-y divide-neutral-200 dark:divide-zinc-800">
                        {filteredTrades.map((trade) => (
                            <div
                                key={trade.id}
                                className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                {/* Category Icon */}
                                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 text-xl">
                                    {trade.market.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    {/* Market Name */}
                                    <div className="text-sm font-medium text-neutral-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                                        {trade.market.name}
                                    </div>

                                    {/* Trade Details */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        {/* User Avatar */}
                                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${trade.user.avatar}`}></div>

                                        {/* User Name */}
                                        <span className="font-medium hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                                            {trade.user.name}
                                        </span>

                                        {/* Action */}
                                        <span>{trade.action}</span>

                                        {/* Outcome */}
                                        <span className={`font-semibold ${trade.outcomeType === "positive"
                                            ? "text-green-600 dark:text-green-500"
                                            : "text-red-600 dark:text-red-500"
                                            }`}>
                                            {trade.outcome}
                                        </span>

                                        {/* Price & Amount */}
                                        <span>at {trade.price}¢ (${trade.amount})</span>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-xs text-gray-400">{trade.timestamp}</span>
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
