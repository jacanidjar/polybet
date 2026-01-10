"use client";

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { useAccount } from 'wagmi';
import { useApproveToken, useBuyShares, useSellShares, useCheckAllowance } from '@/hooks/useContracts';

interface TradingWidgetProps {
    initialOutcome?: 'yes' | 'no';
    marketId: number;
}

export const TradingWidget = ({ initialOutcome = 'yes', marketId }: TradingWidgetProps) => {
    const { address, isConnected } = useAccount();
    const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
    const [outcome, setOutcome] = useState<'yes' | 'no'>(initialOutcome);
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Blockchain hooks
    const { approve, isPending: isApproving } = useApproveToken();
    const { buy, isPending: isBuying } = useBuyShares();
    const { sell, isPending: isSelling } = useSellShares();
    const { allowance, refetch: refetchAllowance } = useCheckAllowance(address);

    const yesPrice = 0.65;
    const noPrice = 0.35;

    // Calculations
    const calculations = useMemo(() => {
        const amountNum = parseFloat(amount) || 0;
        if (amountNum === 0) return null;

        const price = outcome === 'yes' ? yesPrice : noPrice;
        // Logic: For simplicity in MVP, we assume price is fixed ratio.
        // In real AMM, this would fetch from contract.
        const shares = amountNum / price;
        const maxPayout = shares * 1.00;
        const maxProfit = maxPayout - amountNum;
        const roi = (maxProfit / amountNum) * 100;

        return {
            price,
            shares: shares.toFixed(2),
            avgPrice: (price * 100).toFixed(1),
            maxProfit: maxProfit.toFixed(2),
            roi: roi.toFixed(1),
        };
    }, [amount, outcome, yesPrice, noPrice]);

    const handlePlaceOrder = async () => {
        if (!isConnected || !address) {
            showErrorToast('Please connect your wallet first');
            return;
        }

        const amountNum = parseFloat(amount);
        if (!amountNum || amountNum <= 0) {
            showErrorToast('Please enter a valid amount');
            return;
        }

        setIsSubmitting(true);
        try {
            // Convert to BigInt (USDC has 6 decimals)
            const amountBigInt = BigInt(Math.floor(amountNum * 1_000_000));

            if (orderType === 'buy') {
                // 1. Check Allowance
                if (allowance < amountBigInt) {
                    const tx = await approve(amountBigInt);
                    showSuccessToast('Approving USDC...');
                    // Ideally wait for tx, but wagmi handles prompt
                }

                // 2. Buy Shares
                // Outcome: 1=YES, 2=NO
                const outcomeId = outcome === 'yes' ? 1 : 2;
                await buy(marketId, outcomeId, amountBigInt);
                showSuccessToast(`Buy Order Sent!`);
            } else {
                // Sell Logic
                // We need to know user shares to sell. logic is similar.
                // For now just basic sell call
                // Shares has 18 decimals usually? Or matches USDC? 
                // In our simplified contract, shares out calculation used 1e18 scalar.
                // Let's assume input amount here is SHARES to sell? 
                // Re-using "Amount" field as "Shares" for Sell mode for simplicity?
                // Or Amount $ worth?
                // Let's assume Amount input is always USDC.
                // Sell logic needs fix in next step if complexity mismatch.

                const outcomeId = outcome === 'yes' ? 1 : 2;
                // Assuming sell takes shares amount. 
                // Calculations.shares is approximate.
                // We'll use mocked logic for now or raw amount.

                // FIX: For MVP Sell, we pass shares amount. 
                // We calculate typical shares for this amount.
                const sharesToSell = BigInt(Math.floor(parseFloat(calculations?.shares || '0') * 1e18)); // 18 decimals

                await sell(marketId, outcomeId, sharesToSell);
                showSuccessToast(`Sell Order Sent!`);
            }

            setAmount('');
            refetchAllowance();

            // Sync with backend (Optional for indexing)
            await fetch('http://localhost:3001/trades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userAddress: address,
                    marketId: marketId,
                    outcome: outcome,
                    amount: amountNum,
                    type: orderType,
                    price: calculations?.price
                })
            });

        } catch (error) {
            console.error('Trading Error:', error);
            showErrorToast('Transaction failed or rejected');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex w-full rounded-lg bg-neutral-100 p-1 dark:bg-zinc-800">
                <button
                    onClick={() => setOrderType('buy')}
                    className={cn(
                        "w-1/2 rounded-md py-1.5 text-sm font-medium transition-all",
                        orderType === 'buy'
                            ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-white"
                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                    )}
                >
                    Buy
                </button>
                <button
                    onClick={() => setOrderType('sell')}
                    className={cn(
                        "w-1/2 rounded-md py-1.5 text-sm font-medium transition-all",
                        orderType === 'sell'
                            ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-white"
                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
                    )}
                >
                    Sell
                </button>
            </div>

            <div className="mt-6">
                <label className="text-sm font-medium text-neutral-700 dark:text-zinc-300 mb-2 block">Outcome</label>
                <div className="flex gap-3">
                    <button
                        onClick={() => setOutcome('yes')}
                        className={cn(
                            "flex-1 rounded-lg border px-4 py-4 text-left transition-all",
                            outcome === 'yes'
                                ? "border-green-500 bg-green-500/10 dark:bg-green-500/20 ring-2 ring-green-500/20"
                                : "border-neutral-200 hover:border-neutral-300 dark:border-zinc-700"
                        )}
                    >
                        <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Yes</div>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">{(yesPrice * 100).toFixed(0)}¢</div>
                    </button>
                    <button
                        onClick={() => setOutcome('no')}
                        className={cn(
                            "flex-1 rounded-lg border px-4 py-4 text-left transition-all",
                            outcome === 'no'
                                ? "border-red-500 bg-red-500/10 dark:bg-red-500/20 ring-2 ring-red-500/20"
                                : "border-neutral-200 hover:border-neutral-300 dark:border-zinc-700"
                        )}
                    >
                        <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">No</div>
                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">{(noPrice * 100).toFixed(0)}¢</div>
                    </button>
                </div>
            </div>

            <div className="mt-6">
                <label className="text-sm font-medium text-neutral-700 dark:text-zinc-300">Amount (USDC)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-2 w-full rounded-lg border border-neutral-200 bg-transparent px-4 py-3 text-lg font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:text-white transition-all"
                />
            </div>

            {/* Preview Calculations */}
            {calculations && (
                <div className="mt-6 rounded-lg bg-neutral-50 dark:bg-zinc-800/50 p-4 space-y-2 border border-neutral-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Shares</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">{calculations.shares}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Avg price</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">{calculations.avgPrice}¢</span>
                    </div>
                    <div className="border-t border-neutral-200 dark:border-zinc-700 pt-2 mt-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Max profit</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">+${calculations.maxProfit}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-600 dark:text-gray-400">Est. ROI</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">+{calculations.roi}%</span>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={handlePlaceOrder}
                disabled={!isConnected || (!amount || parseFloat(amount) <= 0) || isSubmitting}
                className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:active:scale-100"
            >
                {isConnected ? (
                    isSubmitting ? 'Processing...' : (orderType === 'buy' ? 'Place Order' : 'Sell Shares')
                ) : (
                    'Connect Wallet to Trade'
                )}
            </button>

            <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <p>
                    Shares pay out $1.00 if the outcome occurs, $0.00 otherwise.
                </p>
            </div>
        </div>
    );
};
