'use client';

import { BattleState, Beyblade } from '@/types/game';
import { motion } from 'framer-motion';
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
        <div className="h-full flex flex-col justify-between p-4 md:p-8 pointer-events-none">

            {/* Top Bar: Timer & VS */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col items-center">
                    <div className="bg-black/80 text-white px-6 py-2 border-b-4 border-blue-500 skew-x-[-15deg] shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        <span className="block text-4xl font-barlow font-black italic min-w-[3ch] text-center skew-x-[15deg]">
                            {Math.ceil(state.timer)}
                        </span>
                    </div>
                    <span className="text-[10px] font-barlow font-bold tracking-widest pt-1 text-slate-400">TIME REMAINING</span>
                </div>

                {/* Battle Log */}
                <div
                    ref={logContainerRef}
                    className="w-72 h-40 bg-black/60 backdrop-blur-md p-3 border-l-4 border-yellow-500 font-mono text-xs space-y-1 mask-linear-fade pointer-events-auto overflow-y-auto"
                >
                    {state.logs.map((log) => (
                        <div key={log.id} className={cn(
                            "opacity-90 animate-in fade-in slide-in-from-right-2",
                            log.type === 'critical' ? "text-yellow-400 font-bold" : "text-slate-300"
                        )}>
                            <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString().slice(3, -3)}]</span> {log.message}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar: Health */}
            <div className="w-full grid grid-cols-2 gap-8 md:gap-32 items-end">
                {/* Player HP */}
                <HealthBar blade={player} hp={state.playerHP} maxHp={state.playerMaxHP} align="left" color="blue" />

                {/* Opponent HP */}
                <HealthBar blade={opponent} hp={state.opponentHP} maxHp={state.opponentMaxHP} align="right" color="red" />
            </div>

        </div>
    );
}

function HealthBar({ blade, hp, maxHp, align, color }: { blade: Beyblade, hp: number, maxHp: number, align: 'left' | 'right', color: 'blue' | 'red' }) {
    const percent = Math.max(0, (hp / maxHp) * 100);
    const isCritical = percent < 30;

    return (
        <div className={cn("flex flex-col w-full", align === 'right' && "items-end")}>
            {/* Header */}
            <div className={cn("flex items-end gap-4 mb-2", align === 'right' && "flex-row-reverse")}>
                <div className={cn(
                    "w-12 h-12 rounded-full border-2 overflow-hidden bg-black",
                    color === 'blue' ? "border-blue-500" : "border-red-500"
                )}>
                    {blade.image && <img src={blade.image} className="w-full h-full object-cover" />}
                </div>
                <div className={cn(align === 'right' && "text-right")}>
                    <h3 className="text-2xl font-barlow font-black italic uppercase text-white drop-shadow-md leading-none">
                        {blade.name}
                    </h3>
                    <span className={cn("font-mono text-lg font-bold", isCritical ? "text-red-500 animate-pulse" : "text-slate-400")}>
                        {Math.ceil(hp)} <span className="text-xs text-slate-600">/ {maxHp}</span>
                    </span>
                </div>
            </div>

            {/* Skewed Bar Container */}
            <div className={cn(
                "w-full h-8 bg-slate-900 border-2 border-slate-700 relative overflow-hidden",
                "skew-x-[-20deg]",
                align === 'right' && "skew-x-[20deg]"
            )}>
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                {/* Active Bar */}
                <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: `${percent}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className={cn(
                        "h-full relative",
                        color === 'blue' ? "bg-blue-600" : "bg-red-600",
                        isCritical && "animate-pulse brightness-150"
                    )}
                >
                    {/* Gloss */}
                    <div className="absolute top-0 w-full h-1/2 bg-white/20" />
                </motion.div>
            </div>

            {/* Tagline */}
            <div className={cn(
                "mt-1 text-[10px] font-bold font-barlow tracking-[0.2em] uppercase opacity-60",
                color === 'blue' ? "text-blue-400" : "text-red-400"
            )}>
                {color === 'blue' ? "PLAYER ONE" : "OPPONENT"} // SYSTEM ACTIVE
            </div>
        </div>
    );
}
