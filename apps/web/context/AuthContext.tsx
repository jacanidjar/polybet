"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { toast } from '@/lib/toast';

interface User {
    id: string;
    address: string;
    username: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    authenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isBackendLoading, setIsBackendLoading] = useState(false);

    // Privy hooks
    const { login: privyLogin, logout: privyLogout, authenticated, user: privyUser, ready } = usePrivy();
    const { wallets } = useWallets();

    useEffect(() => {
        console.log("Auth State:", { ready, authenticated, user: !!privyUser });
    }, [ready, authenticated, privyUser]);

    const syncWithBackend = async (address: string) => {
        if (!address || isBackendLoading) return;

        setIsBackendLoading(true);
        try {
            const res = await fetch('http://localhost:3001/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });

            if (!res.ok) throw new Error("Backend login failed");

            const userData = await res.json();
            setUser(userData);
            console.log("Auth: Backend synced as", userData);
        } catch (error) {
            console.error("Backend Sync Error:", error);
            toast.error("Failed to sync with backend");
        } finally {
            setIsBackendLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        privyLogout();
        toast.success("Logged out");
    };

    // Effect to sync when Privy is authenticated
    useEffect(() => {
        const address = privyUser?.wallet?.address;

        if (ready && authenticated && address) {
            console.log("Auth: Syncing with address", address);
            syncWithBackend(address);
        } else if (ready && authenticated && !address) {
            console.log("Auth: Authenticated but no wallet address yet. Waiting for embedded wallet...");
        } else if (ready && !authenticated) {
            setUser(null);
        }
    }, [ready, authenticated, privyUser, wallets]); // Adding wallets to dependency list

    return (
        <AuthContext.Provider value={{
            user,
            isLoading: !ready || isBackendLoading,
            login: privyLogin,
            logout,
            authenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
