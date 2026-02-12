'use client';

import { Beyblade, Stat } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { RadarChart } from '@/components/ui/RadarChart';
import { Beyblade3D } from '@/components/arena/Beyblade3D';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

interface CustomizerProps {
    blade: Beyblade;
    onUpdate: (updatedBlade: Beyblade) => void;
    onClose: () => void;
}

export function BeybladeCustomizer({ blade, onUpdate, onClose }: CustomizerProps) {
    const [stats, setStats] = useState(blade.stats);
    const [color, setColor] = useState(blade.color);
    const [previewBlade, setPreviewBlade] = useState({ ...blade, stats, color });

    // Sliders config
    const STAT_LABELS: Stat[] = ['ATK', 'DEF', 'STA', 'SPD'];

    const handleChange = (stat: Stat, value: number) => {
        const newStats = { ...stats, [stat]: value };
        setStats(newStats);
        setPreviewBlade(prev => ({ ...prev, stats: newStats }));
    };

    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        setPreviewBlade(prev => ({ ...prev, color: newColor }));
    };

    const handleAutoTune = () => {
        // Randomize stats with animation effect (simulated)
        const randomStat = () => Math.floor(Math.random() * 80) + 20;
        const newStats = {
            ATK: randomStat(),
            DEF: randomStat(),
            STA: randomStat(),
            SPD: randomStat()
        };
        setStats(newStats);
        setPreviewBlade(prev => ({ ...prev, stats: newStats }));

        // Random Color
        const colors = ['#ef4444', '#3b82f6', '#eab308', '#84cc16', '#a855f7', '#ec4899'];
        handleColorChange(colors[Math.floor(Math.random() * colors.length)]);
    };

    const handleSave = () => {
        onUpdate({ ...blade, stats, color });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8">
            {/* Main Dashboard Container */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-6xl h-[80vh] flex flex-col md:flex-row bg-[#0a0a20] border-2 border-slate-700 relative overflow-hidden shadow-2xl skew-x-[-1deg]"
            >
                {/* Scanning Line Animation */}
                <motion.div
                    className="absolute inset-x-0 h-[2px] bg-blue-500/50 shadow-[0_0_10px_#3b82f6] z-0 pointer-events-none"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                />

                {/* LEFT COLUMN: Data & Stats */}
                <div className="w-full md:w-1/3 p-6 border-r border-slate-700 bg-black/40 flex flex-col gap-6 relative z-10">
                    <div className="text-xs text-blue-400 font-mono mb-2">:: SYSTEM.ANALYSIS_MODE ::</div>

                    <h2 className="text-4xl font-barlow font-black italic text-white uppercase break-words">
                        {blade.name}
                    </h2>

                    {/* Radar Chart */}
                    <div className="flex justify-center py-4 bg-slate-900/50 rounded-lg border border-slate-800 relative">
                        <div className="absolute top-2 left-2 text-[10px] text-slate-500">PERFORMANCE_PROFILER</div>
                        <RadarChart stats={stats} color={color} />
                    </div>

                    {/* Slider Controls */}
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {STAT_LABELS.map((stat) => (
                            <div key={stat} className="group">
                                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 group-hover:text-blue-400 transition-colors">
                                    <span>{stat} MODULE</span>
                                    <span className="font-mono">{stats[stat]}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="1"
                                    value={stats[stat]}
                                    onChange={(e) => handleChange(stat, parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-none appearance-none cursor-pointer accent-blue-500 hover:accent-white transition-all"
                                />
                            </div>
                        ))}
                    </div>

                    <Button variant="outline" onClick={handleAutoTune} className="w-full text-yellow-400 border-yellow-500 hover:bg-yellow-500/10">
                        ⚡ AUTO-TUNE SYSTEM
                    </Button>
                </div>

                {/* CENTER COLUMN: 3D Visualization */}
                <div className="flex-1 relative bg-gradient-to-b from-slate-900 to-black">
                    {/* 3D Canvas */}
                    <div className="absolute inset-0 z-0">
                        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 5, 10], fov: 45 }}>
                            <Stage environment="city" intensity={0.5}>
                                <Beyblade3D blade={previewBlade} />
                            </Stage>
                            <OrbitControls autoRotate autoRotateSpeed={2} enableZoom={false} />
                        </Canvas>
                    </div>

                    {/* Overlay info */}
                    <div className="absolute top-4 right-4 text-right pointer-events-none">
                        <div className="text-xs text-slate-500 font-mono">MODEL_VIEWER_V1.0</div>
                        <div className="text-xl font-barlow font-bold text-white tracking-widest">LIVE PREVIEW</div>
                    </div>

                    {/* Grid overlay */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
                </div>

                {/* RIGHT COLUMN: Part Picker & Actions */}
                <div className="w-full md:w-1/4 p-6 border-l border-slate-700 bg-black/40 flex flex-col gap-6 relative z-10">
                    <div className="text-xs text-red-400 font-mono mb-2">:: GEAR_SELECTION ::</div>

                    {/* Color Picker (Simulating Parts) */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-300 uppercase">Energy Layer Color</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {['#ef4444', '#3b82f6', '#eab308', '#84cc16', '#a855f7', '#ec4899', '#ffffff', '#1e293b', '#06b6d4'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => handleColorChange(c)}
                                    className={cn(
                                        "w-full h-10 border-2 transition-all hover:scale-110",
                                        color === c ? "border-white shadow-[0_0_10px_white]" : "border-slate-600 hover:border-slate-400"
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto space-y-3">
                        <div className="h-px w-full bg-slate-700" />
                        <Button onClick={handleSave} className="w-full h-14 text-xl">
                            EQUIP GEAR
                        </Button>
                        <Button variant="ghost" onClick={onClose} className="w-full text-slate-400 hover:text-white">
                            CANCEL
                        </Button>
                    </div>
                </div>

                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500 z-20" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500 z-20" />
            </motion.div>
        </div>
    );
}
