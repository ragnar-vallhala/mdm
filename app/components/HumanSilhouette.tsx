"use client"

import React, { useState } from 'react'

interface SilhouetteProps {
    gender: 'male' | 'female';
    hr: number;
    br: number;
    spo2?: number;
    gsr?: number;
}

export const HumanSilhouette: React.FC<SilhouetteProps> = ({ gender, hr, br, spo2 = 98, gsr = 4.5 }) => {
    const [showInsights, setShowInsights] = useState(false);

    const hrDuration = `${60 / hr}s`;
    const brDuration = `${60 / br}s`;

    // Derived Data Calculations
    const hrv = Math.max(20, Math.min(100, 120 - hr + (Math.sin(Date.now() / 5000) * 5))).toFixed(0);
    const stressLevel = Math.max(0, Math.min(100, (hr - 60) * 0.8 + (gsr * 5))).toFixed(0);
    const metabolicRate = (1400 + (hr * 8) + (br * 15)).toFixed(0);
    const recoveryScore = Math.max(0, Math.min(100, (spo2 - 90) * 10 - (hr - 70) * 0.5)).toFixed(0);

    return (
        <div className={`relative flex items-center justify-center w-full h-full max-h-[80vh] transition-all duration-700`}>
            {/* Insights Toggle Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowInsights(!showInsights);
                }}
                className={`absolute top-0 right-0 md:top-4 md:right-4 z-30 p-4 rounded-2xl transition-all duration-500 border group flex items-center justify-center ${showInsights ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.5)]' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/30'}`}
                title={showInsights ? "Hide Bio-Insights" : "Show Bio-Insights"}
            >
                <div className={`flex items-center transition-all duration-500 ${showInsights ? 'gap-3' : 'gap-0'}`}>
                    <span className={`text-xs font-bold uppercase tracking-widest transition-all duration-500 ${showInsights ? 'max-w-[120px] opacity-100 mr-1' : 'max-w-0 opacity-0 overflow-hidden'}`}>Bio-Insights</span>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${showInsights ? 'animate-pulse' : ''} shrink-0`}>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                </div>
            </button>

            {/* Bio-Insights Overlay */}
            {showInsights && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                    <div className="glass-premium w-full max-w-[400px] p-10 border border-white/30 shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-12 duration-500 rounded-[2.5rem] backdrop-blur-3xl">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-white/60 text-[11px] uppercase font-black tracking-[0.3em]">Neural & Bio-Analytics</h3>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        </div>

                        <div className="grid grid-cols-2 gap-x-10 gap-y-12">
                            <div className="flex flex-col">
                                <span className="text-white/30 text-[10px] uppercase font-bold mb-2 tracking-wider">HRV Index</span>
                                <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{hrv}<span className="text-xs font-medium opacity-40 ml-2">ms</span></span>
                                <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${hrv}%` }} />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white/30 text-[10px] uppercase font-bold mb-2 tracking-wider">Stress Avg</span>
                                <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{stressLevel}<span className="text-xs font-medium opacity-40 ml-2">%</span></span>
                                <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: `${stressLevel}%` }} />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white/30 text-[10px] uppercase font-bold mb-2 tracking-wider">Recovery</span>
                                <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{recoveryScore}<span className="text-xs font-medium opacity-40 ml-2">%</span></span>
                                <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `${recoveryScore}%` }} />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white/30 text-[10px] uppercase font-bold mb-2 tracking-wider">BMR Est.</span>
                                <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{metabolicRate}<span className="text-xs font-medium opacity-40 ml-2">kcal</span></span>
                                <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500/80 shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: '65%' }} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-white/30 text-[11px] uppercase font-black tracking-widest">Biological Age Score</span>
                                <span className="text-xl font-black text-white">-2.4 <span className="text-xs font-normal opacity-40 ml-1">Years</span></span>
                            </div>
                            <div className="bg-white/[0.03] rounded-3xl p-6 border border-white/10 backdrop-blur-md">
                                <p className="text-xs text-white/50 leading-relaxed italic font-medium">
                                    "Vitals indicate an optimal recovery trajectory. System homeostasis is maintained. Ready for high-intensity cognitive or physical load."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <svg
                viewBox="0 0 200 500"
                className={`h-full w-auto drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-700 ${showInsights ? 'opacity-10 blur-md brightness-50' : 'opacity-100'}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Head */}
                <circle cx="100" cy="55" r="35" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" />

                {/* Torso & Arms */}
                <path
                    d={
                        gender === 'male'
                            ? "M70 100 C40 105 30 140 30 180 V250 H50 V180 C50 160 55 145 65 135 V280 H135 V135 C145 145 150 160 150 180 V250 H170 V180 C170 140 160 105 130 100 Z"
                            : "M70 100 C50 105 40 135 40 170 V230 H55 V170 C55 155 60 145 70 135 V280 H130 V135 C140 145 145 155 145 170 V230 H160 V170 C160 135 150 105 130 100 Z"
                    }
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="2"
                />

                {/* Left Leg */}
                <rect x="75" y="280" width="20" height="200" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" rx="4" />

                {/* Right Leg */}
                <rect x="105" y="280" width="20" height="200" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" rx="4" />

                {/* Lungs (Breathing area) */}
                <ellipse
                    cx="115"
                    cy="155"
                    rx="30"
                    ry="30"
                    className="breathing fill-br/20"
                    style={{ '--breathe-duration': brDuration } as any}
                />

                {/* Heart (Pulsing circle on viewer's left) */}
                <g className="hr-pulse" style={{ '--pulse-duration': hrDuration, transformOrigin: '80px 155px' } as any}>
                    <circle
                        cx="115"
                        cy="155"
                        r="8"
                        className="fill-hr-pulse"
                    />
                    <circle
                        cx="115"
                        cy="155"
                        r="16"
                        className="fill-hr-pulse/20 blur-md"
                    />
                </g>
            </svg>
        </div>
    )
}
