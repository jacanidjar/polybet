"use client";

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { TradingModal } from './TradingModal';
import { LoginModal } from './LoginModal';

interface MarketCardProps {
    id?: number;
    question: string;
    volume: string;
    chance: number;
    image?: string;
}

export const MarketCard = ({ id = 1, question, volume, chance, image }: MarketCardProps) => {
    const [showTradingModal, setShowTradingModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no'>('yes');
    const [isClient, setIsClient] = useState(false);
    const noChance = 100 - chance;

    // Prevenir hydration error
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Simular check de autenticação (você vai substituir com lógica real)
    const isAuthenticated = false; // Mude para true para testar o fluxo de trading

    const handleOutcomeClick = (outcome: 'yes' | 'no') => {
        setSelectedOutcome(outcome);

        if (!isAuthenticated) {
            setShowLoginModal(true);
        } else {
            setShowTradingModal(true);
        }
    };

    return (
        <>
            <div className="relative flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                {/* Image/Avatar */}
                <div className="flex items-center gap-3 p-4 pb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold leading-tight text-neutral-900 dark:text-neutral-100 line-clamp-2">
                            {question}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-green-600 dark:text-green-500 font-semibold">{chance}%</span>
                            <span className="text-xs text-gray-500">chance</span>
                        </div>
                    </div>
                </div>

                {/* Yes/No Buttons */}
                <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                    <button
                        onClick={() => handleOutcomeClick('yes')}
                        className="py-3 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold transition-colors"
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => handleOutcomeClick('no')}
                        className="py-3 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold transition-colors"
                    >
                        No
                    </button>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-100 dark:border-zinc-800 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        {volume} Vol.
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </span>
                    <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                        <Bookmark className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Modals - Only render on client */}
            {isClient && (
                <>
                    <TradingModal
                        isOpen={showTradingModal}
                        onClose={() => setShowTradingModal(false)}
                        marketQuestion={question}
                        marketId={id}
                        initialOutcome={selectedOutcome}
                    />

                    <LoginModal
                        isOpen={showLoginModal}
                        onClose={() => setShowLoginModal(false)}
                    />
                </>
            )}
        </>
    );
};
