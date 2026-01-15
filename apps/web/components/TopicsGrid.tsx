
import {
    Cpu,
    Bitcoin,
    Landmark,
    Trophy,
    Rocket,
    Music,
    Briefcase,
    Globe
} from "lucide-react";

interface TopicsGridProps {
    activeCategory: string;
    onCategoryChange: (cat: string) => void;
}

const TOPICS = [
    { id: 'Politics', icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'Crypto', icon: Bitcoin, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { id: 'Sports', icon: Trophy, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { id: 'Pop Culture', icon: Music, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    { id: 'Science', icon: Rocket, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: 'Business', icon: Briefcase, color: 'text-zinc-500', bg: 'bg-zinc-100 dark:bg-zinc-800' },
    { id: 'Tech', icon: Cpu, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    { id: 'Global', icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
];

export const TopicsGrid = ({ activeCategory, onCategoryChange }: TopicsGridProps) => {
    return (
        <div className="mb-8">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Topics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                {TOPICS.map((topic) => (
                    <button
                        key={topic.id}
                        onClick={() => onCategoryChange(topic.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 ${activeCategory === topic.id
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-500'
                                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                    >
                        <div className={`p-2 rounded-lg ${topic.bg}`}>
                            <topic.icon size={20} className={topic.color} />
                        </div>
                        <span className="font-bold text-sm text-zinc-700 dark:text-zinc-200">
                            {topic.id}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
