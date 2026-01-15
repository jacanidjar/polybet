"use client";

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: ReactNode;
    confirmText?: string;
    onConfirm: () => void;
    isDestructive?: boolean;
}

export const ActionModal = ({
    isOpen,
    onClose,
    title,
    children,
    confirmText = "Confirm",
    onConfirm,
    isDestructive = false
}: ActionModalProps) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-xl p-6 animate-scale-in border border-zinc-200 dark:border-zinc-800"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                        {children}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2 text-white rounded-lg font-bold text-sm transition-colors ${isDestructive
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
