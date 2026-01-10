
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/EmptyState";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { toast } from '@/lib/toast';

interface Position {
    id: number;
    marketId: number;
    marketQuestion: string;
    outcome: "YES" | "NO"; // API returns uppercase
    shares: number;
    avgPrice: number;
    currentPrice: number;
    invested: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
}

export default function PortfolioPage() {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<"open" | "closed" | "history">("open");
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [sellingId, setSellingId] = useState<number | null>(null);

    const fetchPortfolio = async () => {
        if (!user?.address) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/users/${user.address}`);
            if (!res.ok) throw new Error("Failed to fetch user data");
            const userData = await res.json();

            const mappedPositions = userData.positions.map((p: any) => {
                const avgPrice = p.avgPrice;
                const shares = Number(p.shares);

                // Use Market Chance if available (mocked on backend or passed)
                // Fallback to p.market.chance or calculate from yes/no price
                const marketChance = p.market?.chance || 50;

                // If outcome is YES, price is chance/100. If NO, price is 1 - (chance/100)
                const currentPrice = p.outcome === 'YES'
                    ? marketChance / 100
                    : 1 - (marketChance / 100);

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
            // Don't show error toast on initial load to avoid spam
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, [user?.address]);

    const handleSell = async (position: Position) => {
        if (!user) return;
        if (confirm(`Are you sure you want to sell your entire position in "${position.marketQuestion}"?`) === false) return;

        setSellingId(position.id);
        try {
            // Sell full amount (shares). Backend expects amount in $, but logic might differ. 
            // Checking backend: Backend logic for SELL uses amount as "shares" logic? 
            // Wait, Backend Code: 
            // const amountDecimal = dto.amount; (This is usually $ value)
            // const shares = dto.amount / dto.price;
            // IF Type SELL: const newShares = existing.shares - shares;

            // To sell ALL shares, we need to pass an amount $ that equates to the shares.
            // Amount = Shares * Price.
            // We'll sell at the CURRENT market price.

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
                    amount: sellAmount, // This determines how many shares: sellAmount / sellPrice = shares
                    price: sellPrice
                })
            });

            if (!res.ok) throw new Error("Failed to sell position");

            toast.success("Position sold successfully!");
            fetchPortfolio(); // Refresh
        } catch (error) {
            console.error("Sell error:", error);
            toast.error("Failed to sell position");
        } finally {
            setSellingId(null);
        }
    };

    const totalInvested = positions.reduce((sum, p) => sum + p.invested, 0);
    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const totalPnL = totalValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    if (authLoading || (user && loading && positions.length === 0)) {
        return (
            <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950 pt-20 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
                <Header />
                <div className="max-w-7xl mx-auto p-12 text-center">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Connect wallet to view portfolio</h2>
                    <p className="text-gray-500">Please connect your wallet using the button in the header.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
            <Header />

            <div className="max-w-7xl mx-auto p-6 lg:p-12">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                        Portfolio
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Track your positions and performance
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="rounded-lg bg-blue-500/10 p-2">
                                <Wallet className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Total Invested
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                            ${totalInvested.toFixed(2)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="rounded-lg bg-purple-500/10 p-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Current Value
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                            ${totalValue.toFixed(2)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`rounded-lg p-2 ${totalPnL >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                {totalPnL >= 0 ? (
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Total P&L
                            </span>
                        </div>
                        <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                            <span className="text-sm ml-2">
                                ({totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
                            </span>
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="rounded-xl border border-neutral-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                    <div className="flex border-b border-neutral-200 dark:border-zinc-800">
                        <button
                            onClick={() => setActiveTab("open")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "open"
                                ? "bg-neutral-50 dark:bg-zinc-800 text-neutral-900 dark:text-white border-b-2 border-blue-600"
                                : "text-gray-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white"
                                }`}
                        >
                            Open Positions ({positions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("closed")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "closed"
                                ? "bg-neutral-50 dark:bg-zinc-800 text-neutral-900 dark:text-white border-b-2 border-blue-600"
                                : "text-gray-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white"
                                }`}
                        >
                            Closed (0)
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "history"
                                ? "bg-neutral-50 dark:bg-zinc-800 text-neutral-900 dark:text-white border-b-2 border-blue-600"
                                : "text-gray-500 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white"
                                }`}
                        >
                            History
                        </button>
                    </div>

                    {/* Positions List */}
                    <div className="p-6">
                        {activeTab === "open" && (
                            <div className="space-y-4">
                                {positions.length > 0 ? (
                                    positions.map((position) => (
                                        <div
                                            key={position.id}
                                            className="rounded-lg border border-neutral-200 dark:border-zinc-800 p-4 hover:border-blue-500/50 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                                                        {position.marketQuestion}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${position.outcome === 'YES'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}>
                                                            {position.outcome}
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {position.shares.toFixed(2)} shares @ {(position.avgPrice * 100).toFixed(1)}¢
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleSell(position)}
                                                    disabled={sellingId === position.id}
                                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-all disabled:opacity-50"
                                                >
                                                    {sellingId === position.id ? 'Selling...' : 'Sell Position'}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-neutral-100 dark:border-zinc-800">
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Invested</p>
                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                        ${position.invested.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Value</p>
                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                        ${position.currentValue.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">P&L</p>
                                                    <p className={`text-sm font-semibold ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ROI</p>
                                                    <p className={`text-sm font-semibold ${position.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState
                                        icon="portfolio"
                                        title="No positions found"
                                        description="You don't have any open positions yet."
                                    />
                                )}
                            </div>
                        )}

                        {activeTab === "closed" && (
                            <EmptyState
                                icon="portfolio"
                                title="No Closed Positions"
                                description="You haven't closed any positions yet. Your closed positions will appear here."
                            />
                        )}

                        {activeTab === "history" && (
                            <EmptyState
                                icon="activity"
                                title="No Transaction History"
                                description="Your trading history will appear here once you start making trades."
                            />
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
