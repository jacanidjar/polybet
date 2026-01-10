"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PriceChartProps {
    marketId?: number;
    initialData?: any[]; // Allow passing data directly if available
}

export const PriceChart = ({ marketId, initialData }: PriceChartProps) => {
    const [data, setData] = useState<any[]>(initialData || []);

    // If no initial data and marketId provided, could fetch.
    // For now, let's assume parent passes data or we just show empty/placeholder
    // But honestly, it's better if the parent Page fetches the market which INCLUDES trades,
    // and passes it down.

    // So let's rely on props for now.

    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-neutral-50 dark:bg-zinc-900 rounded-lg">
                <p className="text-gray-400 text-sm">Waiting for market data...</p>
            </div>
        );
    }

    // Process trades into a time series: timestamp -> price
    const chartData = data.map(trade => ({
        time: new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: trade.price * 100 // Convert to cents
    }));

    return (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="time"
                        hide
                    />
                    <YAxis
                        domain={[0, 100]}
                        hide
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value: number) => [`${value.toFixed(1)}¢`, 'Price']}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#2563eb"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
