'use client';

import { BattleState, Beyblade } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface BattleHUDProps {
    state: BattleState;
    teamA: Beyblade[]; // Changed from player
    teamB: Beyblade[]; // Changed from opponent
}

export function BattleHUD({ state, teamA, teamB }: BattleHUDProps) {
    // Removed logContainerRef and its useEffect as the new log display doesn't use it for auto-scrolling
    const battleLogs = state.logs.slice(-5); // Show last 5 logs

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative h-full w-full p-4 md:p-8 pointer-events-none overflow-hidden">

            {/* Top Center: Timer */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="text-6xl font-barlow font-black italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ WebkitTextStroke: '2px black' }}>
                    {formatTime(state.timer)}
                </div>
                <div className="text-xs font-mono text-slate-400 tracking-widest uppercase bg-black/50 px-2 rounded">
                    BATTLE DURATION
                </div>
            </div>

            {/* Top Left: Team A Cards */}
            <div className="absolute top-4 left-4 md:left-8 z-10 flex flex-col gap-4">
                {teamA.map((blade, index) => (
                    <HealthBar
                        key={blade.id}
                        blade={blade}
                        hp={state.participants[blade.id]?.hp ?? 1000}
                        maxHp={state.participants[blade.id]?.maxHP ?? 1000}
                        align="left"
                        isPlayer={true}
                        index={index}
                    />
                ))}
            </div>

            {/* Top Right: Team B Cards */}
            <div className="absolute top-4 right-4 md:right-8 z-10 flex flex-col gap-4">
                {teamB.map((blade, index) => (
                    <HealthBar
                        key={blade.id}
                        blade={blade}
                        hp={state.participants[blade.id]?.hp ?? 1000}
                        maxHp={state.participants[blade.id]?.maxHP ?? 1000}
                        align="right"
                        isPlayer={false}
                        index={index}
                    />
                ))}
            </div>

            {/* Bottom Right: Battle Log */}
            <div className="absolute bottom-4 right-4 md:right-8 z-10 flex flex-col items-end">
                <AnimatePresence>
                    {battleLogs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-black/60 backdrop-blur-md px-4 py-2 mb-2 rounded border-l-4 border-blue-500 font-mono text-xs md:text-sm text-white shadow-lg max-w-[300px]"
                        >
                            <span className="text-slate-400">[{formatTime(log.timestamp / 1000 % 60)}]</span> {log.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

        </div>
    );
}
// HealthBar component with Signature Colors
function HealthBar({ blade, hp, maxHp, align, isPlayer, index = 0 }: { blade: Beyblade, hp: number, maxHp: number, align: 'left' | 'right', isPlayer: boolean, index?: number }) {
    const percent = Math.max(0, (hp / maxHp) * 100);
    const isCritical = percent < 30;

    // Type-based styling
    const typeColors: Record<string, string> = {
        'Attack': 'bg-red-900/80 border-red-500',
        'Defense': 'bg-green-900/80 border-green-500',
        'Stamina': 'bg-yellow-900/80 border-yellow-500',
        'Balance': 'bg-purple-900/80 border-purple-500',
    };
    const cardStyle = typeColors[blade.type] || 'bg-slate-900/80 border-slate-500';

    // Player/Opponent Glow (Electric Blue vs Crimson Red)
    const glowClass = isPlayer
        ? "shadow-[0_0_25px_rgba(59,130,246,0.6)] border-blue-400"
        : "shadow-[0_0_25px_rgba(239,68,68,0.6)] border-red-400";

    return (
        <motion.div
            initial={{ x: align === 'left' ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className={cn("flex flex-col w-full max-w-sm relative", align === 'right' && "items-end")}
        >
            {/* "YOU" Indicator */}
            {isPlayer && (
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -bottom-10 md:-right-8 right-0 flex flex-col items-center"
                >
                    {/* Moved indicator to bottom-right of card or keep top? 
                        User said "near the player's side". 
                        The previous implementation had it at top, which might overlap with absolute positioning if not careful.
                        Actually, let's keep it simple. If it's absolute top-left, putting it "-top-12" might push it off screen.
                        I should put it BELOW or to the RIGHT of the card if it's top-left.
                        Let's try putting it to the *right* of the card for Player 1? Or just below?
                        BELOW seems safer for "Top Left" positioning.
                     */}
                </motion.div>
            )}

            {/* Re-implementing Indicator inside the return to ensure correct placement */}
            {isPlayer && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -right-8 top-2 flex flex-col items-center z-20"
                >
                    <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="flex items-center gap-1"
                    >
                        <span className="text-blue-500 text-2xl">◀</span>
                        <span className="text-blue-400 font-black font-barlow text-sm tracking-widest uppercase">YOU</span>
                    </motion.div>
                </motion.div>
            )}

            {/* Header */}
            <div className={cn("flex items-end gap-3 mb-2", align === 'right' && "flex-row-reverse")}>
                {/* Avatar with Type Background */}
                <div className={cn(
                    "w-14 h-14 rounded-md border-2 overflow-hidden relative shadow-lg",
                    cardStyle,
                    glowClass
                )}>
                    {blade.image ? (
                        <img src={blade.image} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-black/50" />
                    )}
                </div>

                <div className={cn(align === 'right' && "text-right")}>
                    <h3 className="text-2xl md:text-3xl font-barlow font-black italic uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none text-stroke-sm">
                        {blade.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                        <span className="uppercase bg-black/50 px-1 rounded border border-white/10">{blade.type}</span>
                        <span className={cn(isCritical ? "text-red-500 animate-pulse" : "text-slate-400")}>
                            {Math.ceil(hp)} / {maxHp}
                        </span>
                    </div>
                </div>
            </div>

            {/* Skewed Bar Container */}
            <div className={cn(
                "w-full h-6 bg-black/60 border border-white/20 relative overflow-hidden backdrop-blur-sm",
                "skew-x-[-20deg]",
                align === 'right' && "skew-x-[20deg]"
            )}>
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30" />

                {/* Active Bar */}
                <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: `${percent}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className={cn(
                        "h-full relative",
                        isPlayer ? "bg-gradient-to-r from-blue-600 to-blue-400" : "bg-gradient-to-l from-red-600 to-red-400",
                        isCritical && "animate-pulse brightness-150"
                    )}
                >
                    {/* Gloss & Stripes */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:10px_10px]" />
                    <div className="absolute top-0 w-full h-1/2 bg-white/20" />
                </motion.div>
            </div>

        </motion.div>
    );
}
