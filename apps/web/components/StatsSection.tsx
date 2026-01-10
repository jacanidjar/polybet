import { TrendingUp, Users, DollarSign } from "lucide-react";

interface StatsCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    change?: string;
}

const StatsCard = ({ icon, label, value, change }: StatsCardProps) => {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="rounded-lg bg-blue-500/10 p-3 text-blue-600 dark:bg-blue-500/20">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
                {change && (
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                        {change}
                    </p>
                )}
            </div>
        </div>
    );
};

export const StatsSection = () => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
            <StatsCard
                icon={<DollarSign className="h-6 w-6" />}
                label="Total Volume"
                value="$2.4B"
                change="+12.5% this week"
            />
            <StatsCard
                icon={<TrendingUp className="h-6 w-6" />}
                label="Active Markets"
                value="1,247"
                change="+23 today"
            />
            <StatsCard
                icon={<Users className="h-6 w-6" />}
                label="Active Traders"
                value="156K"
                change="+2.3K today"
            />
        </div>
    );
};
