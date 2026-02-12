'use client';

import { BattleState, Beyblade } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface BattleHUDProps {
    state: BattleState;
    player: Beyblade;
    opponent: Beyblade;
}

export function BattleHUD({ state, player, opponent }: BattleHUDProps) {
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [state.logs]);

    return (
        <div className="h-full flex flex-col justify-between p-6">

            {/* Top Bar: Timer & VS */}
            <div className="flex justify-between items-start">
                <div className="bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700">
                    <span className="text-2xl font-orbitron font-bold text-white">
                        {Math.ceil(state.timer)}
                    </span>
                </div>

                {/* Battle Log */}
                <div
                    ref={logContainerRef}
                    className="w-64 h-32 bg-black/50 backdrop-blur-md rounded-lg p-2 overflow-y-auto border border-slate-800 text-xs font-mono space-y-1 mask-linear-fade"
                >
                    {state.logs.map((log) => (
                        <div key={log.id} className={cn(
                            "opacity-80 animate-in fade-in slide-in-from-bottom-2",
                            log.type === 'critical' ? "text-yellow-400 font-bold" : "text-slate-300"
                        )}>
                            <span className="opacity-50">[{new Date(log.timestamp).toLocaleTimeString().slice(3, -3)}]</span> {log.message}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar: Health */}
            <div className="flex gap-12 items-end">
                {/* Player HP */}
                <HealthBar blade={player} hp={state.playerHP} maxHp={state.playerMaxHP} align="left" />

                {/* Opponent HP */}
                <HealthBar blade={opponent} hp={state.opponentHP} maxHp={state.opponentMaxHP} align="right" />
            </div>

        </div>
    );
}

function HealthBar({ blade, hp, maxHp, align }: { blade: Beyblade, hp: number, maxHp: number, align: 'left' | 'right' }) {
    const percent = (hp / maxHp) * 100;

    return (
        <div className={cn("flex-1", align === 'right' && "text-right")}>
            <div className="mb-2">
                <h3 className="text-xl font-orbitron font-bold uppercase tracking-wider text-transparent bg-clip-text" style={{
                    backgroundImage: `linear-gradient(to bottom, #fff, ${blade.color})`,
                    filter: `drop-shadow(0 0 5px ${blade.color})`
                }}>
                    {blade.name}
                </h3>
                <span className={cn("text-xs font-mono", hp < maxHp * 0.3 ? "text-red-500 animate-pulse" : "text-slate-400")}>
                    HP: {Math.ceil(hp)}/{maxHp}
                </span>
            </div>

            {/* Bar Container */}
            <div className={cn("h-4 bg-slate-800 rounded-sm skew-x-[-15deg] overflow-hidden border border-slate-700 relative", align === 'right' && "flex justify-end")}>
                <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: `${percent}%` }}
                    className={cn(
                        "h-full relative",
                        hp < maxHp * 0.3 ? "bg-red-600" : "bg-blue-600"
                    )}
                >
                    {/* Glint effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
            </div>
        </div>
    );
}
