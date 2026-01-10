
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { toast } from '@/lib/toast';

interface User {
    id: string;
    address: string;
    username: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (address: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    const login = async (userAddress: string) => {
        if (!userAddress) return;

        setIsLoading(true);
        try {
            // Using localhost:3001 as strictly defined in plan/previous investigation
            const res = await fetch('http://localhost:3001/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: userAddress })
            });

            if (!res.ok) throw new Error("Login failed");

            const userData = await res.json();
            setUser(userData);
            toast.success(`Welcome back!`);
            console.log("Auth: Logged in as", userData);
        } catch (error) {
            console.error("Auth Login Error:", error);
            toast.error("Failed to login to backend");
            disconnect(); // Force disconnect wallet if backend auth fails
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        disconnect();
        toast.success("Logged out");
    };

    // Auto-login when wallet connects
    useEffect(() => {
        if (isConnected && address && !user && !isLoading) {
            login(address);
        } else if (!isConnected && user) {
            setUser(null);
        }
    }, [isConnected, address]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
