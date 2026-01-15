'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface PricePoint {
    price: number;
    createdAt: string;
    outcome: string;
}

interface PriceChartProps {
    data: PricePoint[];
    outcome?: 'YES' | 'NO';
}

export function PriceChart({ data, outcome = 'YES' }: PriceChartProps) {
    // Filter data for specific outcome if needed, or assume data is already filtered
    // For now, let's format the data for the chart
    // We want to show probability % (0-100)

    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-zinc-500 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                No price history yet
            </div>
        );
    }

    const chartData = data.map(d => ({
        time: new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullDate: new Date(d.createdAt).toLocaleString(),
        probability: (d.price * 100).toFixed(1), // Convert 0.5 to 50.0
        original: d.price
    }));

    const color = outcome === 'YES' ? '#22c55e' : '#ef4444'; // Green for YES, Red for NO

    return (
        <div className="w-full h-64 bg-white dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.3} />
                    <XAxis
                        dataKey="time"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        unit="%"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#18181b',
                            borderColor: '#27272a',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        labelStyle={{ color: '#a1a1aa' }}
                        formatter={(value: any) => [`${value}%`, `Probability (${outcome})`]}
                    />
                    <Line
                        type="monotone"
                        dataKey="probability"
                        stroke={color}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
