
"use client";

import { useState, useEffect, useMemo } from "react";
import { type Address } from 'viem';
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";
import { TrendingUp, TrendingDown, Wallet, Search, Filter, ExternalLink, Calendar, Edit2, Share2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from '@/lib/toast';
import { useSellShares, useUSDCBalance, useClaimWinnings, useResolveMarket } from '@/hooks/useContracts';
import { usePublicClient } from 'wagmi';
import PolybetMarketABI from '@/lib/contracts/PolybetMarket.json';
import CONTRACT_CONFIG from '@/lib/contracts-config.json';

const MARKET_ADDRESS = CONTRACT_CONFIG.MARKET_ADDRESS;
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
    marketResolved: boolean;
    marketWinner: string | null;
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

import { ActionModal } from "@/components/ActionModal";

export default function PortfolioPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<"positions" | "activity">("positions");
    const [positionFilter, setPositionFilter] = useState<"active" | "closed">("active");
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [sellingId, setSellingId] = useState<number | null>(null);
    const [trades, setTrades] = useState<any[]>([]);
    const [activityFilter, setActivityFilter] = useState<'ALL' | 'BETS' | 'TRANSFERS'>('ALL');

    // Modal States
    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [resolveModalOpen, setResolveModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [resolutionOutcome, setResolutionOutcome] = useState<'YES' | 'NO'>('YES');

    // Real P&L Chart Data
    const pnlChartData = useMemo(() => {
        if (!trades.length) return [];

        // Sort trades by date ascending
        const sorted = [...trades].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        // Cumulative PnL logic: Realized PnL over time
        let runningPnL = 0;
        const dataPoints: any[] = [];

        sorted.forEach(t => {
            // Metric: "Net Cash Flow" (Invested vs Returned)
            // Buy = -Cost (Cash Out)
            // Sell/Claim = +Revenue (Cash In)
            // This tracks the cumulative realized cash flow of the portfolio.

            const amount = t.amount; // Dollar value

            if (t.type === 'SELL' || t.type === 'CLAIM') {
                runningPnL += amount;
            } else if (t.type === 'BUY') {
                runningPnL -= amount;
            }

            dataPoints.push({
                date: new Date(t.createdAt).toLocaleDateString(),
                pnl: runningPnL,
                fullDate: t.createdAt
            });
        });

        // Downsample if too many points?
        return dataPoints;
    }, [trades]);

    const fetchPortfolio = async () => {
        if (!user?.address && !user?.id) return;
        setLoading(true);
        try {
            // Fetch User Portfolio
            const res = await fetch(`http://localhost:3001/users/${user.address || user.id}/portfolio`);
            const userData = await res.json();

            // Fetch User Trades (History)
            const userId = userData.id || user.id;
            const tradesRes = await fetch(`http://localhost:3001/trades?userId=${userId}`);
            const tradesData = await tradesRes.json();
            setTrades(tradesData);

            // First map to raw objects
            const rawPositions = userData.positions.map((p: any) => {
                const avgPrice = p.avgPrice;
                const shares = Number(p.shares);

                let currentPrice;
                if (p.market?.resolved && p.market?.outcome) {
                    // If resolved, price is 0 (Lost) or 1 (Won)
                    currentPrice = p.market.outcome === p.outcome ? 1 : 0;
                } else {
                    // If active, use market chance
                    const marketChance = p.market?.chance || 50;
                    currentPrice = p.outcome === 'YES' ? marketChance / 100 : 1 - (marketChance / 100);
                }

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
                    pnlPercent,
                    marketResolved: p.market?.resolved || false,
                    marketWinner: p.market?.outcome || null
                };
            });

            // Group and Merge duplicates
            const mergedMap = new Map();

            rawPositions.forEach((pos: any) => {
                const key = `${pos.marketId}-${pos.outcome}`;
                if (mergedMap.has(key)) {
                    const existing = mergedMap.get(key);
                    // Merge logic: Average Price weighted by shares? 
                    // Simplified: Total Invested / Total Shares = New Avg Price
                    const totalShares = existing.shares + pos.shares;
                    const totalInvested = existing.invested + pos.invested;
                    const newAvgPrice = totalShares > 0 ? totalInvested / totalShares : 0;

                    existing.shares = totalShares;
                    existing.invested = totalInvested;
                    existing.currentValue = existing.currentValue + pos.currentValue;
                    existing.avgPrice = newAvgPrice;
                    existing.pnl = existing.currentValue - existing.invested;
                    existing.pnlPercent = existing.invested > 0 ? (existing.pnl / existing.invested) * 100 : 0;
                } else {
                    mergedMap.set(key, pos);
                }
            });

            setPositions(Array.from(mergedMap.values()));
        } catch (error) {
            console.error("Error loading portfolio:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();

        // Live Updates Polling (every 10 seconds)
        const interval = setInterval(() => {
            if (!document.hidden && !sellModalOpen && !resolveModalOpen) {
                fetchPortfolio();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [user?.address, sellModalOpen, resolveModalOpen]);

    // ... helper ...
    const LiveBadge = () => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider border border-green-200 dark:border-green-800">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
        </span>
    );
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const exportToCSV = () => {
        if (!positions.length) return;

        const headers = ["Market", "Outcome", "Shares", "Avg Price", "Current Price", "Invested", "Current Value", "PnL", "PnL %"];
        const rows = positions.map(p => [
            `"${p.marketQuestion}"`,
            p.outcome,
            p.shares,
            p.avgPrice.toFixed(4),
            p.currentPrice.toFixed(4),
            p.invested.toFixed(2),
            p.currentValue.toFixed(2),
            p.pnl.toFixed(2),
            p.pnlPercent.toFixed(2)
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `polybet_portfolio_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const paginatedPositions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return positions.slice(start, start + ITEMS_PER_PAGE);
    }, [positions, currentPage]);

    const totalPages = Math.ceil(positions.length / ITEMS_PER_PAGE);

    const { sell } = useSellShares();
    const { claim } = useClaimWinnings();
    const { resolve } = useResolveMarket();
    const { refetch: refetchBalance } = useUSDCBalance(user?.address as Address);

    const handleShare = async () => {
        if (!stats) return;

        const shareText = `🚀 My Polybet Portfolio:\n\n💰 Value: $${stats.value.toFixed(2)}\n📈 Invested: $${stats.invested.toFixed(2)}\n🏆 Biggest Win: $${stats.biggestWin.toFixed(2)}\n\nJoin the action at polybet.app!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Polybet Portfolio',
                    text: shareText,
                    url: 'https://polybet.app'
                });
            } catch (err) {
                console.error('Share failed', err);
            }
        } else {
            navigator.clipboard.writeText(shareText);
            toast.success("Portfolio stats copied to clipboard! 📋");
        }
    };

    const handleClaim = async (position: Position) => {
        if (!user || !user.address) return;
        try {
            const outcomeIndex = position.outcome === 'YES' ? 1 : 2; // Logic: 1=YES, 2=NO

            // 0. Pre-flight Check
            const sharesOnChain = await publicClient?.readContract({
                address: MARKET_ADDRESS as Address,
                abi: PolybetMarketABI,
                functionName: 'positions',
                args: [BigInt(position.marketId), user.address as Address, outcomeIndex]
            }) as bigint;

            if (sharesOnChain === BigInt(0)) {
                toast("Already claimed on-chain! Syncing... 🔄", { icon: '⚠️' });

                // Force Sync Backend
                await fetch('http://localhost:3001/trades', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userAddress: user.address,
                        marketId: position.marketId,
                        type: 'CLAIM',
                        outcome: position.outcome,
                        amount: 0,
                        price: 1
                    })
                });

                refetchBalance();
                setTimeout(() => fetchPortfolio(), 1000);
                return; // Stop here!
            }

            // 1. Claim on blockchain
            await claimWinnings(position.marketId, outcomeIndex);

            // 2. Sync Backend: Create a CLAIM trade (which removes the position)
            const claimAmount = position.shares * 1.00; // Always $1.00 per share on win

            await fetch('http://localhost:3001/trades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    marketId: position.marketId,
                    type: 'CLAIM',
                    outcome: position.outcome,
                    amount: claimAmount,
                    price: 1.00
                })
            });

            toast.success(`Claimed $${claimAmount.toFixed(2)}!`);
            fetchPortfolio();
            refetchBalance(); // Update user wallet balance
        } catch (error) {
            console.error(error);
            toast.error("Failed to claim winnings");
        }
    };

    // --- Actions Triggered by Modal ---
    const executeSell = async () => {
        if (!user || !user.address || !selectedPosition) return;

        const position = selectedPosition;
        setSellModalOpen(false); // Close UI immediately
        setSellingId(position.id); // Show loading state on row

        try {
            const outcomeIndex = position.outcome === 'YES' ? 1 : 2;

            // 0. Pre-flight Check
            const sharesOnChain = await publicClient?.readContract({
                address: MARKET_ADDRESS as Address,
                abi: PolybetMarketABI,
                functionName: 'positions',
                args: [BigInt(position.marketId), user.address as Address, outcomeIndex]
            }) as bigint;

            if (sharesOnChain === BigInt(0)) {
                toast("Already sold on-chain! Syncing... 🔄", { icon: '⚠️' });
                // Force Sync Backend
                await fetch('http://localhost:3001/trades', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userAddress: user.address,
                        marketId: position.marketId,
                        type: 'CLAIM',
                        outcome: position.outcome,
                        amount: 0,
                        price: 1
                    })
                });
                refetchBalance();
                setTimeout(() => fetchPortfolio(), 1000);
                return;
            }

            // 1. Sell on Blockchain
            const sharesBigInt = BigInt(Math.floor(position.shares * 1e18));
            await sell(position.marketId, outcomeIndex, sharesBigInt);

            // 2. Record indexer update
            const sellPrice = position.currentPrice;
            const sellAmount = position.shares * sellPrice;

            await fetch('http://localhost:3001/trades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    marketId: position.marketId,
                    type: 'SELL',
                    outcome: position.outcome,
                    amount: sellAmount,
                    price: sellPrice,
                })
            });

            toast.success(`Sold shares for $${sellAmount.toFixed(2)}`);
            fetchPortfolio();
            refetchBalance();
        } catch (error) {
            console.error(error);
            toast.error("Failed to sell shares");
        } finally {
            setSellingId(null);
            setSelectedPosition(null);
        }
    };

    const executeResolve = async () => {
        if (!selectedPosition) return;
        setResolveModalOpen(false);

        const position = selectedPosition;
        const winner = resolutionOutcome; // From State

        try {
            const outcomeIndex = position.outcome === 'YES' ? 1 : 2;

            // 0. Pre-flight Check
            const marketData = await publicClient?.readContract({
                address: MARKET_ADDRESS as Address,
                abi: PolybetMarketABI,
                functionName: 'markets',
                args: [BigInt(position.marketId)]
            }) as any;

            if (marketData && marketData.resolved) {
                toast("Market already resolved on-chain! Syncing... 🔄", { icon: '⚠️' });
                await fetch(`http://localhost:3001/markets/${position.marketId}/resolve`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resolved: true, winner: marketData.winner === 1 ? 'YES' : 'NO' })
                });
                fetchPortfolio();
                return;
            }

            // 1. Resolve on Blockchain
            // Winner: 1 for YES, 2 for NO
            await resolve(position.marketId, winner === 'YES' ? 1 : 2);

            // 2. Sync Backend
            await fetch(`http://localhost:3001/markets/${position.marketId}/resolve`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resolved: true, winner })
            });

            toast.success(`Market resolved to ${winner}!`);
            fetchPortfolio();
        } catch (error) {
            console.error(error);
            toast.error("Failed to resolve market");
        } finally {
            setSelectedPosition(null);
        }
    };

    // UI Trigger Handlers
    const openSellModal = (p: Position) => {
        setSelectedPosition(p);
        setSellModalOpen(true);
    };

    const openResolveModal = (p: Position) => {
        setSelectedPosition(p);
        setResolutionOutcome('YES'); // default
        setResolveModalOpen(true);
    };

    const stats = useMemo(() => {
        const invested = positions.reduce((sum, p) => sum + p.invested, 0);
        const value = positions.reduce((sum, p) => sum + p.currentValue, 0);
        const pnl = value - invested;

        // Advanced Stats
        const biggestWin = trades
            .filter(t => t.type === 'CLAIM')
            // Handle potential missing amount with fallback
            .reduce((max, t) => Math.max(max, t.amount || 0), 0);

        const uniqueMarkets = new Set(trades.map(t => t.marketId)).size;
        const totalPredictions = uniqueMarkets || positions.length;

        return { invested, value, pnl, biggestWin, totalPredictions };
    }, [positions, trades]);

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
                                        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                                            {user.username || "User"}
                                            <LiveBadge />
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
                                <button
                                    onClick={exportToCSV}
                                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                                    title="Export to CSV"
                                >
                                    <Download size={18} />
                                </button>
                                <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
                                    title="Share Portfolio"
                                >
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
                                <p className="text-xl font-bold dark:text-white text-green-500">${stats.biggestWin.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-400 mb-1 uppercase tracking-tight font-medium">Predictions</p>
                                <p className="text-xl font-bold dark:text-white">{stats.totalPredictions}</p>
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
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                                        <th className="px-6 py-4">Market</th>
                                                        <th className="px-6 py-4">Avg</th>
                                                        <th className="px-6 py-4">Current</th>
                                                        <th className="px-6 py-4 text-right">Value</th>
                                                        <th className="px-6 py-4 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                                    {paginatedPositions.map((p) => (
                                                        <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                                                            <td className="px-6 py-5 min-w-[300px]">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold dark:text-white mb-1 leading-tight line-clamp-2">{p.marketQuestion}</span>
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
                                                            <td className="pr-6 py-5 text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    {p.marketResolved ? (
                                                                        <>
                                                                            {p.marketWinner === p.outcome ? (
                                                                                <button
                                                                                    onClick={() => handleClaim(p)}
                                                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold shadow-sm animate-pulse"
                                                                                    title="Market resolved in your favor! Claim winnings."
                                                                                >
                                                                                    Claim Winnings 🏆
                                                                                </button>
                                                                            ) : (
                                                                                <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700 cursor-not-allowed">
                                                                                    ❌ Lost
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {/* Active Market Actions */}
                                                                            <button
                                                                                onClick={() => openResolveModal(p)}
                                                                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold"
                                                                                title="Debug: Resolve Market to YES"
                                                                            >
                                                                                Resolve
                                                                            </button>
                                                                            <button
                                                                                onClick={() => openSellModal(p)}
                                                                                disabled={sellingId === p.id}
                                                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                                                                            >
                                                                                {sellingId === p.id ? 'Selling...' : 'Sell'}
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/20 px-6 py-4 flex items-center justify-between">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ChevronLeft size={16} className="text-zinc-600 dark:text-zinc-400" />
                                                </button>
                                                <span className="text-sm font-medium text-zinc-500">
                                                    Page {currentPage} of {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ChevronRight size={16} className="text-zinc-600 dark:text-zinc-400" />
                                                </button>
                                            </div>
                                        )}
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
                    <div className="space-y-6">
                        {/* Activity Filters */}
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 w-fit">
                            {(['ALL', 'BETS', 'TRANSFERS'] as const).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActivityFilter(filter)}
                                    className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activityFilter === filter ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
                                >
                                    {filter === 'BETS' ? 'Bets' : filter === 'TRANSFERS' ? 'Transfers' : 'All'}
                                </button>
                            ))}
                        </div>

                        {/* Activity List */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                                            <th className="px-6 py-4">Action</th>
                                            <th className="px-6 py-4">Market</th>
                                            <th className="px-6 py-4">Outcome</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                            <th className="px-6 py-4 text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {trades
                                            .filter(t => activityFilter === 'ALL' || (activityFilter === 'BETS' ? ['BUY', 'SELL', 'CLAIM'].includes(t.type) : false))
                                            .map((t) => (
                                                <tr key={t.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs font-bold px-2 py-1 rounded ${t.type === 'BUY' ? 'bg-green-100 text-green-700' :
                                                            t.type === 'SELL' ? 'bg-blue-100 text-blue-700' :
                                                                t.type === 'CLAIM' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {t.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm dark:text-white line-clamp-1 max-w-[200px]">
                                                        {t.market?.question || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-zinc-500">
                                                        {t.outcome}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-mono dark:text-white">
                                                        ${(t.amount || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-xs text-zinc-400">
                                                        {new Date(t.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        {trades.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                                    No activity found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- Modals --- */}

            {/* Sell Confirmation Modal */}
            <ActionModal
                isOpen={sellModalOpen}
                onClose={() => setSellModalOpen(false)}
                title="Confirm Sell"
                confirmText="Sell Now"
                onConfirm={executeSell}
                isDestructive={true}
            >
                {selectedPosition && (
                    <div className="space-y-3">
                        <p>Are you sure you want to sell your position?</p>
                        <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm font-medium dark:text-white">{selectedPosition.marketQuestion}</p>
                            <div className="flex justify-between mt-2 text-sm text-zinc-500">
                                <span>Shares: {selectedPosition.shares}</span>
                                <span>Price: ${(selectedPosition.currentPrice * 100).toFixed(0)}¢</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-bold dark:text-white">
                                <span>Total Return:</span>
                                <span>${selectedPosition.currentValue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </ActionModal>

            {/* Resolve Market Modal (Debug/Admin) */}
            <ActionModal
                isOpen={resolveModalOpen}
                onClose={() => setResolveModalOpen(false)}
                title="Resolve Market"
                confirmText="Resolve Market"
                onConfirm={executeResolve}
            >
                {selectedPosition && (
                    <div className="space-y-4">
                        <p>Who won this market?</p>
                        <p className="text-sm font-medium dark:text-white p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                            {selectedPosition.marketQuestion}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setResolutionOutcome('YES')}
                                className={`p-4 rounded-xl border-2 font-bold transition-all ${resolutionOutcome === 'YES'
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-zinc-200 text-zinc-400 hover:border-zinc-300'
                                    }`}
                            >
                                YES 🏆
                            </button>
                            <button
                                onClick={() => setResolutionOutcome('NO')}
                                className={`p-4 rounded-xl border-2 font-bold transition-all ${resolutionOutcome === 'NO'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-zinc-200 text-zinc-400 hover:border-zinc-300'
                                    }`}
                            >
                                NO ❌
                            </button>
                        </div>
                        <p className="text-xs text-zinc-400 text-center">
                            This will payout all winners and close the market.
                        </p>
                    </div>
                )}
            </ActionModal>

            {/* Position Details Modal */}
            <ActionModal
                isOpen={!!selectedPosition && !sellModalOpen && !resolveModalOpen}
                onClose={() => setSelectedPosition(null)}
                title="Position History"
                confirmText="Close"
                onConfirm={() => setSelectedPosition(null)}
                isDestructive={false}
            >
                {selectedPosition && (
                    <div className="space-y-4">
                        <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 mb-4">
                            <h4 className="text-sm font-bold dark:text-white mb-1">{selectedPosition.marketQuestion}</h4>
                            <div className="flex justify-between text-xs text-zinc-500">
                                <span>Outcome: <span className="font-bold">{selectedPosition.outcome}</span></span>
                                <span>Current Shares: {selectedPosition.shares}</span>
                            </div>
                        </div>

                        <h5 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Recent Trades</h5>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                            {trades
                                .filter(t => t.marketId === selectedPosition.marketId && t.outcome === selectedPosition.outcome)
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((t) => (
                                    <div key={t.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-xs ${t.type === 'BUY' ? 'text-green-600' : 'text-blue-600'}`}>{t.type}</span>
                                            <span className="text-xs text-zinc-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono dark:text-white">${(t.amount || 0).toFixed(2)}</div>
                                            <div className="text-[10px] text-zinc-400">@ ${(t.price * 100).toFixed(0)}¢</div>
                                        </div>
                                    </div>
                                ))}
                            {trades.filter(t => t.marketId === selectedPosition.marketId).length === 0 && (
                                <p className="text-center text-zinc-400 text-xs py-4">No history found.</p>
                            )}
                        </div>
                    </div>
                )}
            </ActionModal>

        </main>
    );
}
