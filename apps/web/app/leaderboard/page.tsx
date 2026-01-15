'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';

interface Trader {
    id: string;
    username: string;
    address: string;
    pnl: number;
    _count: {
        trades: number;
    };
}

export default function LeaderboardPage() {
    const [traders, setTraders] = useState<Trader[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/users/leaderboard')
            .then(res => res.json())
            .then(data => {
                setTraders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
            <Header />

            <div className="max-w-[1000px] mx-auto px-4 py-8 md:py-12">
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-2">Top Traders</h1>
                <p className="text-zinc-500 mb-6 md:mb-8">Ranked by Realized P&L</p>

                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 text-xs uppercase tracking-wider">
                                    <th className="px-4 md:px-6 py-4 font-semibold whitespace-nowrap">Rank</th>
                                    <th className="px-4 md:px-6 py-4 font-semibold w-full">User</th>
                                    <th className="hidden md:table-cell px-6 py-4 font-semibold text-right whitespace-nowrap">Trades</th>
                                    <th className="px-4 md:px-6 py-4 font-semibold text-right whitespace-nowrap">Realized P&L</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-4 md:px-6 py-4"><div className="h-4 w-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" /></td>
                                            <td className="px-4 md:px-6 py-4"><div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" /></td>
                                            <td className="hidden md:table-cell px-6 py-4 text-right"><div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse ml-auto" /></td>
                                            <td className="px-4 md:px-6 py-4 text-right"><div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : traders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                                            No traders found yet. Be the first!
                                        </td>
                                    </tr>
                                ) : (
                                    traders.map((trader, index) => {
                                        const isPositive = trader.pnl >= 0;
                                        return (
                                            <tr key={trader.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-4 md:px-6 py-4 text-zinc-500 font-medium">
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                                                            {trader.username.slice(0, 1)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-zinc-900 dark:text-white truncate max-w-[120px] md:max-w-none">
                                                                {trader.username}
                                                            </div>
                                                            <div className="text-xs text-zinc-500 font-mono truncate">
                                                                {trader.address.slice(0, 6)}...{trader.address.slice(-4)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell px-6 py-4 text-right text-zinc-900 dark:text-white font-mono">
                                                    {trader._count.trades}
                                                </td>
                                                <td className={`px-4 md:px-6 py-4 text-right font-mono font-bold whitespace-nowrap ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isPositive ? '+' : ''}{trader.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
