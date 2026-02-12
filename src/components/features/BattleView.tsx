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
}

export function BattleView({ playerBlade, opponentBlade, onExit }: BattleViewProps) {
    const { state, startBattle, resetBattle } = useBattleEngine(playerBlade, opponentBlade);

    useEffect(() => {
        // Auto start battle on mount
        startBattle();
    }, []);

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
                            {state.winner === 'draw' ? 'DRAW!' : state.winner === playerBlade.id ? 'YOU WIN!' : 'DEFEAT!'}
                        </h2>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => { resetBattle(); startBattle(); }}>Rematch</Button>
                            <Button variant="secondary" onClick={onExit}>Main Menu</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
