"use client";

import { X } from 'lucide-react';
import { TradingWidget } from './TradingWidget';

interface TradingModalProps {
    isOpen: boolean;
    onClose: () => void;
    marketQuestion: string;
    marketId: number;
    initialOutcome?: 'yes' | 'no';
}

export const TradingModal = ({
    isOpen,
    onClose,
    marketQuestion,
    marketId,
    initialOutcome = 'yes'
}: TradingModalProps) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div
                    className="bg-white dark:bg-zinc-900 w-full sm:max-w-lg sm:rounded-lg shadow-xl animate-slide-up"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-4 border-b border-neutral-200 dark:border-zinc-800">
                        <div className="flex-1 pr-4">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                {marketQuestion}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <TradingWidget initialOutcome={initialOutcome} marketId={marketId} />
                    </div>
                </div>
            </div>
        </>
    );
};
