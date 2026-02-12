import { useBattleEngine } from '@/hooks/useBattleEngine';
import { Beyblade } from '@/types/game';
import { BattleScene } from '@/components/arena/BattleScene';
import { BattleHUD } from '@/components/hud/BattleHUD';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { audioManager } from '@/lib/audio';

interface BattleViewProps {
    playerBlade: Beyblade;
    opponentBlade: Beyblade;
    onExit: () => void;
    onMatchComplete?: (winnerId: string | 'draw') => void;
    isTournament?: boolean;
}

export function BattleView({ playerBlade, opponentBlade, onExit, onMatchComplete, isTournament }: BattleViewProps) {
    const { state, startBattle, resetBattle } = useBattleEngine(playerBlade, opponentBlade);
    const [shake, setShake] = useState(0);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        // Auto start battle on mount
        startBattle();

        // Initial Impact Shake
        setShake(50);
        const t = setTimeout(() => setShake(0), 500);
        return () => clearTimeout(t);
    }, []);

    // Handle Victory Sequence (Delay + Voice)
    useEffect(() => {
        if (state.status === 'finished' && state.winner) {
            const timer = setTimeout(() => {
                setShowResult(true);

                // Announcer Voice
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    // Cancel any previous speech
                    window.speechSynthesis.cancel();

                    const winnerName = state.winner === playerBlade.id ? playerBlade.name : opponentBlade.name;
                    const text = state.winner === 'draw'
                        ? "It's a Draw!"
                        : `Victory! ${winnerName} Wins!`;

                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = 1.1; // Slightly faster/energetic
                    utterance.pitch = 1.0;
                    utterance.volume = 1.0;

                    // Try to select a better voice if available (e.g., Google US English)
                    const voices = window.speechSynthesis.getVoices();
                    const energeticVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
                    if (energeticVoice) utterance.voice = energeticVoice;

                    window.speechSynthesis.speak(utterance);
                }

            }, 1000); // 1 second delay before showing result

            return () => clearTimeout(timer);
        } else if (state.status === 'fighting') {
            setShowResult(false);
        }
    }, [state.status, state.winner, playerBlade, opponentBlade]);

    // Tournament Auto-Advance
    useEffect(() => {
        if (showResult && isTournament && onMatchComplete && state.winner) {
            const timeout = setTimeout(() => {
                onMatchComplete(state.winner!);
            }, 3000); // Wait 3 seconds after result is shown
            return () => clearTimeout(timeout);
        }
    }, [showResult, isTournament, onMatchComplete, state.winner]);

    return (
        <motion.div
            className="relative w-[80vw] md:w-full h-[80vh] mx-auto bg-black rounded-sm overflow-hidden border-4 border-black shadow-2xl"
            animate={{ x: shake > 0 ? [0, -10, 10, -5, 5, 0] : 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* 3D Scene Layer */}
            <div className="absolute inset-0 z-0 bg-[#0a0a20]">
                {/* Scanline Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none z-10" />

                <BattleScene state={state} player={playerBlade} opponent={opponentBlade} />
            </div>

            {/* HUD Layer (UI Overlay) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <BattleHUD state={state} player={playerBlade} opponent={opponentBlade} />
            </div>

            {/* Controls / Result Overlay */}
            <AnimatePresence>
                {showResult && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 pointer-events-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.5, rotate: -5 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-center"
                        >
                            <h2 className="text-8xl font-barlow font-black italic text-yellow-500 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.8)] stroke-black text-stroke">
                                {state.winner === 'draw' ? 'DRAW!' : 'VICTORY!'}
                            </h2>

                            {state.winner !== 'draw' && (
                                <div className="flex flex-col items-center mb-8">
                                    <motion.div
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                        className="w-40 h-40 rounded-full border-4 border-yellow-400 overflow-hidden mb-4 shadow-[0_0_50px_rgba(234,179,8,0.5)] bg-slate-800"
                                    >
                                        <img
                                            src={state.winner === playerBlade.id ? playerBlade.image : opponentBlade.image}
                                            alt="Winner"
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                    <p className="text-4xl font-barlow font-bold italic text-white uppercase tracking-wider drop-shadow-md">
                                        {state.winner === playerBlade.id ? playerBlade.name : opponentBlade.name} Wins!
                                    </p>
                                </div>
                            )}

                            {!isTournament && (
                                <div className="flex gap-6 justify-center">
                                    <Button size="lg" onClick={() => { setShowResult(false); resetBattle(); startBattle(); }}>REMATCH</Button>
                                    <Button variant="secondary" size="lg" onClick={onExit}>EXIT ARENA</Button>
                                </div>
                            )}

                            {isTournament && (
                                <div className="text-2xl text-blue-400 font-barlow font-bold animate-pulse">
                                    ADVANCING TO BRACKET...
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
