"use client";
import Link from "next/link";
import { ConnectWallet } from "./ConnectWallet";
import { MobileMenu } from "./MobileMenu";
import { Search, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const Header = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-14">
                {/* 1. Logo (Left) */}
                <div className="flex items-center gap-4 w-1/4">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 group-hover:scale-105 transition-transform">
                            <span className="text-lg font-bold text-white">P</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white hidden sm:block">
                            Polybet
                        </span>
                    </Link>
                </div>

                {/* 2. Search Bar (Center) - Polymarket Style */}
                <div className="flex-1 max-w-2xl px-4 hidden md:block">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search markets"
                            className="w-full h-10 rounded-lg border border-neutral-200 bg-neutral-100 py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-gray-500 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* 3. Actions (Right) */}
                <div className="flex items-center justify-end gap-3 w-1/4">
                    <nav className="hidden lg:flex items-center gap-4 mr-2">
                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 text-gray-500 hover:text-neutral-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        )}

                        <Link
                            href="/portfolio"
                            className="text-sm font-medium text-gray-600 hover:text-neutral-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                        >
                            Portfolio
                        </Link>
                    </nav>

                    <ConnectWallet />
                    <MobileMenu />
                </div>
            </div>
        </header>
    );
};
