"use client";

import { useAccount } from 'wagmi';
import { useMintUSDC, useUSDCBalance } from '@/hooks/useContracts';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { useState } from 'react';
import { Loader2, Coins } from 'lucide-react';

export const Faucet = () => {
    const { address, isConnected } = useAccount();
    const { balance, refetch } = useUSDCBalance(address);
    const { mint, isPending } = useMintUSDC();
    const [isMinting, setIsMinting] = useState(false);

    const handleMint = async () => {
        if (!address) return;

        try {
            setIsMinting(true);
            const amount = 1000n * 1000000n; // 1000 USDC (6 decimals)
            await mint(address, amount);
            showSuccessToast("Minted 1,000 Fake USDC! 🤑");
            // Wait a bit for block to confirm then refetch
            setTimeout(() => refetch(), 2000);
        } catch (error) {
            console.error(error);
            showErrorToast("Failed to mint. Check console.");
        } finally {
            setIsMinting(false);
        }
    };

    if (!isConnected) return null;

    const formattedBalance = (Number(balance) / 1000000).toFixed(2);

    return (
        <div className="flex items-center justify-between p-4 rounded-lg border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800/50 mt-4">
            <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400">
                    Testnet Wallet
                </span>
                <span className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    ${formattedBalance} USDC
                </span>
            </div>

            <button
                onClick={handleMint}
                disabled={isPending || isMinting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md shadow transition-all disabled:opacity-50 flex items-center gap-2"
            >
                {(isPending || isMinting) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    "Get $1,000"
                )}
            </button>
        </div>
    );
};
