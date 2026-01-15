"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
    Settings,
    Trophy,
    Coins,
    Plug,
    Hammer,
    Moon,
    Sun,
    LogOut,
    ChevronUp,
    ChevronDown,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateAvatarGradient } from "@/lib/avatar";

interface UserMenuProps {
    user: {
        address: string;
        username?: string;
    };
    logout: () => void;
}

export const UserMenu = ({ user, logout }: UserMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full p-1 pl-1 pr-3 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
            >
                <div
                    className="h-8 w-8 rounded-full shadow-sm ring-2 ring-white dark:ring-zinc-900"
                    style={{ background: generateAvatarGradient(user.address) }}
                />
                <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-12 w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* User Header */}
                    <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                        <Link
                            href="/portfolio"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 hover:opacity-70 transition-opacity"
                        >
                            <div
                                className="h-10 w-10 rounded-full"
                                style={{ background: generateAvatarGradient(user.address) }}
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                                </span>
                                <span className="text-xs text-zinc-500">
                                    {user.username || 'Settings'}
                                </span>
                            </div>
                        </Link>
                        <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                            <Settings size={18} />
                        </button>
                    </div>

                    {/* Main Menu Items */}
                    <div className="p-2">
                        <MenuItem icon={<Trophy size={18} />} label="Leaderboard" href="/leaderboard" onClick={() => setIsOpen(false)} />
                        <MenuItem icon={<Coins size={18} />} label="Rewards" href="/rewards" onClick={() => setIsOpen(false)} />
                        <MenuItem icon={<Plug size={18} />} label="APIs" href="/api-docs" onClick={() => setIsOpen(false)} />
                        <MenuItem icon={<Hammer size={18} />} label="Builders" href="/builders" onClick={() => setIsOpen(false)} />
                    </div>

                    {/* Dark Mode Toggle */}
                    <div className="px-4 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer" onClick={toggleTheme}>
                        <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
                            <Moon size={18} />
                            <span className="text-sm font-medium">Dark mode</span>
                        </div>
                        <div className={`w-11 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-blue-600 dark:bg-blue-600' : ''}`}>
                            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-5' : ''}`} />
                        </div>
                    </div>

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-4" />

                    {/* Secondary Links */}
                    <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4">
                        <FooterLink label="Accuracy" href="/accuracy" />
                        <FooterLink label="Support" href="/support" />
                        <FooterLink label="Documentation" href="/docs" />
                        <FooterLink label="Terms of Use" href="/terms" />
                    </div>

                    {/* Logout */}
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Components
const MenuItem = ({ icon, label, href, onClick }: { icon: React.ReactNode, label: string, href: string, onClick: () => void }) => (
    <Link
        href={href}
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
    >
        <span className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
    </Link>
);

const FooterLink = ({ label, href }: { label: string, href: string }) => (
    <Link href={href} className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
        {label}
    </Link>
);

// Helper for Avatar Gradient (Since it was local in PortfolioPage, I need to export it or redefine it. Best to export from lib/avatar.ts if it exists, but user viewed page.tsx which had it local. I will assume it's NOT in lib yet based on PortfolioPage view).
// WAIT: In step 791, I saw `import { generateAvatarGradient } from '@/lib/avatar';` in PortfolioPage.tsx.
// So I can import it!
