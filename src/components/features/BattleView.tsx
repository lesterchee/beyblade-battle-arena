import { useBattleEngine } from '@/hooks/useBattleEngine';
import { Beyblade } from '@/types/game';
import { BattleScene } from '@/components/arena/BattleScene';
import { BattleHUD } from '@/components/hud/BattleHUD';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface BattleViewProps {
    teamA: Beyblade[];
    teamB: Beyblade[];
    gameMode?: '1v1' | '2v2' | 'royal-rumble';
    onExit: () => void;
    onMatchComplete?: (winnerId: string | 'draw') => void;
    isRoyalRumble?: boolean;
    royalRumbleParticipants?: Beyblade[];
    isTournament?: boolean;
}

export function BattleView({
    teamA,
    teamB,
    gameMode = '1v1',
    onExit,
    onMatchComplete,
    isRoyalRumble,
    royalRumbleParticipants,
    isTournament
}: BattleViewProps) {

    const battleParticipants = isRoyalRumble && royalRumbleParticipants
        ? royalRumbleParticipants
        : [...teamA, ...teamB];

    const effectiveGameMode = (gameMode === 'royal-rumble') ? '2v2' : gameMode; // Royal rumble uses 2v2 engine logic for now or needs update
    const { state, startBattle, resetBattle } = useBattleEngine(teamA, teamB, effectiveGameMode);

    const [shake, setShake] = useState(0);
    const [showResult, setShowResult] = useState(false);

    // AI Summary State
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    // Initial Start
    useEffect(() => {
        const timer = setTimeout(() => {
            startBattle();
        }, 1000); // Quick start
        setShake(50); // Initial impact shake
        setTimeout(() => setShake(0), 500);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Hit Shake Effect
    useEffect(() => {
        if (state.logs.length > 0) {
            const lastLog = state.logs[state.logs.length - 1];
            if (lastLog.type === 'clash' || lastLog.type === 'critical') {
                setShake(prev => prev + 1);
            }
        }
    }, [state.logs]);

    // Result Logic
    useEffect(() => {
        if (state.status === 'finished' && state.winner) {
            const timer = setTimeout(() => {
                setShowResult(true);

                // Announcer
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();

                    const winnerObj = battleParticipants.find(b => b.id === state.winner);
                    const winnerName = winnerObj ? winnerObj.name : 'Unknown';

                    const text = state.winner === 'draw'
                        ? "It's a draw!"
                        : `${winnerName} wins!`;

                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = 1.1;
                    utterance.pitch = 1.0;

                    const voices = window.speechSynthesis.getVoices();
                    const energeticVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
                    if (energeticVoice) utterance.voice = energeticVoice;

                    window.speechSynthesis.speak(utterance);
                }

                if (onMatchComplete && state.winner) {
                    onMatchComplete(state.winner);
                }

            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [state.status, state.winner]); // eslint-disable-line react-hooks/exhaustive-deps

    // AI Summary Fetch
    useEffect(() => {
        if (showResult && state.winner && state.winner !== 'draw') {
            setIsGeneratingSummary(true);

            const winnerObj = battleParticipants.find(b => b.id === state.winner);
            const isTeamAwinner = teamA.some(b => b.id === state.winner);
            const loserObj = isTeamAwinner ? teamB[0] : teamA[0];

            if (winnerObj && loserObj) {
                fetch('/api/battle-summary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        winner: winnerObj.name,
                        loser: loserObj.name,
                        winnerStats: winnerObj.stats,
                        loserStats: loserObj.stats,
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        setAiSummary(data.summary);
                        setIsGeneratingSummary(false);
                    })
                    .catch(err => {
                        console.error("AI Summary Failed", err);
                        setIsGeneratingSummary(false);
                    });
            } else {
                setIsGeneratingSummary(false);
            }
        }
    }, [showResult, state.winner]); // eslint-disable-line react-hooks/exhaustive-deps


    const handleReset = () => {
        setShowResult(false);
        setAiSummary(null);
        resetBattle();
        onExit();
    };

    // Visuals
    const winnerBlade = state.winner ? battleParticipants.find(b => b.id === state.winner) : null;
    const teamAColor = teamA[0]?.color;
    const teamBColor = teamB[0]?.color;
    const containerGlow = winnerBlade ? winnerBlade.color : null;

    return (
        <motion.div
            className="relative w-[80vw] md:w-full h-[80vh] mx-auto bg-black rounded-sm overflow-hidden border-4 border-black transition-shadow duration-1000"
            style={{
                boxShadow: containerGlow
                    ? `0 0 50px ${containerGlow}80`
                    : `0 0 30px ${teamAColor}40, 0 0 30px ${teamBColor}40`
            }}
            animate={{ x: shake > 0 ? [0, -10, 10, -5, 5, 0] : 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* 3D Scene Layer */}
            <div className="absolute inset-0 z-0 bg-[#0a0a20]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none z-10" />
                <BattleScene state={state} blades={battleParticipants} />
            </div>

            {/* HUD Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <BattleHUD state={state} teamA={teamA} teamB={teamB} />
            </div>

            {/* Result Overlay */}
            <AnimatePresence>
                {showResult && (
                    <motion.div
                        key="result-overlay"
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 pointer-events-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.5, rotate: -5 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-center max-w-2xl px-4"
                        >
                            <h2
                                className="text-8xl font-barlow font-black italic mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] stroke-black text-stroke"
                                style={{ color: containerGlow || '#eab308' }}
                            >
                                {state.winner === 'draw' ? 'DRAW!' : 'VICTORY!'}
                            </h2>

                            {state.winner !== 'draw' && winnerBlade && (
                                <div className="flex flex-col items-center mb-8">
                                    <motion.div
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                        className="w-40 h-40 rounded-full border-4 border-yellow-400 overflow-hidden mb-4 shadow-[0_0_50px_rgba(234,179,8,0.5)] bg-slate-800"
                                    >
                                        <img
                                            src={winnerBlade.image}
                                            alt="Winner"
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                    <p className="text-4xl font-barlow font-bold italic text-white uppercase tracking-wider drop-shadow-md">
                                        {winnerBlade.name} Wins!
                                    </p>

                                    {/* AI Summary Box */}
                                    <div className="mt-6 bg-black/40 border border-white/10 p-4 rounded-lg backdrop-blur-sm max-w-lg">
                                        <h3 className="text-xs font-barlow font-bold text-blue-300 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            AI BATTLE ANALYSIS
                                        </h3>

                                        {isGeneratingSummary ? (
                                            <p className="text-slate-400 text-sm animate-pulse">Analyzing combat data...</p>
                                        ) : aiSummary ? (
                                            <p className="text-slate-200 text-sm font-mono leading-relaxed">
                                                "{aiSummary}"
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-6 justify-center mt-8">
                                {!isTournament && (
                                    <>
                                        <Button size="lg" onClick={handleReset}>REMATCH</Button>
                                        <Button variant="secondary" size="lg" onClick={onExit}>EXIT ARENA</Button>
                                    </>
                                )}

                                {isTournament && (
                                    <div className="text-2xl text-blue-400 font-barlow font-bold animate-pulse">
                                        ADVANCING TO BRACKET...
                                    </div>
                                )}
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
