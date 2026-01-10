"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { ConnectWallet } from "@/components/ConnectWallet";
import { User, Wallet, History, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const { address, isConnected } = useAccount();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!address) return;
            try {
                const res = await fetch(`http://localhost:3001/users/${address}/portfolio`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch portfolio", error);
            } finally {
                setLoading(false);
            }
        };

        if (isConnected && address) {
            fetchPortfolio();
        } else {
            setLoading(false);
        }
    }, [address, isConnected]);

    if (!isConnected) {
        return (
            <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
                <Header />
                <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] space-y-4">
                    <Wallet className="h-16 w-16 text-gray-400" />
                    <h1 className="text-2xl font-bold dark:text-white">Please Connect Your Wallet</h1>
                    <ConnectWallet />
                </div>
            </main>
        );
    }

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

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
            <Header />

            <div className="max-w-7xl mx-auto p-6 lg:p-12">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
                        {address?.slice(2, 4)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                            {data?.username || 'User'}
                        </h1>
                        <p className="text-gray-500 font-mono">{address}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Positions */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2 dark:text-white">
                            <Wallet className="h-5 w-5" /> Active Positions
                        </h2>

                        <div className="space-y-4">
                            {data?.positions?.length === 0 ? (
                                <div className="p-6 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-center text-gray-500">
                                    No active positions
                                </div>
                            ) : (
                                data?.positions?.map((pos: any) => (
                                    <Link
                                        href={`/markets/${pos.marketId}`}
                                        key={pos.id}
                                        className="block p-4 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 hover:border-blue-500 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium text-neutral-900 dark:text-white line-clamp-1">
                                                {pos.market.question}
                                            </h3>
                                            <span className={pos.outcome === 'YES' ? 'text-green-600' : 'text-red-600'}>
                                                {pos.outcome}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Shares: {Number(pos.shares).toFixed(2)}</span>
                                            <span className="text-gray-500">Avg: {Number(pos.avgPrice).toFixed(1)}¢</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Activity */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2 dark:text-white">
                            <History className="h-5 w-5" /> Recent Activity
                        </h2>

                        <div className="space-y-4">
                            {data?.trades?.map((trade: any) => (
                                <div key={trade.id} className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium dark:text-white">
                                            {trade.type === 'BUY' ? 'Bought' : 'Sold'} {trade.outcome}
                                        </span>
                                        <span className="text-gray-500">{new Date(trade.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2 truncate">{trade.market.question}</p>
                                    <div className="text-sm font-mono">
                                        {Number(trade.amount).toFixed(2)} USDC
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
