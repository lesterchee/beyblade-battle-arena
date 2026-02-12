'use client';

import { useBattleEngine } from '@/hooks/useBattleEngine';
import { Beyblade } from '@/types/game';
import { BattleScene } from '@/components/arena/BattleScene';
import { BattleHUD } from '@/components/hud/BattleHUD';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface BattleViewProps {
    playerBlade: Beyblade;
    opponentBlade: Beyblade;
    onExit: () => void;
    onMatchComplete?: (winnerId: string | 'draw') => void;
    isTournament?: boolean;
}

export function BattleView({ playerBlade, opponentBlade, onExit, onMatchComplete, isTournament }: BattleViewProps) {
    const { state, startBattle, resetBattle } = useBattleEngine(playerBlade, opponentBlade);

    useEffect(() => {
        // Auto start battle on mount
        startBattle();
    }, []);

    useEffect(() => {
        if (state.status === 'finished' && isTournament && onMatchComplete && state.winner) {
            const timeout = setTimeout(() => {
                onMatchComplete(state.winner!);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [state.status, isTournament, onMatchComplete, state.winner]);

    return (
        <div className="relative w-full h-[80vh] bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* 3D Scene Layer */}
            <div className="absolute inset-0 z-0">
                <BattleScene state={state} player={playerBlade} opponent={opponentBlade} />
            </div>

            {/* HUD Layer (UI Overlay) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <BattleHUD state={state} player={playerBlade} opponent={opponentBlade} />
            </div>

            {/* Controls / Result Overlay */}
            {state.status === 'finished' && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-sm pointer-events-auto">
                    <div className="text-center">
                        <h2 className="text-6xl font-orbitron font-bold text-yellow-400 mb-4 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                            {state.winner === 'draw' ? 'DRAW!' : 'VICTORY!'}
                        </h2>

                        {state.winner !== 'draw' && (
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-32 h-32 rounded-full border-4 border-yellow-400 overflow-hidden mb-4 shadow-[0_0_30px_rgba(234,179,8,0.5)]">
                                    <img
                                        src={state.winner === playerBlade.id ? playerBlade.image : opponentBlade.image}
                                        alt="Winner"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <p className="text-3xl font-oswald text-white uppercase tracking-widest drop-shadow-md">
                                    {state.winner === playerBlade.id ? playerBlade.name : opponentBlade.name} Wins!
                                </p>
                            </div>
                        )}

                        {!isTournament && (
                            <div className="flex gap-4 justify-center">
                                <Button onClick={() => { resetBattle(); startBattle(); }}>Rematch</Button>
                                <Button variant="secondary" onClick={onExit}>Main Menu</Button>
                            </div>
                        )}

                        {isTournament && (
                            <div className="text-xl text-white animate-pulse">
                                Proceeding to Bracket...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
