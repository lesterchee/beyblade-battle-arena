export type Stat = 'ATK' | 'DEF' | 'STA' | 'SPD';

export interface BeybladeStats {
  ATK: number;
  DEF: number;
  STA: number; // Max HP / Stamina
  SPD: number; // Action frequency
}

export interface Beyblade {
  id: string;
  name: string;
  type: 'Attack' | 'Defense' | 'Stamina' | 'Balance';
  stats: BeybladeStats;
  color: string; // Hex for UI/Three.js
  image?: string; // For selection card
}

export type BattleEventType = 
  | 'start' 
  | 'clash' 
  | 'critical' 
  | 'miss' 
  | 'special' 
  | 'win' 
  | 'loss' 
  | 'draw';

export interface BattleLog {
  id: string;
  timestamp: number;
  message: string;
  type: BattleEventType;
  damage?: number;
  source?: string; // Blade ID
}

export interface BattleState {
  playerHP: number;
  opponentHP: number;
  playerMaxHP: number;
  opponentMaxHP: number;
  timer: number;
  logs: BattleLog[];
  status: 'idle' | 'fighting' | 'finished';
  winner: string | null; // Blade ID or 'draw'
}
