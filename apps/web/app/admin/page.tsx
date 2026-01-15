"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useCreateMarket, useTokenContract, useApproveToken, useCheckAllowance, useResolveMarket } from '@/hooks/useContracts';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Header } from '@/components/Header';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { AlertTriangle, Check, Loader2, Upload, Wand2 } from 'lucide-react';

export default function AdminPage() {
    const { address, isConnected } = useAccount();
    const { createMarketOnChain, isPending, hash } = useCreateMarket();
    const { resolve, isPending: isResolving } = useResolveMarket();
    const { approve, isPending: isApproving } = useApproveToken();
    const { allowance, refetch: refetchAllowance } = useCheckAllowance(address);

    const [formData, setFormData] = useState({
        question: '',
        description: '',
        category: 'Politics',
        image: '',
        date: '',
        time: '12:00',
        liquidity: '100'
    });

    const [status, setStatus] = useState<'idle' | 'approving' | 'creating' | 'syncing' | 'success'>('idle');
    const [markets, setMarkets] = useState<any[]>([]);

    // Fetch markets for resolution
    useEffect(() => {
        fetch('http://localhost:3001/markets')
            .then(res => res.json())
            .then(data => setMarkets(data))
            .catch(console.error);
    }, [status]);

    // Receipt waiter
    const { isLoading: isWaiting, isSuccess: isTxSuccess, data: receipt } = useWaitForTransactionReceipt({
        hash: hash,
    });

    // Handle Form Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    // Handle Resolve
    const handleResolve = async (marketId: number, outcomeIndex: number) => {
        try {
            // 1 = YES, 2 = NO
            await resolve(marketId, outcomeIndex);
            showSuccessToast("Resolution TX Sent!");
        } catch (e: any) {
            console.error(e);
            showErrorToast("Resolution Failed: " + e.message);
        }
    };

    // Main Action
    const handleCreate = async () => {
        if (!formData.question || !formData.date) {
            showErrorToast("Fill all required fields");
            return;
        }

        try {
            setStatus('creating');

            // 1. Calculate End Time (Unix Timestamp)
            const endDate = new Date(`${formData.date}T${formData.time}`);
            const unixTime = Math.floor(endDate.getTime() / 1000);

            if (unixTime < Date.now() / 1000) {
                showErrorToast("End date must be in the future");
                setStatus('idle');
                return;
            }

            // 2. Prepare Liquidity
            const liquidity = BigInt(Number(formData.liquidity) * 1_000_000);

            // 3. Call Blockchain
            await createMarketOnChain(formData.question, unixTime, liquidity);

        } catch (error: any) {
            console.error(error);
            showErrorToast(error.message || "Failed to create market");
            setStatus('idle');
        }
    };

    // Sync with Backend
    const syncWithBackend = async (txReceipt: any) => {
        setStatus('syncing');
        try {
            const logs = txReceipt.logs;
            let marketId = null;

            // Basic log check
            if (logs.length > 0) {
                const targetLog = logs[logs.length - 1];
                const idHex = targetLog.topics[1];
                marketId = parseInt(idHex, 16);
            }

            if (!marketId) throw new Error("Could not find Market ID in logs");

            // Sync
            const slug = formData.question
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const payload = {
                id: marketId,
                slug: slug,
                question: formData.question,
                description: formData.description,
                category: formData.category,
                endDate: new Date(`${formData.date}T${formData.time}`).toISOString(),
                image: formData.image || undefined,
            };

            const res = await fetch('http://localhost:3001/markets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Backend sync failed");

            setStatus('success');
            showSuccessToast(`Market #${marketId} created successfully!`);

            // Reset
            setFormData({ ...formData, question: '' });

        } catch (e: any) {
            console.error(e);
            showErrorToast("Sync Error: " + e.message);
            setStatus('idle');
        }
    };

    // Watch for success
    if (isTxSuccess && status === 'creating' && receipt) {
        syncWithBackend(receipt);
    }

    if (!isConnected) {
        return (
            <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950 pb-20">
                <Header />
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <h1 className="text-2xl font-bold mb-4">Admin Access Only</h1>
                    <p className="text-zinc-500">Please connect your wallet.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950 pb-20">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* CREATE SECTION */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-600 rounded-lg text-white">
                        <Upload size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
                        <p className="text-sm text-zinc-500">Create and Resolve Markets</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm mb-12">
                    <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">🚀 Create New Market</h2>
                    <div className="space-y-6">

                        {/* Question */}
                        <div>
                            <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Question</label>
                            <input
                                name="question"
                                value={formData.question}
                                onChange={handleChange}
                                placeholder="Will BTC hit $100k by 2025?"
                                className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Resolution verification rules..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Politics">Politics</option>
                                    <option value="Crypto">Crypto</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Pop Culture">Pop Culture</option>
                                    <option value="Business">Business</option>
                                </select>
                            </div>

                            {/* Liquidity */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Initial Liquidity (USDC)</label>
                                <input
                                    name="liquidity"
                                    type="number"
                                    value={formData.liquidity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">End Date</label>
                                <input
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* Time */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">End Time</label>
                                <input
                                    name="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">Image URL</label>
                            <input
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            {formData.image && (
                                <img src={formData.image} alt="Preview" className="mt-4 h-48 w-full object-cover rounded-lg border border-zinc-200 dark:border-zinc-700" />
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                onClick={handleCreate}
                                disabled={status !== 'idle' && status !== 'success'}
                                className="w-full py-4 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {status === 'idle' && 'Create Market'}
                                {status === 'approving' && <><Loader2 className="animate-spin" /> Approving USDC...</>}
                                {status === 'creating' && <><Loader2 className="animate-spin" /> Confirming Transaction...</>}
                                {status === 'syncing' && <><Loader2 className="animate-spin" /> Syncing with Database...</>}
                                {status === 'success' && <><Check /> Market Created!</>}
                            </button>

                            {status === 'success' && (
                                <p className="text-center text-green-600 mt-4 font-medium">
                                    Market successfully deployed and indexed!
                                </p>
                            )}
                        </div>

                    </div>
                </div>

                {/* RESOLVE SECTION */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">⚖️ Resolve Markets</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="pb-4 font-bold text-zinc-500 dark:text-zinc-400">ID</th>
                                    <th className="pb-4 font-bold text-zinc-500 dark:text-zinc-400">Question</th>
                                    <th className="pb-4 font-bold text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {markets.map((market: any) => (
                                    <tr key={market.id} className="group">
                                        <td className="py-4 font-mono text-sm text-zinc-500">{market.id}</td>
                                        <td className="py-4 font-medium text-zinc-900 dark:text-white max-w-md truncate pr-4">
                                            {market.question}
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleResolve(market.id, 1)}
                                                    className="px-3 py-1.5 text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
                                                >
                                                    Resolve YES
                                                </button>
                                                <button
                                                    onClick={() => handleResolve(market.id, 2)}
                                                    className="px-3 py-1.5 text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
                                                >
                                                    Resolve NO
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {markets.length === 0 && (
                            <div className="text-center py-8 text-zinc-500">No markets found</div>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}
