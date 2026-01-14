"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from '@privy-io/wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { config, hardhat } from "@/lib/wagmi";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <PrivyProvider
                appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmk8tmewu00mfkz0c3bfgbygn"}
                config={{
                    loginMethods: ['google', 'wallet', 'email'],
                    appearance: {
                        theme: 'dark',
                        accentColor: '#3b82f6',
                        showWalletLoginFirst: false,
                    },
                    embeddedWallets: {
                        ethereum: {
                            createOnLogin: 'users-without-wallets',
                        },
                    },
                    externalWallets: {
                        solana: {
                            // Phantom support
                        }
                    },
                    defaultChain: hardhat,
                    supportedChains: [polygon, polygonAmoy, hardhat],
                }}
            >
                <WagmiProvider config={config}>
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </ThemeProvider>
                </WagmiProvider>
            </PrivyProvider>
        </QueryClientProvider>
    );
}
