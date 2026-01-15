
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string; // Allow external styling overrides
}

export const AccordionItem = ({ title, children, defaultOpen = false, className }: AccordionItemProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={cn("border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
                <span className="font-semibold text-zinc-900 dark:text-white text-sm">{title}</span>
                {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
            </button>

            {isOpen && (
                <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800/50 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {children}
                </div>
            )}
        </div>
    );
};
