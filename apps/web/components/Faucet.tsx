"use client";

import { useAccount } from 'wagmi';
import { useMintUSDC, useUSDCBalance } from '@/hooks/useContracts';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { useState } from 'react';
import { Loader2, Coins, Fuel } from 'lucide-react';
import { createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { hardhat } from '@/lib/wagmi';

// Hardhat Account #0 (Admin/Whale) Private Key - Publicly known for testing
const HARDHAT_ADMIN_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export const Faucet = () => {
    const { address, isConnected } = useAccount();
    const { balance, refetch } = useUSDCBalance(address);
    const { mint, isPending } = useMintUSDC();
    const [isMinting, setIsMinting] = useState(false);
    const [isFundingGas, setIsFundingGas] = useState(false);

    const handleFundGas = async () => {
        if (!address) return;
        try {
            setIsFundingGas(true);

            // Call Backend API to fund gas (Bypasses MetaMask/Browser Security)
            const res = await fetch('http://localhost:3001/faucet/gas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });

            if (!res.ok) throw new Error("Failed to fund gas via API");

            showSuccessToast("Sent 1 ETH for Gas! ⛽ (Backend Service)");
        } catch (error) {
            console.error("Gas Funding Error:", error);
            showErrorToast("Failed to send Gas.");
        } finally {
            setIsFundingGas(false);
        }
    };

    const handleMint = async () => {
        if (!address) return;

        try {
            setIsMinting(true);
            const amount = BigInt(1000) * BigInt(1000000); // 1000 USDC (6 decimals)
            await mint(address, amount);
            showSuccessToast("Minted 1,000 Fake USDC! 🤑");
            // Wait a bit for block to confirm then refetch
            setTimeout(() => refetch(), 2000);
        } catch (error) {
            console.error(error);
            showErrorToast("Failed to mint. Do you have ETH for gas?");
        } finally {
            setIsMinting(false);
        }
    };

    if (!isConnected) return null;

    const formattedBalance = (Number(balance) / 1000000).toFixed(2);

    return (
        <div className="flex flex-col gap-3 mt-4">
            {/* USDC Faucet */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800/50">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400">
                        Testnet USD
                    </span>
                    <span className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                        <Coins className="w-5 h-5" />
                        ${formattedBalance}
                    </span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleFundGas}
                        disabled={isFundingGas}
                        className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-md shadow transition-all disabled:opacity-50 flex items-center gap-2"
                        title="Get ETH for Gas Fees"
                    >
                        {isFundingGas ? <Loader2 className="w-3 h-3 animate-spin" /> : <Fuel className="w-3 h-3" />}
                        Gas
                    </button>
                    <button
                        onClick={handleMint}
                        disabled={isPending || isMinting}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md shadow transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {(isPending || isMinting) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            "+ $1,000"
                        )}
                    </button>
                </div>
            </div>

            <p className="text-[10px] text-center text-neutral-400">
                Tip: Click "Gas" if transactions fail (Email Login needs this!)
            </p>
        </div>
    );
};
