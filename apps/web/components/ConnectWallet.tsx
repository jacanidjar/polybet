"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { UserMenu } from "./UserMenu";

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
        <UserMenu user={{ ...user, username: user.username || undefined }} logout={logout} />
    );
};
