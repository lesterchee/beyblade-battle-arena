import { useReducer, useEffect, useCallback, useRef } from 'react';
import { Beyblade, BattleState, BattleLog } from '@/types/game';
import { GAME_CONFIG } from '@/lib/constants';
import { randomInt } from '@/lib/utils';
import { audioManager } from '@/lib/audio';

type Action =
    | { type: 'START_BATTLE' }
    | { type: 'TICK'; payload: { logs: BattleLog[]; damageP1: number; damageP2: number } }
    | { type: 'END_BATTLE'; payload: { winner: string } }
    | { type: 'RESET' };

const INITIAL_HP = 1000;

const initialState: BattleState = {
    playerHP: INITIAL_HP,
    opponentHP: INITIAL_HP,
    playerMaxHP: INITIAL_HP,
    opponentMaxHP: INITIAL_HP,
    timer: GAME_CONFIG.BATTLE_DURATION_SEC,
    logs: [],
    status: 'idle',
    winner: null,
};

function battleReducer(state: BattleState, action: Action): BattleState {
    switch (action.type) {
        case 'START_BATTLE':
            return { ...initialState, status: 'fighting' };
        case 'TICK':
            const newPlayerHP = Math.max(0, state.playerHP - action.payload.damageP1);
            const newOpponentHP = Math.max(0, state.opponentHP - action.payload.damageP2);
            return {
                ...state,
                playerHP: newPlayerHP,
                opponentHP: newOpponentHP,
                logs: [...state.logs, ...action.payload.logs],
                timer: Math.max(0, state.timer - (GAME_CONFIG.TICK_RATE_MS / 1000)),
            };
        case 'END_BATTLE':
            return { ...state, status: 'finished', winner: action.payload.winner };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}

export function useBattleEngine(playerBlade: Beyblade, opponentBlade: Beyblade) {
    const [state, dispatch] = useReducer(battleReducer, initialState);
    const stateRef = useRef(state);

    // Keep ref synced with state
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const calculateDamage = useCallback((attacker: Beyblade, defender: Beyblade) => {
        const base = GAME_CONFIG.BASE_DAMAGE;
        const atkBonus = attacker.stats.ATK * 0.5;
        const defReduct = defender.stats.DEF * 0.3;
        const variance = randomInt(-5, 5);

        let damage = Math.max(1, base + atkBonus - defReduct + variance);

        // Critical hit chance based on Speed difference
        const critChance = attacker.stats.SPD > defender.stats.SPD ? 0.15 : 0.05;
        const isCrit = Math.random() < critChance;

        if (isCrit) {
            damage *= GAME_CONFIG.CRIT_MULTIPLIER;
        }

        return { damage: Math.floor(damage), isCrit };
    }, []);

    useEffect(() => {
        if (state.status !== 'fighting') return;

        const intervalId = setInterval(() => {
            const currentState = stateRef.current; // Read latest state

            // Check end conditions
            if (currentState.playerHP <= 0 || currentState.opponentHP <= 0 || currentState.timer <= 0) {
                let winner = 'draw';
                if (currentState.playerHP > currentState.opponentHP) winner = playerBlade.id;
                if (currentState.opponentHP > currentState.playerHP) winner = opponentBlade.id;

                audioManager.playWin();
                dispatch({ type: 'END_BATTLE', payload: { winner } });
                return;
            }

            // Logic: Do they clash? 
            const clashChance = 0.3;
            const willClash = Math.random() < clashChance;

            if (willClash) {
                // Audio Feedback

                const p1Hit = calculateDamage(playerBlade, opponentBlade);
                const p2Hit = calculateDamage(opponentBlade, playerBlade);

                const newLogs: BattleLog[] = [];
                const timestamp = Date.now();
                let someCrit = false;

                if (p1Hit.isCrit) {
                    someCrit = true;
                    newLogs.push({
                        id: `crit-${timestamp}-p1`,
                        timestamp,
                        message: `${playerBlade.name} CRITICAL HIT!`,
                        type: 'critical',
                        source: playerBlade.id,
                        damage: p1Hit.damage
                    });
                }

                if (p2Hit.isCrit) {
                    someCrit = true;
                    newLogs.push({
                        id: `crit-${timestamp}-p2`,
                        timestamp,
                        message: `${opponentBlade.name} CRITICAL HIT!`,
                        type: 'critical',
                        source: opponentBlade.id,
                        damage: p2Hit.damage
                    });
                }

                if (someCrit) {
                    audioManager.playCritical();
                } else {
                    audioManager.playClash();
                }

                if (!p1Hit.isCrit && !p2Hit.isCrit) {
                    newLogs.push({
                        id: `clash-${timestamp}`,
                        timestamp,
                        message: `Clash!`,
                        type: 'clash',
                    });
                }

                dispatch({
                    type: 'TICK',
                    payload: {
                        logs: newLogs,
                        damageP1: p2Hit.damage, // Player takes damage from Opponent's hit
                        damageP2: p1Hit.damage, // Opponent takes damage from Player's hit
                    },
                });
            } else {
                dispatch({
                    type: 'TICK',
                    payload: { logs: [], damageP1: 0, damageP2: 0 },
                });
            }
        }, GAME_CONFIG.TICK_RATE_MS);

        return () => clearInterval(intervalId);
    }, [state.status, playerBlade, opponentBlade, calculateDamage]);

    return {
        state,
        startBattle: () => dispatch({ type: 'START_BATTLE' }),
        resetBattle: () => dispatch({ type: 'RESET' }),
    };
}
