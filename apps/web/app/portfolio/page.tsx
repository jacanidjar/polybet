
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";
import { TrendingUp, TrendingDown, Wallet, Search, Filter, ExternalLink, Calendar, Edit2, Share2 } from "lucide-react";
import { toast } from '@/lib/toast';
import { useSellShares, useUSDCBalance, useClaimWinnings } from '@/hooks/useContracts';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface Position {
    id: number;
    marketId: number;
    marketQuestion: string;
    outcome: "YES" | "NO";
    shares: number;
    avgPrice: number;
    currentPrice: number;
    invested: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
}

// Utility to generate a beautiful gradient based on wallet address
const generateAvatarGradient = (address: string) => {
    if (!address) return "linear-gradient(45deg, #3b82f6, #8b5cf6)";
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
        ["#3b82f6", "#8b5cf6"], // Blue to Purple
        ["#10b981", "#3b82f6"], // Emerald to Blue
        ["#f59e0b", "#ef4444"], // Amber to Red
        ["#8b5cf6", "#ec4899"], // Purple to Pink
        ["#06b6d4", "#8b5cf6"], // Cyan to Purple
    ];
    const pair = colors[hash % colors.length];
    return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
};

export default function PortfolioPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<"positions" | "activity">("positions");
    const [positionFilter, setPositionFilter] = useState<"active" | "closed">("active");
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [sellingId, setSellingId] = useState<number | null>(null);

    // Mock data for the P&L chart
    const pnlChartData = useMemo(() => [
        { day: '1', pnl: -10 },
        { day: '2', pnl: 5 },
        { day: '3', pnl: -2 },
        { day: '4', pnl: 12 },
        { day: '5', pnl: 8 },
        { day: '6', pnl: 25 },
        { day: '7', pnl: 18 },
        { day: '8', pnl: 30 },
        { day: '9', pnl: 22 },
        { day: '10', pnl: 45 },
    ], []);

    const fetchPortfolio = async () => {
        if (!user?.address) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/users/${user.address}/portfolio`);
            if (!res.ok) throw new Error("Failed to fetch user data");
            const userData = await res.json();

            const mappedPositions = userData.positions.map((p: any) => {
                const avgPrice = p.avgPrice;
                const shares = Number(p.shares);
                const marketChance = p.market?.chance || 50;
                const currentPrice = p.outcome === 'YES' ? marketChance / 100 : 1 - (marketChance / 100);
                const invested = shares * avgPrice;
                const currentValue = shares * currentPrice;
                const pnl = currentValue - invested;
                const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

                return {
                    id: p.id,
                    marketId: p.marketId,
                    marketQuestion: p.market?.question || `Market #${p.marketId}`,
                    outcome: p.outcome,
                    shares,
                    avgPrice,
                    currentPrice,
                    invested,
                    currentValue,
                    pnl,
                    pnlPercent
                };
            });

            setPositions(mappedPositions);
        } catch (error) {
            console.error("Error loading portfolio:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, [user?.address]);

    const { sell } = useSellShares();
    const { claim } = useClaimWinnings();

    const handleClaim = async (position: Position) => {
        if (!user) return;
        try {
            await claim(position.marketId);
            toast.success("Winnings Claimed! 🏆");

            // Wait a moment for indexed data updates or refetch immediately
            setTimeout(() => {
                fetchPortfolio();
            }, 2000);

        } catch (error) {
            console.error(error);
            toast.error("Failed to claim winnings");
        }
    };

    const handleSell = async (position: Position) => {
        if (!user) return;
        if (!confirm(`Sell all shares in "${position.marketQuestion}"?`)) return;

        setSellingId(position.id);
        try {
            // 1. Sell on Blockchain
            const outcomeIndex = position.outcome === 'YES' ? 1 : 2;
            const sharesBigInt = BigInt(Math.floor(position.shares)); // Ensure integer

            const hash = await sell(position.marketId, outcomeIndex, sharesBigInt);
            // Optionally wait for receipt usage if needed, but await sell() waits for signature? 
            // writeContractAsync usually returns hash. We might want to wait for confirmation but for MVP OK.

            // 2. Record indexer update (Backend)
            const sellPrice = position.currentPrice;
            const sellAmount = position.shares * sellPrice;

            const res = await fetch('http://localhost:3001/trades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    marketId: position.marketId,
                    type: 'SELL',
                    outcome: position.outcome,
                    amount: sellAmount,
                    price: sellPrice,
                    txHash: hash // Save tx hash for reference
                })
            });

            if (!res.ok) throw new Error("Failed to sell");
            toast.success("Position sold & Funds returned! 💸");
            fetchPortfolio();
        } catch (error) {
            console.error(error);
            toast.error("Failed to sell on-chain");
        } finally {
            setSellingId(null);
        }
    };

    const stats = useMemo(() => {
        const invested = positions.reduce((sum, p) => sum + p.invested, 0);
        const value = positions.reduce((sum, p) => sum + p.currentValue, 0);
        const pnl = value - invested;
        return { invested, value, pnl };
    }, [positions]);

    if (authLoading || (user && loading && positions.length === 0)) {
        return (
            <main className="min-h-screen bg-white dark:bg-zinc-950 pt-32 flex flex-col items-center">
                <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 font-medium">Loading your profile...</p>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-white dark:bg-zinc-950">
                <Header />
                <div className="max-w-7xl mx-auto px-6 pt-32 text-center">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-6">
                        <Wallet className="h-10 w-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 dark:text-white">Connect to view Profile</h2>
                    <p className="text-zinc-500 max-w-md mx-auto mb-8">
                        Sign in with Google or your wallet to track your predictions and performance.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-50/50 dark:bg-black">
            <Header />

            <div className="max-w-[1280px] mx-auto px-4 lg:px-6 pt-24 pb-12">

                {/* Profile Grid - Match Polymarket Design */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

                    {/* User Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-5">
                                <div
                                    className="h-20 w-20 rounded-full shadow-inner ring-4 ring-white dark:ring-zinc-900"
                                    style={{ background: generateAvatarGradient(user.address) }}
                                ></div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1 className="text-2xl font-bold dark:text-white">
                                            {user.username || "User"}
                                        </h1>
                                        <div className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                            Connect <Share2 size={10} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                                            <Calendar size={14} /> Joined Jan 2026
                                        </p>
                                        <p className="text-sm text-zinc-500">
                                            0 views
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
                                    <Edit2 size={18} />
                                </button>
                                <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8 mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                            <div>
                                <p className="text-xs text-zinc-400 mb-1 uppercase tracking-tight font-medium">Positions Value</p>
                                <p className="text-xl font-bold dark:text-white">${stats.value.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-400 mb-1 uppercase tracking-tight font-medium">Biggest Win</p>
                                <p className="text-xl font-bold dark:text-white">—</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-400 mb-1 uppercase tracking-tight font-medium">Predictions</p>
                                <p className="text-xl font-bold dark:text-white">{positions.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Chart Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm overflow-hidden flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp size={16} className="text-green-500" />
                                    <span className="text-xs font-semibold text-green-500 uppercase">Profit/Loss</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-3xl font-bold dark:text-white">${Math.abs(stats.pnl).toFixed(2)}</h2>
                                    <span className={`text-sm font-semibold ${stats.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {stats.pnl >= 0 ? '+' : '-'}{stats.pnl >= 0 ? '0.00' : '0.00'}%
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 mt-1">Past Month</p>
                            </div>
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                                {['1D', '1W', '1M', 'ALL'].map((tf) => (
                                    <button
                                        key={tf}
                                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${tf === '1M' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600' : 'text-zinc-500 hover:text-zinc-800'}`}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-32 w-full mt-auto">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={pnlChartData}>
                                    <defs>
                                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="pnl"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPnL)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="border-b border-zinc-200 dark:border-zinc-800 mb-6">
                    <div className="flex gap-8">
                        {['positions', 'activity'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-4 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? "text-blue-600" : "text-zinc-500 hover:text-zinc-800"
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'positions' && (
                    <div className="space-y-6">
                        {/* Sub-tabs & Search */}
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 w-full md:w-auto">
                                <button
                                    onClick={() => setPositionFilter("active")}
                                    className={`flex-1 md:w-24 py-2 text-xs font-bold rounded-md transition-all ${positionFilter === 'active' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => setPositionFilter("closed")}
                                    className={`flex-1 md:w-24 py-2 text-xs font-bold rounded-md transition-all ${positionFilter === 'closed' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
                                >
                                    Closed
                                </button>
                            </div>

                            <div className="flex gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search positions"
                                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                    <Filter size={16} /> Value
                                </button>
                            </div>
                        </div>

                        {/* Positions Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={positionFilter}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {positionFilter === 'active' && positions.length > 0 ? (
                                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                    <th className="px-6 py-4">Market</th>
                                                    <th className="px-6 py-4">Avg</th>
                                                    <th className="px-6 py-4">Current</th>
                                                    <th className="px-6 py-4 text-right">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                {positions.map((p) => (
                                                    <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold dark:text-white mb-1 leading-tight">{p.marketQuestion}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${p.outcome === 'YES' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                        {p.outcome}
                                                                    </span>
                                                                    <span className="text-xs text-zinc-400">{p.shares.toLocaleString()} shares</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="text-sm font-medium dark:text-white">{(p.avgPrice * 100).toFixed(1)}¢</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="text-sm font-medium dark:text-white">{(p.currentPrice * 100).toFixed(1)}¢</span>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-sm font-bold dark:text-white">${p.currentValue.toFixed(2)}</span>
                                                                <span className={`text-[10px] font-bold ${p.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                    {p.pnl >= 0 ? '+' : ''}${p.pnl.toFixed(2)} ({p.pnlPercent.toFixed(1)}%)
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="pr-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleClaim(p)}
                                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold"
                                                                    title="Claim winnings"
                                                                >
                                                                    Claim
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSell(p)}
                                                                    disabled={sellingId === p.id}
                                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                                                                >
                                                                    {sellingId === p.id ? 'Selling...' : 'Sell'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon="portfolio"
                                        title={positionFilter === 'active' ? "No active positions" : "No closed positions"}
                                        description="Predictions you make will appear here."
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <EmptyState
                        icon="activity"
                        title="No activity found"
                        description="Your trade history will appear here."
                    />
                )}
            </div>
        </main>
    );
}
