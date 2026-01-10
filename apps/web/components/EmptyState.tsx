import { cn } from "@/lib/utils";
import { FileQuestion, TrendingUp, Activity } from "lucide-react";

interface EmptyStateProps {
    icon?: 'markets' | 'portfolio' | 'activity';
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

const icons = {
    markets: FileQuestion,
    portfolio: TrendingUp,
    activity: Activity,
};

export const EmptyState = ({
    icon = 'markets',
    title,
    description,
    action,
    className
}: EmptyStateProps) => {
    const Icon = icons[icon];

    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in",
            className
        )}>
            <div className="rounded-full bg-neutral-100 dark:bg-zinc-800 p-6 mb-4">
                <Icon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors active:scale-95 transform"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};
