"use client"

import React, { useState, useEffect, useRef } from 'react'
import { HumanSilhouette } from './HumanSilhouette'
import { MetricWidget } from './MetricWidget'

type HealthData = {
    timestamp: number;
    heart_rate: number;
    heart_rate_gen?: boolean;
    heart_rate_source?: string;
    spo2: number;
    spo2_gen?: boolean;
    spo2_source?: string;
    breathing_rate: number;
    breathing_rate_gen?: boolean;
    breathing_rate_source?: string;
    gsr: number;
    gsr_gen?: boolean;
    gsr_source?: string;
    temperature: number;
    temperature_gen?: boolean;
    temperature_source?: string;
    dehydration_index: number;
    dehydration_index_gen?: boolean;
    dehydration_index_source?: string;
    posture: string;
    posture_gen?: boolean;
    posture_source?: string;
    fall_detected: boolean;
    fall_detected_gen?: boolean;
    fall_detected_source?: string;
    steps: number;
    steps_gen?: boolean;
    steps_source?: string;
}

export const HealthDashboard = () => {
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [activity, setActivity] = useState<'low' | 'high'>('low');
    const [dataSource, setDataSource] = useState<'simulated' | 'consolidated'>('consolidated');
    const [allData, setAllData] = useState<HealthData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const url = dataSource === 'simulated'
                ? `/data/${gender}_${activity}.csv`
                : `/data/consolidated_${gender}.csv`;

            const response = await fetch(url);
            const text = await response.text();
            const rows = text.split('\n');
            const headers = rows[0].split(',').map(h => h.trim());
            const body = rows.slice(1);

            const parsedData = body.filter(row => row.trim() !== '').map(row => {
                const values = row.split(',');
                const data: any = {};
                headers.forEach((header, index) => {
                    const val = values[index];
                    if (header.endsWith('_gen')) {
                        data[header] = val ? val.toLowerCase() === 'true' : false;
                    } else if (header.endsWith('_source')) {
                        data[header] = val || 'SIM';
                    } else if (header === 'posture') {
                        data[header] = val || 'Unknown';
                    } else if (header === 'fall_detected') {
                        data[header] = val ? val.toLowerCase() === 'true' : false;
                    } else {
                        data[header] = parseFloat(val) || 0;
                    }
                });
                return data as HealthData;
            });
            setAllData(parsedData);
            setCurrentIndex(0);
        };

        fetchData();
    }, [gender, activity, dataSource]);

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

    // History window (last 30 points)
    const getHistory = (key: keyof HealthData) => {
        const start = Math.max(0, currentIndex - 30);
        return allData.slice(start, currentIndex + 1).map(d => d[key] as number);
    };

    return (
        <div className="w-full min-h-screen bg-black flex flex-col p-4 md:p-8 gap-4 md:gap-8 overflow-y-auto">
            {/* Header / Selectors */}
            <div className="flex flex-col md:flex-row items-center justify-between glass p-4 z-10 gap-4 shrink-0">
                <h1 className="text-2xl font-black italic tracking-tighter text-white/90">VITAL_OS</h1>

                <div className="flex flex-wrap items-center justify-center gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Source</label>
                        <select
                            value={dataSource}
                            onChange={(e) => setDataSource(e.target.value as any)}
                            className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm focus:outline-none focus:border-white/30"
                        >
                            <option value="consolidated">Real Consolidated</option>
                            <option value="simulated">Simulated Data</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Gender</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as any)}
                            className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm focus:outline-none focus:border-white/30"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    {dataSource === 'simulated' && (
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Activity Level</label>
                            <select
                                value={activity}
                                onChange={(e) => setActivity(e.target.value as any)}
                                className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm focus:outline-none focus:border-white/30"
                            >
                                <option value="low">Low</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    )}

                    <div className="flex items-end">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="bg-white text-black font-bold px-4 py-1.5 md:px-6 md:py-2 rounded-lg text-xs md:text-sm hover:bg-white/90 transition-colors uppercase"
                        >
                            {isPlaying ? 'Pause' : 'Play'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 h-auto">
                {/* Silhouette - Shown FIRST on mobile, middle on desktop */}
                <div className="order-1 md:order-2 md:col-span-6 glass relative flex items-center justify-center min-h-[400px] md:h-full">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] pointer-events-none" />
                    <HumanSilhouette
                        gender={gender}
                        hr={current.heart_rate}
                        br={current.breathing_rate}
                        spo2={current.spo2}
                        gsr={current.gsr}
                    />

                    {current.fall_detected && (
                        <div className="absolute inset-0 bg-red-500/20 border-4 border-red-500 animate-pulse flex items-center justify-center pointer-events-none z-20">
                            <span className="text-2xl md:text-4xl font-black text-red-500 drop-shadow-2xl">FALL DETECTED</span>
                        </div>
                    )}

                    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 flex flex-col pointer-events-none">
                        <span className="text-white/40 text-[8px] md:text-[10px] uppercase font-bold">Current Posture</span>
                        <span className="text-lg md:text-2xl font-black">{current.posture}</span>
                    </div>

                    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 text-right flex flex-col pointer-events-none">
                        <span className="text-white/40 text-[8px] md:text-[10px] uppercase font-bold">Playback</span>
                        <span className="font-mono text-xs md:text-sm">{Math.floor(current.timestamp / 60)}:{String(current.timestamp % 60).padStart(2, '0')}</span>
                    </div>
                </div>

                {/* Left Column Metrics */}
                <div className="order-2 md:order-1 md:col-span-3 flex flex-col gap-4 pb-4 md:pb-8">
                    <MetricWidget
                        label="Heart Rate"
                        value={current.heart_rate.toFixed(0)}
                        unit="BPM"
                        color="var(--color-hr-pulse)"
                        trend={current.heart_rate > 90 ? 'up' : 'stable'}
                        history={getHistory('heart_rate')}
                        isGenerated={current.heart_rate_gen}
                        source={current.heart_rate_source}
                    />
                    <MetricWidget
                        label="SPO2"
                        value={current.spo2.toFixed(1)}
                        unit="%"
                        color="var(--color-spo2)"
                        trend={current.spo2 < 95 ? 'down' : 'stable'}
                        history={getHistory('spo2')}
                        isGenerated={current.spo2_gen}
                        source={current.spo2_source}
                    />
                    <MetricWidget
                        label="Breathing"
                        value={current.breathing_rate.toFixed(0)}
                        unit="RPM"
                        color="var(--color-br)"
                        history={getHistory('breathing_rate')}
                        isGenerated={current.breathing_rate_gen}
                        source={current.breathing_rate_source}
                    />
                    <MetricWidget
                        label="GSR"
                        value={current.gsr.toFixed(2)}
                        unit="μS"
                        color="var(--color-gsr)"
                        history={getHistory('gsr')}
                        isGenerated={current.gsr_gen}
                        source={current.gsr_source}
                    />
                </div>

                {/* Right Column Metrics */}
                <div className="order-3 md:col-span-3 flex flex-col gap-4 pb-8">
                    <MetricWidget
                        label="Temperature"
                        value={current.temperature.toFixed(1)}
                        unit="°C"
                        color="var(--color-temp)"
                        history={getHistory('temperature')}
                        isGenerated={current.temperature_gen}
                        source={current.temperature_source}
                    />
                    <MetricWidget
                        label="Dehydration"
                        value={current.dehydration_index.toFixed(1)}
                        unit="/ 10"
                        color="var(--color-dehyd)"
                        history={getHistory('dehydration_index')}
                        isGenerated={current.dehydration_index_gen}
                        source={current.dehydration_index_source}
                    />
                    <MetricWidget
                        label="Step Count"
                        value={current.steps.toLocaleString()}
                        unit="Steps"
                        color="#ffffff"
                        history={getHistory('steps')}
                        isGenerated={current.steps_gen}
                        source={current.steps_source}
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
