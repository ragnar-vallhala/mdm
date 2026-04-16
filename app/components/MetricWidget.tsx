"use client"

import React from 'react'

interface MetricWidgetProps {
    label: string;
    value: string | number;
    unit: string;
    color: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({ label, value, unit, color, icon, trend }) => {
    return (
        <div className="glass metric-card p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm font-medium uppercase tracking-wider">{label}</span>
                <div style={{ color }} className="opacity-80">
                    {icon}
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tabular-nums tracking-tight">{value}</span>
                <span className="text-white/40 text-sm font-medium">{unit}</span>
            </div>
            {trend && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                    <span className={trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-blue-400' : 'text-white/20'}>
                        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'}
                    </span>
                    <span className="text-white/20 uppercase">Trend</span>
                </div>
            )}
        </div>
    )
}
