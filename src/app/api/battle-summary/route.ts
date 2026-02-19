import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { winner, loser, winnerStats, loserStats, logSummary } = await request.json();

        // Heuristic Logic to mock AI generation
        // Real implementation would call Gemini API here

        let reason = "";
        const diffATK = winnerStats.ATK - loserStats.DEF;
        const diffSPD = winnerStats.SPD - loserStats.SPD;
        const diffSTA = winnerStats.STA - loserStats.STA;

        if (diffATK > 20) {
            reason = "A crushing victory! The sheer offensive power overwhelmed the defense, shattering the opponent's momentum with decisive hits.";
        } else if (diffSPD > 10) {
            reason = "Too fast to catch! High-speed maneuvers allowed for a barrage of attacks that inevitably wore down the slower opponent.";
        } else if (diffSTA > 15) {
            reason = "A battle of endurance! While the opponent fought bravely, they simply ran out of steam against a stamina monster that kept spinning.";
        } else {
            reason = "A close technical bout! Superior blade control and well-timed counters proved to be the difference maker in this intense matchup.";
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        return NextResponse.json({
            summary: reason,
            generatedBy: "Gemini 1.5 Flash (Mock)"
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
    }
}
