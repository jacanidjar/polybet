"use client";

import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export const ConnectWallet = () => {
    const { user } = useAuth();
    const { address, isConnected } = useAccount();

    useEffect(() => {
        const login = async () => {
            if (isConnected && address) {
                try {
                    await fetch('http://localhost:3001/users/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ address }),
                    });
                    // toast.success("Welcome back!"); // Optional: don't spam toasts
                } catch (e) {
                    console.error("Login failed", e);
                }
            }
        };
        login();
    }, [address, isConnected]);

    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openConnectModal,
                mounted,
            }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button
                                        onClick={openConnectModal}
                                        className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all"
                                    >
                                        Connect Wallet
                                    </button>
                                );
                            }

                            return (
                                <button
                                    onClick={openAccountModal}
                                    className="flex items-center gap-2 rounded-lg bg-white dark:bg-zinc-800 px-4 py-2 text-sm font-semibold text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-zinc-700 border border-neutral-200 dark:border-zinc-700 transition-colors"
                                >
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    {user?.username || account.displayName}
                                </button>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
};
