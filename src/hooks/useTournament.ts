import { useState, useCallback } from 'react';
import { Beyblade } from '@/types/game';
import { BEYBLADE_ROSTER } from '@/lib/constants';

// Tournament Structure:
// Quarter Finals (8 players, 4 matches) -> Semi Finals (4 players, 2 matches) -> Final (2 players, 1 match) -> Winner

export type TournamentRound = 'quarter' | 'semi' | 'final' | 'winner';

export interface TournamentMatch {
    id: string;
    p1: Beyblade | null;
    p2: Beyblade | null;
    winner: Beyblade | null;
    nextMatchId?: string; // Where the winner goes
}

export interface TournamentState {
    round: TournamentRound;
    matches: TournamentMatch[];
    champion: Beyblade | null;
    currentMatchIndex: number; // Which match in the current round is active
}

export function useTournament() {
    const [tournament, setTournament] = useState<TournamentState | null>(null);

    const initializeTournament = useCallback(() => {
        // Randomize roster
        const shuffled = [...BEYBLADE_ROSTER].sort(() => 0.5 - Math.random());

        // Create Quarter Final Matches
        const matches: TournamentMatch[] = [
            { id: 'q1', p1: shuffled[0], p2: shuffled[1], winner: null, nextMatchId: 's1' },
            { id: 'q2', p1: shuffled[2], p2: shuffled[3], winner: null, nextMatchId: 's1' },
            { id: 'q3', p1: shuffled[4], p2: shuffled[5], winner: null, nextMatchId: 's2' },
            { id: 'q4', p1: shuffled[6], p2: shuffled[7], winner: null, nextMatchId: 's2' },
            // Semis placeholders
            { id: 's1', p1: null, p2: null, winner: null, nextMatchId: 'f1' },
            { id: 's2', p1: null, p2: null, winner: null, nextMatchId: 'f1' },
            // Final placeholder
            { id: 'f1', p1: null, p2: null, winner: null },
        ];

        setTournament({
            round: 'quarter',
            matches,
            champion: null,
            currentMatchIndex: 0,
        });
    }, []);

    const advanceTournament = useCallback((matchId: string, winnerId: string) => {
        setTournament(prev => {
            if (!prev) return null;

            const newMatches = [...prev.matches];
            const matchIndex = newMatches.findIndex(m => m.id === matchId);
            if (matchIndex === -1) return prev;

            const match = newMatches[matchIndex];
            const winner = match.p1?.id === winnerId ? match.p1 : match.p2;

            if (!winner) return prev;

            // Update winner
            newMatches[matchIndex] = { ...match, winner };

            // Advance winner to next match
            if (match.nextMatchId) {
                const nextMatchIndex = newMatches.findIndex(m => m.id === match.nextMatchId);
                if (nextMatchIndex !== -1) {
                    const nextMatch = newMatches[nextMatchIndex];
                    // Place winner in p1 or p2 slot depending on if this was an odd or even match feed
                    // Logic: q1->s1(p1), q2->s1(p2)
                    // We can check if p1 is empty
                    const updatedNextMatch = { ...nextMatch };
                    if (!updatedNextMatch.p1) updatedNextMatch.p1 = winner;
                    else updatedNextMatch.p2 = winner;

                    newMatches[nextMatchIndex] = updatedNextMatch;
                }
            } else {
                // No next match = Final winner
                return { ...prev, matches: newMatches, champion: winner, round: 'winner' };
            }

            // Check if current round is complete
            // Logic: find next playable match
            // Simple approach: just find the first match in the list that has p1 & p2 but no winner
            const nextPlayableIndex = newMatches.findIndex(m => m.p1 && m.p2 && !m.winner);

            return {
                ...prev,
                matches: newMatches,
                currentMatchIndex: nextPlayableIndex !== -1 ? nextPlayableIndex : -1 // -1 means round transition or wait
            };
        });
    }, []);

    // Helper to get the current active match
    const getCurrentMatch = useCallback(() => {
        if (!tournament) return null;
        return tournament.matches.find(m => m.p1 && m.p2 && !m.winner) || null;
    }, [tournament]);

    return {
        tournament,
        initializeTournament,
        advanceTournament,
        getCurrentMatch
    };
}
