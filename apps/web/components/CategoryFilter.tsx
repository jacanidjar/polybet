"use client";

import { cn } from "@/lib/utils";

interface CategoryFilterProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({
    categories,
    activeCategory,
    onCategoryChange,
}: CategoryFilterProps) => {
    // Map categories to icons (approximated for visual flair)
    const getIcon = (cat: string) => {
        switch (cat) {
            case "Politics": return "🏛️";
            case "Crypto": return "₿";
            case "Sports": return "⚽";
            case "Pop Culture": return "🎵";
            case "Science": return "🧬";
            case "Business": return "💼";
            default: return "🔥"; // Trending/All
        }
    };

    return (
        <div className="flex w-full border-b border-neutral-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sticky top-14 z-40">
            <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={cn(
                            "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                            activeCategory === category
                                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                                : "text-gray-600 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                        )}
                    >
                        <span>{getIcon(category)}</span>
                        <span>{category}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
