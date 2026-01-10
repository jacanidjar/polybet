"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css';
import { PrivyProvider } from "@privy-io/react-auth";

import { config } from "@/lib/wagmi";
import { AuthProvider } from "@/context/AuthContext";

import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    <RainbowKitProvider theme={darkTheme()}>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </RainbowKitProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
