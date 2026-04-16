"use client"

import React from 'react'

interface SilhouetteProps {
    gender: 'male' | 'female';
    hr: number;
    br: number;
}

export const HumanSilhouette: React.FC<SilhouetteProps> = ({ gender, hr, br }) => {
    const hrDuration = `${60 / hr}s`;
    const brDuration = `${60 / br}s`;

    return (
        <div className="relative flex items-center justify-center w-full h-full max-h-[80vh]">
            <svg
                viewBox="0 0 200 500"
                className="h-full w-auto drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
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
                    cy="160"
                    rx="30"
                    ry="40"
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
