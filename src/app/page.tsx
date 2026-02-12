'use client';

import { useState } from 'react';
import { BeybladeCard } from '@/components/features/BeybladeCard';
import { BEYBLADE_ROSTER } from '@/lib/constants';
import { Beyblade } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { BattleView } from '@/components/features/BattleView';
import { BeybladeCustomizer } from '@/components/features/BeybladeCustomizer';
import { motion, AnimatePresence } from 'framer-motion';

// Phase: 'selection' | 'battle' | 'result'
type CheckPhase = 'selection' | 'battle' | 'result';

export default function GamePage() {
  const [phase, setPhase] = useState<CheckPhase>('selection');
  const [playerBlade, setPlayerBlade] = useState<Beyblade | null>(null);
  const [opponentBlade, setOpponentBlade] = useState<Beyblade | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleSelect = (blade: Beyblade) => {
    if (!playerBlade) {
      setPlayerBlade(blade);
    } else if (!opponentBlade && blade.id !== playerBlade.id) {
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
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center relative overflow-hidden">

      {/* Title */}
      <header className="mb-8 text-center z-10 relative">
        <h1 className="text-4xl md:text-6xl font-orbitron font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          BEYBLADE ARENA
        </h1>
        <p className="text-slate-400 font-oswald tracking-[0.2em] text-sm uppercase mt-2">
          Simulator v2.0 // Next.js Edition
        </p>
      </header>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl flex-1 flex flex-col z-10">

        <AnimatePresence mode="wait">
          {phase === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-8"
            >
              {/* Status Bar */}
              <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex gap-4">
                  <div className="text-sm">
                    <span className="text-slate-500 block mb-1">PLAYER 1</span>
                    {playerBlade ? (
                      <span className="text-blue-400 font-bold">{playerBlade.name}</span>
                    ) : (
                      <span className="text-slate-600 animate-pulse">Select Beyblade...</span>
                    )}
                  </div>
                  <div className="w-px bg-slate-700 mx-2" />
                  <div className="text-sm">
                    <span className="text-slate-500 block mb-1">OPPONENT</span>
                    {opponentBlade ? (
                      <span className="text-red-400 font-bold">{opponentBlade.name}</span>
                    ) : (
                      <span className="text-slate-600">
                        {playerBlade ? 'Select Opponent...' : 'Waiting for P1...'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={resetSelection} disabled={!playerBlade}>
                    Reset
                  </Button>

                  {playerBlade && (
                    <Button variant="secondary" onClick={() => setIsCustomizing(true)}>
                      Customize
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    onClick={startBattle}
                    disabled={!playerBlade || !opponentBlade}
                    className="w-32"
                  >
                    LET IT RIP!
                  </Button>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {BEYBLADE_ROSTER.map((blade) => {
                  const isP1 = playerBlade?.id === blade.id;
                  const isP2 = opponentBlade?.id === blade.id;
                  const isSelected = isP1 || isP2;

                  return (
                    <BeybladeCard
                      key={blade.id}
                      blade={blade}
                      isSelected={isSelected}
                      onClick={() => handleSelect(blade)}
                      disabled={!!(playerBlade && opponentBlade && !isSelected) || (!!playerBlade && blade.id === playerBlade.id && !opponentBlade)}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {phase === 'battle' && playerBlade && opponentBlade && (
            <motion.div
              key="battle"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              <BattleView
                playerBlade={playerBlade}
                opponentBlade={opponentBlade}
                onExit={() => setPhase('selection')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customizer Overlay */}
        <AnimatePresence>
          {isCustomizing && playerBlade && (
            <BeybladeCustomizer
              blade={playerBlade}
              onClose={() => setIsCustomizing(false)}
              onUpdate={setPlayerBlade}
            />
          )}
        </AnimatePresence>

      </div>

    </main>
  );
}
