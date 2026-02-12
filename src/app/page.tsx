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

// Phase: 'selection' | 'battle' | 'result' | 'tournament'
type CheckPhase = 'selection' | 'battle' | 'result' | 'tournament';

export default function GamePage() {
  const [phase, setPhase] = useState<CheckPhase>('selection');
  const [playerBlade, setPlayerBlade] = useState<Beyblade | null>(null);
  const [opponentBlade, setOpponentBlade] = useState<Beyblade | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleSelect = (blade: Beyblade) => {
    if (playerBlade?.id === blade.id) {
      setPlayerBlade(null);
    } else if (opponentBlade?.id === blade.id) {
      setOpponentBlade(null);
    } else if (!playerBlade) {
      setPlayerBlade(blade);
    } else if (!opponentBlade) {
      setOpponentBlade(blade);
    }
  };

  const resetSelection = () => {
    setPlayerBlade(null);
    setOpponentBlade(null);
  };

  const startBattle = () => {
    if (playerBlade && opponentBlade) {
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
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                  {/* Player 1 Slot */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className={cn("w-3 h-12 skew-x-[-12deg]", playerBlade ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" : "bg-slate-700")} />
                    <div className="flex flex-col">
                      <span className="text-xs font-barlow font-bold text-slate-400 tracking-widest uppercase">Player One</span>
                      <span className={cn("text-2xl md:text-4xl font-barlow font-black italic uppercase", playerBlade ? "text-white" : "text-slate-600")}>
                        {playerBlade?.name || "Select Blade"}
                      </span>
                    </div>
                  </div>

                  {/* VS Emblem */}
                  <div className="text-4xl font-barlow font-black italic text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] z-10">
                    VS
                  </div>

                  {/* Opponent Slot */}
                  <div className="flex-1 flex items-center justify-end gap-4 text-right">
                    <div className="flex flex-col">
                      <span className="text-xs font-barlow font-bold text-slate-400 tracking-widest uppercase">Opponent</span>
                      <span className={cn("text-2xl md:text-4xl font-barlow font-black italic uppercase", opponentBlade ? "text-white" : "text-slate-600")}>
                        {opponentBlade?.name || "Waiting..."}
                      </span>
                    </div>
                    <div className={cn("w-3 h-12 skew-x-[-12deg]", opponentBlade ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" : "bg-slate-700")} />
                  </div>
                </div>

                {/* Actions Row */}
                <div className="mt-6 flex flex-wrap justify-center items-center gap-4 border-t-2 border-white/5 pt-4">
                  <Button variant="ghost" size="sm" onClick={resetSelection} disabled={!playerBlade}>
                    RESET
                  </Button>
                  {playerBlade && (
                    <Button variant="secondary" size="sm" onClick={() => setIsCustomizing(true)}>
                      CUSTOMIZE
                    </Button>
                  )}
                  <div className="w-px h-8 bg-white/10 mx-2" />
                  <Button
                    variant="primary"
                    size="xl"
                    onClick={startBattle}
                    disabled={!playerBlade || !opponentBlade}
                    className={cn("w-64 transition-all", (!playerBlade || !opponentBlade) && "opacity-50 blur-[2px]")}
                  >
                    LET IT RIP!
                  </Button>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex justify-center -mt-4">
                <Button
                  onClick={() => setPhase('tournament')}
                  variant="outline"
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                >
                  🏆 TOURNAMENT MODE
                </Button>
              </div>

              {/* Roster Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-12 perspective-1000">
                {BEYBLADE_ROSTER.map((blade, index) => {
                  const isP1 = playerBlade?.id === blade.id;
                  const isP2 = opponentBlade?.id === blade.id;
                  const isSelected = isP1 || isP2;

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
                        disabled={!!playerBlade && !!opponentBlade && !isSelected}
                      />
                    </motion.div>
                  );
                })}
              </div>

            </motion.div>
          )}

          {phase === 'battle' && playerBlade && opponentBlade && (
            <BattleView
              playerBlade={playerBlade}
              opponentBlade={opponentBlade}
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
        {isCustomizing && playerBlade && (
          <BeybladeCustomizer
            blade={playerBlade}
            onClose={() => setIsCustomizing(false)}
            onUpdate={setPlayerBlade}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
