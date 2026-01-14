"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export const ConnectWallet = () => {
    const { user, login, logout, authenticated, isLoading } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || isLoading) {
        return (
            <div className="h-10 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
        );
    }

    if (!authenticated || !user) {
        return (
            <button
                onClick={() => {
                    console.log("Connect button clicked");
                    login();
                }}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all"
            >
                Connect
            </button>
        );
    }

    return (
        <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-semibold text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-zinc-700 border border-neutral-200 dark:border-zinc-700 transition-colors"
        >
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            {user.username || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
        </button>
    );
};
