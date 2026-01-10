"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Menu as MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 text-neutral-700 dark:text-neutral-300"
            >
                <MenuIcon className="h-6 w-6" />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide Menu */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-64 bg-white dark:bg-zinc-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-zinc-800">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">
                        Menu
                    </span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-neutral-700 dark:text-neutral-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col p-4 space-y-2">
                    <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        Markets
                    </Link>
                    <Link
                        href="/portfolio"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        Portfolio
                    </Link>
                    <Link
                        href="/activity"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        Activity
                    </Link>
                    <Link
                        href="/leaderboard"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        Leaderboard
                    </Link>
                </nav>
            </div>
        </>
    );
};
