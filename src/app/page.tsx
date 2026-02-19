'use client';

import { useState } from 'react';
import { BeybladeCard } from '@/components/features/BeybladeCard';
import { BEYBLADE_ROSTER } from '@/lib/constants';
import { Beyblade } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { BattleView } from '@/components/features/BattleView';
import { BeybladeCustomizer } from '@/components/features/BeybladeCustomizer';
import { TournamentView } from '@/components/features/TournamentView';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { audioManager } from '@/lib/audio';

// Phase: 'selection' | 'battle' | 'result' | 'tournament' | 'royal-rumble'
type CheckPhase = 'selection' | 'battle' | 'result' | 'tournament' | 'royal-rumble';
type GameMode = '1v1' | '2v2';

export default function GamePage() {
  const [roster, setRoster] = useState<Beyblade[]>(BEYBLADE_ROSTER);
  const [phase, setPhase] = useState<CheckPhase>('selection');
  const [gameMode, setGameMode] = useState<GameMode>('1v1');

  // Team State
  const [teamA, setTeamA] = useState<Beyblade[]>([]);
  const [teamB, setTeamB] = useState<Beyblade[]>([]);

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customizingBlade, setCustomizingBlade] = useState<Beyblade | null>(null);

  const maxPerTeam = gameMode === '1v1' ? 1 : 2;

  const handleBladeUpdate = (updatedBlade: Beyblade) => {
    setTeamA(prev => prev.map(b => b.id === updatedBlade.id ? updatedBlade : b));
    setTeamB(prev => prev.map(b => b.id === updatedBlade.id ? updatedBlade : b));
    setRoster(prev => prev.map(b => b.id === updatedBlade.id ? updatedBlade : b));
  };

  const handleSelect = (blade: Beyblade) => {
    const inTeamA = teamA.find(b => b.id === blade.id);
    const inTeamB = teamB.find(b => b.id === blade.id);

    // Deselect if already selected
    if (inTeamA) {
      setTeamA(prev => prev.filter(b => b.id !== blade.id));
      return;
    }
    if (inTeamB) {
      setTeamB(prev => prev.filter(b => b.id !== blade.id));
      return;
    }

    // Select Logic: Fill Team A first, then Team B
    if (teamA.length < maxPerTeam) {
      setTeamA(prev => [...prev, blade]);
    } else if (teamB.length < maxPerTeam) {
      setTeamB(prev => [...prev, blade]);
    }
  };

  const resetSelection = () => {
    setTeamA([]);
    setTeamB([]);
  };

  const toggleGameMode = () => {
    setGameMode(prev => {
      const newMode = prev === '1v1' ? '2v2' : '1v1';
      resetSelection(); // Clear selection on mode switch to avoid invalid states
      return newMode;
    });
  };

  const startBattle = () => {
    if (teamA.length === maxPerTeam && teamB.length === maxPerTeam) {
      audioManager.resume();
      setPhase('battle');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center relative overflow-hidden bg-[#0a0a20] text-white">

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-600/20 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 text-center">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-6xl md:text-8xl font-barlow font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          style={{ WebkitTextStroke: '2px black' }}
        >
          Beyblade <span className="text-blue-500">X</span> Arena
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 font-barlow font-bold tracking-[0.5em] text-sm uppercase"
        >
          High-Speed Gear Sports
        </motion.p>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-7xl flex-1 flex flex-col z-10 p-4 md:p-8">
        <AnimatePresence mode="wait">
          {phase === 'selection' && (
            <motion.div
              key="selection"
              className="flex flex-col gap-8 h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            >

              {/* VS Status Bar */}
              <div className="relative bg-slate-900/80 border-y-4 border-black p-4 md:p-6 backdrop-blur-sm tech-cut shadow-2xl">

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 relative">

                  {/* Mode Toggles - Now positioned relative to content but visually above */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                    <div className="flex bg-black/90 p-1 border border-blue-500/30 backdrop-blur-md rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                      <button
                        onClick={() => gameMode !== '1v1' && toggleGameMode()}
                        className={cn(
                          "rounded-full px-8 py-3 text-lg font-barlow font-black italic transition-all duration-300",
                          gameMode === '1v1'
                            ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-105"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        1v1 DUEL
                      </button>
                      <div className="w-px bg-white/10 my-2" />
                      <button
                        onClick={() => gameMode !== '2v2' && toggleGameMode()}
                        className={cn(
                          "rounded-full px-8 py-3 text-lg font-barlow font-black italic transition-all duration-300",
                          gameMode === '2v2'
                            ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] scale-105"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        2v2 TEAM
                      </button>
                    </div>
                  </div>

                  {/* Player Team Slots */}
                  <div className="flex-1 flex flex-col gap-2">
                    <span className="text-xs font-barlow font-bold text-blue-400 tracking-widest uppercase mb-1">TEAM PLAYER {gameMode === '2v2' ? '(SELECT 2)' : ''}</span>
                    <div className="flex gap-4">
                      {Array.from({ length: maxPerTeam }).map((_, i) => (
                        <div key={i} className="flex-1 flex items-center gap-3 bg-black/40 p-2 rounded border border-blue-500/30">
                          <div className={cn("w-2 h-8 skew-x-[-12deg]", teamA[i] ? "bg-blue-500 shadow-[0_0_10px_blue]" : "bg-slate-700")} />
                          <div className="flex flex-col overflow-hidden">
                            <span className={cn("text-lg md:text-xl font-barlow font-black italic uppercase truncate", teamA[i] ? "text-white" : "text-slate-600")}>
                              {teamA[i]?.name || "EMPTY SLOT"}
                            </span>
                            {teamA[i] && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setCustomizingBlade(teamA[i]); setIsCustomizing(true); }}
                                className="text-[10px] text-blue-300 hover:text-white text-left uppercase tracking-wider"
                              >
                                Customize &gt;
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* VS Emblem */}
                  <div className="text-4xl font-barlow font-black italic text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] z-10 mx-4">
                    VS
                  </div>

                  {/* Opponent Team Slots */}
                  <div className="flex-1 flex flex-col gap-2 text-right">
                    <span className="text-xs font-barlow font-bold text-red-400 tracking-widest uppercase mb-1">OPPONENT TEAM {gameMode === '2v2' ? '(SELECT 2)' : ''}</span>
                    <div className="flex gap-4 flex-row-reverse">
                      {Array.from({ length: maxPerTeam }).map((_, i) => (
                        <div key={i} className="flex-1 flex flex-row-reverse items-center gap-3 bg-black/40 p-2 rounded border border-red-500/30">
                          <div className={cn("w-2 h-8 skew-x-[12deg]", teamB[i] ? "bg-red-500 shadow-[0_0_10px_red]" : "bg-slate-700")} />
                          <div className="flex flex-col overflow-hidden items-end">
                            <span className={cn("text-lg md:text-xl font-barlow font-black italic uppercase truncate", teamB[i] ? "text-white" : "text-slate-600")}>
                              {teamB[i]?.name || "EMPTY SLOT"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Actions Row */}
                <div className="mt-6 flex flex-wrap justify-center items-center gap-4 border-t-2 border-white/5 pt-4">
                  <Button variant="ghost" size="sm" onClick={resetSelection} disabled={teamA.length === 0 && teamB.length === 0}>
                    RESET
                  </Button>
                  <div className="w-px h-8 bg-white/10 mx-2" />
                  <Button
                    variant="primary"
                    size="xl"
                    onClick={startBattle}
                    disabled={teamA.length !== maxPerTeam || teamB.length !== maxPerTeam}
                    className={cn("w-64 transition-all", (teamA.length !== maxPerTeam || teamB.length !== maxPerTeam) && "opacity-50 blur-[2px]")}
                  >
                    LET IT RIP!
                  </Button>
                </div>
              </div>

              {/* Mode Switcher (Secondary) */}
              <div className="flex justify-center gap-4 -mt-4 opacity-50 hover:opacity-100 transition-opacity">
                {/* Kept existing buttons but moved main toggle to VS bar */}
                <Button
                  onClick={() => setPhase('tournament')}
                  variant="outline"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 scale-75"
                >
                  🏆 TOURNAMENT MODE
                </Button>
                <Button
                  onClick={() => setPhase('royal-rumble')}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/10 scale-75"
                >
                  🌪️ ROYAL RUMBLE
                </Button>
              </div>

              {/* Roster Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-12 perspective-1000">
                {roster.map((blade, index) => {
                  const isTeamA = teamA.some(b => b.id === blade.id);
                  const isTeamB = teamB.some(b => b.id === blade.id);
                  const isSelected = isTeamA || isTeamB;

                  return (
                    <motion.div
                      key={blade.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        delay: index * 0.1
                      }}
                    >
                      <BeybladeCard
                        blade={blade}
                        isSelected={isSelected}
                        onClick={() => handleSelect(blade)}
                        disabled={
                          (!isSelected && teamA.length === maxPerTeam && teamB.length === maxPerTeam) // All full
                        }
                      // Add visual indicator for which team owns it? Card component might not support it yet.
                      />
                    </motion.div>
                  );
                })}
              </div>

            </motion.div>
          )}

          {phase === 'battle' && (
            <BattleView
              teamA={teamA}
              teamB={teamB}
              gameMode={gameMode}
              onExit={() => setPhase('selection')}
            />
          )}

          {phase === 'royal-rumble' && (
            <BattleView
              teamA={[roster.find(b => b.id === 'dragoon') || roster[0]]}
              teamB={[roster.find(b => b.id === 'valtryek') || roster[4]]}
              isRoyalRumble={true}
              royalRumbleParticipants={roster}
              onExit={() => setPhase('selection')}
            />
          )}

          {phase === 'tournament' && (
            <TournamentView onExit={() => setPhase('selection')} />
          )}

        </AnimatePresence>
      </div>

      {/* Customizer Modal */}
      <AnimatePresence>
        {isCustomizing && customizingBlade && (
          <BeybladeCustomizer
            blade={customizingBlade}
            onClose={() => { setIsCustomizing(false); setCustomizingBlade(null); }}
            onUpdate={handleBladeUpdate}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
