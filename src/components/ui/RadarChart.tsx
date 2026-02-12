'use client';

import { motion } from 'framer-motion';
import { BeybladeStats } from '@/types/game';

interface RadarChartProps {
    stats: BeybladeStats;
    color: string;
}

export function RadarChart({ stats, color }: RadarChartProps) {
    const max = 100;
    const size = 200;
    const center = size / 2;
    const radius = 80;

    // Calculate points for stats
    const getPoint = (value: number, angle: number) => {
        const r = (value / max) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
    };

    // Angles for ATK, DEF, STA, SPD (0, 90, 180, 270 degrees in radians)
    // Adjusted to start from top (-PI/2) and go clockwise
    const angles = [
        -Math.PI / 2,         // ATK (Top)
        0,                    // DEF (Right)
        Math.PI / 2,          // STA (Bottom)
        Math.PI               // SPD (Left)
    ];

    const polyPoints = [
        getPoint(stats.ATK, angles[0]),
        getPoint(stats.DEF, angles[1]),
        getPoint(stats.STA, angles[2]),
        getPoint(stats.SPD, angles[3]),
    ].join(' ');

    const bgPoints = [
        getPoint(100, angles[0]),
        getPoint(100, angles[1]),
        getPoint(100, angles[2]),
        getPoint(100, angles[3]),
    ].join(' ');

    return (
        <div className="relative w-[200px] h-[200px] flex items-center justify-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Background Grid */}
                {[0.25, 0.5, 0.75, 1].map((scale) => (
                    <polygon
                        key={scale}
                        points={[
                            getPoint(100 * scale, angles[0]),
                            getPoint(100 * scale, angles[1]),
                            getPoint(100 * scale, angles[2]),
                            getPoint(100 * scale, angles[3]),
                        ].join(' ')}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes */}
                {angles.map((angle, i) => {
                    const end = getPoint(100, angle);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={end.split(',')[0]}
                            y2={end.split(',')[1]}
                            stroke="#1e293b"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon */}
                <motion.polygon
                    points={polyPoints}
                    fill={color}
                    fillOpacity="0.5"
                    stroke={color}
                    strokeWidth="2"
                    initial={{ scale: 0, opacity: 0, transformOrigin: 'center' }}
                    animate={{ scale: 1, opacity: 0.5, points: polyPoints }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />

                {/* Dots at vertices */}
                <circle cx={getPoint(stats.ATK, angles[0]).split(',')[0]} cy={getPoint(stats.ATK, angles[0]).split(',')[1]} r="3" fill="white" />
                <circle cx={getPoint(stats.DEF, angles[1]).split(',')[0]} cy={getPoint(stats.DEF, angles[1]).split(',')[1]} r="3" fill="white" />
                <circle cx={getPoint(stats.STA, angles[2]).split(',')[0]} cy={getPoint(stats.STA, angles[2]).split(',')[1]} r="3" fill="white" />
                <circle cx={getPoint(stats.SPD, angles[3]).split(',')[0]} cy={getPoint(stats.SPD, angles[3]).split(',')[1]} r="3" fill="white" />
            </svg>

            {/* Labels */}
            <div className="absolute top-0 text-xs font-bold text-slate-400">ATK</div>
            <div className="absolute right-0 text-xs font-bold text-slate-400">DEF</div>
            <div className="absolute bottom-0 text-xs font-bold text-slate-400">STA</div>
            <div className="absolute left-0 text-xs font-bold text-slate-400">SPD</div>
        </div>
    );
}
