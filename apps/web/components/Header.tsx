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

                    {/* Search Bar - Proximal to Logo */}
                    <div className="relative w-full max-w-md hidden md:block">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search markets"
                            className="w-full h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none py-2 pl-10 pr-4 text-sm outline-none placeholder:text-zinc-500 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
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
