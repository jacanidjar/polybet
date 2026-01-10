import { cn } from "@/lib/utils";

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip = ({ children, content, position = 'top' }: TooltipProps) => {
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div className="group relative inline-block">
            {children}
            <div
                className={cn(
                    "absolute z-50 hidden group-hover:block",
                    "px-3 py-2 text-sm font-medium text-white",
                    "bg-zinc-900 dark:bg-zinc-800 rounded-lg shadow-lg",
                    "whitespace-nowrap pointer-events-none",
                    "animate-fade-in",
                    positionClasses[position]
                )}
            >
                {content}
                {/* Arrow */}
                <div
                    className={cn(
                        "absolute w-2 h-2 bg-zinc-900 dark:bg-zinc-800 rotate-45",
                        position === 'top' && "bottom-[-4px] left-1/2 -translate-x-1/2",
                        position === 'bottom' && "top-[-4px] left-1/2 -translate-x-1/2",
                        position === 'left' && "right-[-4px] top-1/2 -translate-y-1/2",
                        position === 'right' && "left-[-4px] top-1/2 -translate-y-1/2"
                    )}
                />
            </div>
        </div>
    );
};
