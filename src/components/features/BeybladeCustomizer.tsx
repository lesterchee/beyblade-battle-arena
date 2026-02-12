'use client';

import { Beyblade, Stat } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils'; // Keep import for internal usage even if not used in JSX directly

interface CustomizerProps {
    blade: Beyblade;
    onUpdate: (updatedBlade: Beyblade) => void;
    onClose: () => void;
}

export function BeybladeCustomizer({ blade, onUpdate, onClose }: CustomizerProps) {
    // Local state for temporary changes
    const [stats, setStats] = useState(blade.stats);

    // Sliders config
    const STAT_LABELS: Stat[] = ['ATK', 'DEF', 'STA', 'SPD'];

    const handleChange = (stat: Stat, value: number) => {
        setStats(prev => ({ ...prev, [stat]: value }));
    };

    const handleSave = () => {
        onUpdate({ ...blade, stats });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md"
            >
                <Card className="bg-slate-900 border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-orbitron font-bold text-white">CUSTOMIZE GEAR</h2>
                        <div
                            className="w-8 h-8 rounded-full border border-slate-600"
                            style={{ backgroundColor: blade.color }}
                        />
                    </div>

                    <div className="space-y-6 mb-8">
                        {STAT_LABELS.map((stat) => (
                            <div key={stat} className="space-y-2">
                                <div className="flex justify-between text-sm uppercase font-bold text-slate-400">
                                    <span>{stat}</span>
                                    <span className="text-white">{stats[stat]}</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="1"
                                    value={stats[stat]}
                                    onChange={(e) => handleChange(stat, parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>
                            Apply Changes
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
