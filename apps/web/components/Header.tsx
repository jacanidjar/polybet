"use client";
import Link from "next/link";
import { ConnectWallet } from "./ConnectWallet";
import { MobileMenu } from "./MobileMenu";
import { Search, Moon, Sun, Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import { useAccount } from 'wagmi';
import { useUSDCBalance, useMintUSDC } from '@/hooks/useContracts';
import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";

export const Header = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { address } = useAccount();
    const { mint, isPending } = useMintUSDC();

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Live Search Logic
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]); // Any for market type
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setIsSearching(true);
                setShowResults(true);
                try {
                    const res = await fetch(`http://localhost:3001/markets?search=${encodeURIComponent(searchQuery)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300); // 300ms Debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleDeposit = async () => {
        if (!address) {
            toast.error("Connect wallet first!");
            return;
        }
        try {
            await mint(address, BigInt(1000000000)); // 1000 USDC (6 decimals)
            toast.success("Minted 1,000 USDC! 💰");
            // Assuming balance refetches automatically via wagmi hooks
            // But if we want explicit refetch, we need to pass a refetch function or rely on automatic SWR
        } catch (e) {
            console.error(e);
            toast.error("Failed to deposit");
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 h-16">
                {/* 1. Left: Logo + Search */}
                <div className="flex items-center gap-8 w-1/2">
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 group-hover:scale-105 transition-transform">
                            <span className="text-lg font-bold text-white">P</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white hidden sm:block">
                            Polybet
                        </span>
                    </Link>

                    {/* Search Bar - Live Dropdown */}
                    <div className="relative w-full max-w-md hidden md:block group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search markets"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => { if (searchQuery) setShowResults(true); }}
                            className="w-full h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none py-2 pl-10 pr-4 text-sm outline-none placeholder:text-zinc-500 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setShowResults(false);
                                    window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
                                }
                            }}
                        />

                        {/* Live Results Dropdown */}
                        {showResults && searchQuery && (
                            <div className="absolute top-12 left-0 right-0 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50">
                                <div className="p-2">
                                    <div className="flex gap-2 mb-2 pb-2 border-b border-zinc-100 dark:border-zinc-800 px-2">
                                        <span className="text-xs font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">Markets</span>
                                        <span className="text-xs font-bold text-zinc-400 px-2 py-0.5 rounded cursor-not-allowed">Profiles</span>
                                    </div>

                                    {isSearching ? (
                                        <div className="p-4 text-center text-zinc-400 text-xs">Searching...</div>
                                    ) : results.length > 0 ? (
                                        <div className="flex flex-col">
                                            {results.slice(0, 5).map((market) => (
                                                <Link
                                                    key={market.id}
                                                    href={`/markets/${market.slug || market.id}`} // Use slug if available
                                                    // Checking page.tsx... MarketCard usually has link.
                                                    // Let's assume /market/[id] or /?marketId=...
                                                    // safely use /?search for "See all" but for item click?
                                                    // Let's send to /?search=exact for now or assume /market/id if it existed.
                                                    // ACTUALLY, usually market card opens a modal or new page.
                                                    // Let's use a standard link style.
                                                    onClick={() => setShowResults(false)}
                                                    className="flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg group/item transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        {market.image ? (
                                                            <img src={market.image} className="w-8 h-8 rounded-md object-cover" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                                                                🎲
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col truncate">
                                                            <span className="text-sm font-medium text-zinc-900 dark:text-white truncate group-hover/item:text-blue-600 transition-colors">
                                                                {market.question}
                                                            </span>
                                                            <span className="text-xs text-zinc-500">
                                                                {market.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-blue-600">
                                                        {market.chance}%
                                                    </span>
                                                </Link>
                                            ))}
                                            <Link
                                                href={`/?search=${encodeURIComponent(searchQuery)}`}
                                                onClick={() => setShowResults(false)}
                                                className="mt-2 block p-2 text-center text-xs font-bold text-blue-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors border-t border-zinc-100 dark:border-zinc-800"
                                            >
                                                See all results ➝
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-zinc-400 text-xs">No markets found.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Right: Stats + Deposit + Profile */}
                <div className="flex items-center justify-end gap-6 w-1/2">

                    {mounted && <HeaderStats />}

                    <button
                        onClick={handleDeposit}
                        disabled={isPending}
                        className="hidden sm:block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm active:scale-[0.98] disabled:opacity-50"
                    >
                        {isPending ? 'Minting...' : 'Deposit'}
                    </button>

                    <nav className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        )}
                        <ConnectWallet />
                        <MobileMenu />
                    </nav>
                </div>
            </div>
        </header>
    );
};

const HeaderStats = () => {
    const { address, isConnected } = useAccount();
    const { balance, isLoading } = useUSDCBalance(address);
    const [portfolioValue, setPortfolioValue] = useState(0);

    // Fetch Portfolio Value
    useEffect(() => {
        if (!address) return;
        const fetchValue = async () => {
            try {
                const res = await fetch(`http://localhost:3001/users/${address}/portfolio`);
                if (res.ok) {
                    const data = await res.json();
                    // Calc total value
                    const total = data.positions.reduce((acc: number, p: any) => {
                        const marketChance = p.market?.chance || 50;
                        const price = p.outcome === 'YES' ? marketChance / 100 : 1 - (marketChance / 100);
                        return acc + (Number(p.shares) * price);
                    }, 0);
                    setPortfolioValue(total);
                }
            } catch (e) {
                console.error("Failed to fetch header stats", e);
            }
        };
        fetchValue();
        // Poll every 10s for updates
        const interval = setInterval(fetchValue, 10000);
        return () => clearInterval(interval);
    }, [address]);

    const cash = Number(balance) / 1000000;

    if (!isConnected) return null;

    return (
        <div className="hidden lg:flex items-center gap-6 mr-2">
            {/* Portfolio Value - Clickable to go to /portfolio */}
            <Link href="/portfolio" className="flex flex-col items-end hover:opacity-70 transition-opacity cursor-pointer text-right group">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider group-hover:text-blue-500 transition-colors">Portfolio</span>
                <span className="text-sm font-bold text-green-500 font-mono">
                    ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </Link>

            {/* Cash Balance */}
            <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Cash</span>
                <span className="text-sm font-bold text-green-500 font-mono">
                    {isLoading ? '...' : `$${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
            </div>
        </div>
    );
};
