"use client"

import React, { useState, useEffect, useRef } from 'react'
import { HumanSilhouette } from './HumanSilhouette'
import { MetricWidget } from './MetricWidget'

type HealthData = {
    timestamp: number;
    heart_rate: number;
    spo2: number;
    breathing_rate: number;
    gsr: number;
    temperature: number;
    dehydration_index: number;
    posture: string;
    fall_detected: boolean;
    steps: number;
}

export const HealthDashboard = () => {
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [activity, setActivity] = useState<'low' | 'high'>('low');
    const [allData, setAllData] = useState<HealthData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`/data/${gender}_${activity}.csv`);
            const text = await response.text();
            const rows = text.split('\n').slice(1);
            const parsedData = rows.filter(row => row.trim() !== '').map(row => {
                const [timestamp, heart_rate, spo2, breathing_rate, gsr, temperature, dehydration_index, posture, fall_detected, steps] = row.split(',');
                return {
                    timestamp: parseFloat(timestamp),
                    heart_rate: parseFloat(heart_rate),
                    spo2: parseFloat(spo2),
                    breathing_rate: parseFloat(breathing_rate),
                    gsr: parseFloat(gsr),
                    temperature: parseFloat(temperature),
                    dehydration_index: parseFloat(dehydration_index),
                    posture: posture,
                    fall_detected: fall_detected === 'true',
                    steps: parseInt(steps)
                };
            });
            setAllData(parsedData);
            setCurrentIndex(0);
        };

        fetchData();
    }, [gender, activity]);

    useEffect(() => {
        if (isPlaying && allData.length > 0) {
            timerRef.current = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= allData.length - 1) return 0;
                    return prev + 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, allData]);

    const current = allData[currentIndex] || {
        heart_rate: 0,
        spo2: 0,
        breathing_rate: 0,
        gsr: 0,
        temperature: 0,
        dehydration_index: 0,
        posture: 'Unknown',
        fall_detected: false,
        steps: 0
    };

    return (
        <div className="w-screen h-screen bg-black flex flex-col p-8 gap-8 overflow-hidden select-none">
            {/* Header / Selectors */}
            <div className="flex items-center justify-between glass p-4 z-10">
                <h1 className="text-2xl font-black italic tracking-tighter text-white/90">VITAL_OS</h1>

                <div className="flex gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Gender</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as any)}
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Activity Level</label>
                        <select
                            value={activity}
                            onChange={(e) => setActivity(e.target.value as any)}
                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-white/30"
                        >
                            <option value="low">Low</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="bg-white text-black font-bold px-6 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors uppercase"
                        >
                            {isPlaying ? 'Pause' : 'Play'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
                {/* Left Column - Metrics */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-8">
                    <MetricWidget
                        label="Heart Rate"
                        value={current.heart_rate.toFixed(0)}
                        unit="BPM"
                        color="var(--color-hr-pulse)"
                        trend={current.heart_rate > 90 ? 'up' : 'stable'}
                    />
                    <MetricWidget
                        label="SPO2"
                        value={current.spo2.toFixed(1)}
                        unit="%"
                        color="var(--color-spo2)"
                        trend={current.spo2 < 95 ? 'down' : 'stable'}
                    />
                    <MetricWidget
                        label="Breathing"
                        value={current.breathing_rate.toFixed(0)}
                        unit="RPM"
                        color="var(--color-br)"
                    />
                    <MetricWidget
                        label="GSR"
                        value={current.gsr.toFixed(2)}
                        unit="μS"
                        color="var(--color-gsr)"
                    />
                </div>

                {/* Center - Human Silhouette */}
                <div className="col-span-6 glass relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] pointer-events-none" />
                    <HumanSilhouette gender={gender} hr={current.heart_rate} br={current.breathing_rate} />

                    {current.fall_detected && (
                        <div className="absolute inset-0 bg-red-500/20 border-4 border-red-500 animate-pulse flex items-center justify-center pointer-events-none">
                            <span className="text-4xl font-black text-red-500 drop-shadow-2xl">FALL DETECTED</span>
                        </div>
                    )}

                    <div className="absolute bottom-8 left-8 flex flex-col">
                        <span className="text-white/40 text-[10px] uppercase font-bold">Current Posture</span>
                        <span className="text-2xl font-black">{current.posture}</span>
                    </div>

                    <div className="absolute bottom-8 right-8 text-right flex flex-col">
                        <span className="text-white/40 text-[10px] uppercase font-bold">Playback</span>
                        <span className="font-mono text-sm">{Math.floor(current.timestamp / 60)}:{String(current.timestamp % 60).padStart(2, '0')}</span>
                    </div>
                </div>

                {/* Right Column - Remaining Metrics */}
                <div className="col-span-3 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-8">
                    <MetricWidget
                        label="Temperature"
                        value={current.temperature.toFixed(1)}
                        unit="°C"
                        color="var(--color-temp)"
                    />
                    <MetricWidget
                        label="Dehydration"
                        value={current.dehydration_index.toFixed(1)}
                        unit="/ 10"
                        color="var(--color-dehyd)"
                    />
                    <MetricWidget
                        label="Step Count"
                        value={current.steps.toLocaleString()}
                        unit="Steps"
                        color="#ffffff"
                    />

                    {/* Fall Status Card */}
                    <div className={`glass p-6 border-2 transition-colors duration-500 ${current.fall_detected ? 'border-red-500 bg-red-500/10' : 'border-transparent'}`}>
                        <div className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">System Status</div>
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${current.fall_detected ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
                            <span className="font-bold uppercase tracking-widest text-sm">
                                {current.fall_detected ? 'Alert' : 'Nominal'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
