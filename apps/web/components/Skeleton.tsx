import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
    return (
        <div
            className={cn(
                "rounded-md bg-neutral-200 dark:bg-zinc-800 animate-shimmer",
                className
            )}
        />
    );
};

export const MarketCardSkeleton = () => {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4">
            <div className="flex items-start justify-between mb-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-4" />

            <div className="border-t border-neutral-100 dark:border-zinc-800 pt-3 mt-3">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-8" />
                    </div>
                    <div>
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-8" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TradingWidgetSkeleton = () => {
    return (
        <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <Skeleton className="h-10 w-full mb-6" />
            <Skeleton className="h-4 w-20 mb-2" />
            <div className="grid grid-cols-2 gap-3 mb-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-12 w-full mb-6" />
            <Skeleton className="h-12 w-full" />
        </div>
    );
};
