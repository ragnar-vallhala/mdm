"use client"

import React, { useState } from 'react'

interface MetricWidgetProps {
    label: string;
    value: string | number;
    unit: string;
    color: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
    history?: number[];
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({ label, value, unit, color, icon, trend, history = [] }) => {
    const [isGraphMode, setIsGraphMode] = useState(false);

    // Generate SVG path for sparkline
    const getPathData = () => {
        if (!history.length) return "";
        const width = 200;
        const height = 40;
        const min = Math.min(...history);
        const max = Math.max(...history);
        const range = max - min || 1;

        return history.map((val, i) => {
            const x = (i / (history.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(' ');
    };

    return (
        <div className="glass metric-card p-5 md:p-6 md:pb-8 flex flex-col gap-3 relative group">
            {/* Toggle Button */}
            <button
                onClick={() => setIsGraphMode(!isGraphMode)}
                className="absolute top-5 right-5 p-1.5 pb-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors z-10"
                title={isGraphMode ? "Show Value" : "Show Graph"}
            >
                {isGraphMode ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-white/80">
                        <path d="M4 7V4h16v3M4 11h16M4 15h16M4 20h16" />
                    </svg>
                ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:text-white/80">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                )}
            </button>

            <div className="flex items-center justify-between">
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{label}</span>
                <div style={{ color }} className="opacity-80">
                    {icon}
                </div>
            </div>

            {isGraphMode ? (
                <div className="h-16 mt-1 flex flex-col">
                    <div className="flex-1 relative">
                        {/* Y-Axis Labels - 3 Ticks */}
                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[7px] text-white/30 font-mono pointer-events-none pr-1">
                            <span>{Math.max(...history).toFixed(0)}</span>
                            <span className="opacity-50">{((Math.max(...history) + Math.min(...history)) / 2).toFixed(0)}</span>
                            <span>{Math.min(...history).toFixed(0)}</span>
                        </div>

                        <div className="ml-6 h-full border-l border-b border-white/10 relative">
                            {/* Horizontal grid lines for ticks */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                <div className="border-t border-white/5 w-full" />
                                <div className="border-t border-white/5 w-full" />
                                <div className="w-full" />
                            </div>

                            {history.length > 1 ? (
                                <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none" className="overflow-visible">
                                    <polyline
                                        points={getPathData()}
                                        fill="none"
                                        stroke={color}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[10px] text-white/20 italic">Awaiting data...</div>
                            )}
                        </div>
                    </div>
                    {/* X-Axis Labels - 4 Ticks */}
                    <div className="ml-6 flex justify-between text-[7px] text-white/30 font-mono mt-2">
                        <span>-30s</span>
                        <span className="opacity-50">-20s</span>
                        <span className="opacity-50">-10s</span>
                        <span>0s</span>
                    </div>
                </div>
            ) : (
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tabular-nums tracking-tight" style={{ color }}>{value}</span>
                    <span className="text-white/40 text-sm font-medium">{unit}</span>
                </div>
            )}

            {!isGraphMode && trend && (
                <div className="mt-2 flex items-center gap-1 text-[10px]">
                    <span className={`font-bold px-1.5 py-0.5 rounded ${trend === 'up' ? 'bg-red-500/20 text-red-500' : trend === 'down' ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10 text-white/40'}`}>
                        {trend.toUpperCase()}
                    </span>
                    <span className="text-white/20 uppercase font-bold ml-1">Trend</span>
                </div>
            )}
        </div>
    )
}
