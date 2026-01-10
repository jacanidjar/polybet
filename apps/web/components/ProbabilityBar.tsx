"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProbabilityBarProps {
    yesPercentage: number;
    className?: string;
}

export const ProbabilityBar = ({ yesPercentage, className }: ProbabilityBarProps) => {
    const [animatedWidth, setAnimatedWidth] = useState(0);
    const noPercentage = 100 - yesPercentage;

    // Animate on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedWidth(yesPercentage);
        }, 100);
        return () => clearTimeout(timer);
    }, [yesPercentage]);

    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-center justify-between mb-2 text-sm font-medium">
                <span className="text-green-600 dark:text-green-400">Yes {yesPercentage}%</span>
                <span className="text-red-600 dark:text-red-400">No {noPercentage}%</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-zinc-800">
                <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000 ease-out"
                    style={{ width: `${animatedWidth}%` }}
                />
                <div
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-600"
                    style={{ width: `${noPercentage}%` }}
                />
            </div>
        </div>
    );
};
