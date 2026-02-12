'use client';

import { useTournament, TournamentMatch } from '@/hooks/useTournament';
import { Beyblade } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BattleView } from './BattleView';
import { cn } from '@/lib/utils';
import { audioManager } from '@/lib/audio';

interface TournamentViewProps {
    onExit: () => void;
}

export function TournamentView({ onExit }: TournamentViewProps) {
    const { tournament, initializeTournament, advanceTournament, getCurrentMatch } = useTournament();
    const [activeBattle, setActiveBattle] = useState<TournamentMatch | null>(null);

    useEffect(() => {
        initializeTournament();
    }, [initializeTournament]);

    const handleStartMatch = () => {
        const match = getCurrentMatch();
        if (match) {
            setActiveBattle(match);
        }
    };

    const handleBattleEnd = (winnerId: string | 'draw') => {
        if (!activeBattle) return;

        // In tournament, draws might need tie-breaker, but for now let's just pick p1 or random?
        // Or re-roll. Let's assume re-roll or p1 for simplicity to keep flow moving.
        // Actually, if draw, restart match?
        if (winnerId === 'draw') {
            // Restart same match
            // audioManager.play('draw')?
            return;
        }

        // Delay to show victory screen then go back to bracket
        setTimeout(() => {
            advanceTournament(activeBattle.id, winnerId);
            setActiveBattle(null);
        }, 3000);
    };

    if (!tournament) return <div className="text-white text-center">Loading Tournament...</div>;

    if (activeBattle && activeBattle.p1 && activeBattle.p2) {
        return (
            <div className="fixed inset-0 z-50 bg-black">
                <BattleView
                    playerBlade={activeBattle.p1}
                    opponentBlade={activeBattle.p2}
                    onExit={() => setActiveBattle(null)} // Forfeit?
                    onMatchComplete={handleBattleEnd}
                    isTournament={true}
                />
            </div>
        );
    }

    return (
        <div className="w-full h-full p-8 flex flex-col items-center overflow-y-auto">
            <h2 className="text-4xl font-orbitron text-yellow-500 mb-8 drop-shadow-lg">TOURNAMENT BRACKET</h2>

            {tournament.champion ? (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center p-12 bg-gradient-to-b from-yellow-500/20 to-black rounded-3xl border border-yellow-500"
                >
                    <h1 className="text-6xl mb-4">CHAMPION</h1>
                    <div className="w-48 h-48 mx-auto rounded-full border-4 border-yellow-400 overflow-hidden mb-4 shadow-[0_0_50px_rgba(234,179,8,0.5)]">
                        <img src={tournament.champion.image} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-3xl font-bold text-yellow-300">{tournament.champion.name}</h3>
                    <Button className="mt-8" onClick={onExit}>Return to Menu</Button>
                </motion.div>
            ) : (
                <div className="w-full max-w-6xl flex gap-8 justify-center items-center">
                    {/* Quarter Finals Column */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-center text-slate-500 mb-4">QUARTER FINALS</h3>
                        {tournament.matches.slice(0, 4).map(m => <MatchCard key={m.id} match={m} />)}
                    </div>

                    {/* Connectors */}
                    <div className="h-full w-8 border-r border-slate-700" />

                    {/* Semi Finals Column */}
                    <div className="flex flex-col gap-24">
                        <h3 className="text-center text-slate-500 mb-4">SEMI FINALS</h3>
                        {tournament.matches.slice(4, 6).map(m => <MatchCard key={m.id} match={m} />)}
                    </div>

                    {/* Connectors */}
                    <div className="h-full w-8 border-r border-slate-700" />

                    {/* Final Column */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-center text-yellow-600 mb-4">FINAL</h3>
                        <MatchCard match={tournament.matches[6]} isFinal />
                    </div>
                </div>
            )}

            {!tournament.champion && (
                <div className="fixed bottom-8 flex gap-4">
                    <Button variant="outline" onClick={onExit}>Exit Tournament</Button>
                    <Button
                        variant="primary"
                        className="px-8 py-4 text-xl bg-yellow-600 hover:bg-yellow-500"
                        onClick={handleStartMatch}
                        disabled={!getCurrentMatch()}
                    >
                        {getCurrentMatch() ? 'START NEXT MATCH' : 'Generating Next Round...'}
                    </Button>
                </div>
            )}
        </div>
    );
}

function MatchCard({ match, isFinal }: { match: TournamentMatch, isFinal?: boolean }) {
    return (
        <Card className={cn(
            "w-64 p-3 bg-slate-900 border-slate-700",
            isFinal && "border-yellow-600 bg-slate-900/80"
        )}>
            <div className={cn("flex justify-between items-center mb-2 p-2 rounded", match.winner?.id === match.p1?.id ? "bg-green-900/30" : "")}>
                <span className={cn("text-sm truncate", !match.p1 && "text-slate-600")}>{match.p1?.name || 'TBD'}</span>
                {match.winner?.id === match.p1?.id && <span className="text-green-500">✓</span>}
            </div>
            <div className="h-px bg-slate-700 my-1" />
            <div className={cn("flex justify-between items-center p-2 rounded", match.winner?.id === match.p2?.id ? "bg-green-900/30" : "")}>
                <span className={cn("text-sm truncate", !match.p2 && "text-slate-600")}>{match.p2?.name || 'TBD'}</span>
                {match.winner?.id === match.p2?.id && <span className="text-green-500">✓</span>}
            </div>
        </Card>
    );
}
