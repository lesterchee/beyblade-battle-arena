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
        <div className="relative h-full w-full p-4 md:p-8 pointer-events-none overflow-hidden">

            {/* Top Center: Timer */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="bg-black/90 text-white px-8 py-2 border-b-4 border-blue-500 skew-x-[-15deg] shadow-[0_0_20px_rgba(59,130,246,0.6)]">
                    <span className="block text-5xl font-barlow font-black italic min-w-[3ch] text-center skew-x-[15deg] drop-shadow-md">
                        {Math.ceil(state.timer)}
                    </span>
                </div>
                <span className="text-[10px] font-barlow font-bold tracking-[0.3em] pt-1 text-slate-300 uppercase drop-shadow">Time Remaining</span>
            </div>

            {/* Top Left: Player Card */}
            <div className="absolute top-4 left-4 md:left-8 z-10">
                <HealthBar
                    blade={player}
                    hp={state.participants[player.id]?.hp ?? state.playerHP}
                    maxHp={state.participants[player.id]?.maxHP ?? state.playerMaxHP}
                    align="left"
                    isPlayer={true}
                />
            </div>

            {/* Top Right: Opponent Card */}
            <div className="absolute top-4 right-4 md:right-8 z-10">
                <HealthBar
                    blade={opponent}
                    hp={state.participants[opponent.id]?.hp ?? state.opponentHP}
                    maxHp={state.participants[opponent.id]?.maxHP ?? state.opponentMaxHP}
                    align="right"
                    isPlayer={false}
                />
            </div>

            {/* Bottom Right: Battle Log */}
            <div className="absolute bottom-4 right-4 md:right-8 z-10 flex flex-col items-end">
                <h4 className="text-xs font-barlow font-bold text-slate-500 uppercase tracking-widest mb-1 mr-1">Battle Feed</h4>
                <div
                    ref={logContainerRef}
                    className="w-80 h-48 bg-black/70 backdrop-blur-md p-3 border-r-4 border-yellow-500 font-mono text-xs space-y-1 mask-linear-fade pointer-events-auto overflow-y-auto shadow-xl"
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

        </div>
    );
}
// HealthBar component remains exactly the same
function HealthBar({ blade, hp, maxHp, align, isPlayer }: { blade: Beyblade, hp: number, maxHp: number, align: 'left' | 'right', isPlayer: boolean }) {
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
