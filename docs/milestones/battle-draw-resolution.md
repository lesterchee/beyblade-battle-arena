# Incident Log: Battle Draw State Resolution

**Date:** 2026-03-03  
**Status:** ✅ Resolved  
**Surface Area:** UI-only patch — no engine, type, or Firebase changes

---

## Incident Summary

When a battle ended in a draw (`state.winner === 'draw'`), the result overlay rendered with no actionable buttons, permanently blocking the player. The UI would display "DRAW!" but offer no path forward in either Freeplay or Tournament mode.

---

## Root Cause Analysis

**File:** `src/components/features/BattleView.tsx`

The result button block was gated by a single `isTournament` boolean:

```tsx
// BEFORE — not draw-aware
{!isTournament && (
  <>
    <Button onClick={handleReset}>REMATCH</Button>   {/* handleReset called onExit() — wrong */}
    <Button onClick={onExit}>EXIT ARENA</Button>
  </>
)}
{isTournament && (
  <div>ADVANCING TO BRACKET...</div>   {/* stuck — bracket didn't advance on draw */}
)}
```

Two compounding bugs:

| # | Bug | Impact |
|---|-----|--------|
| 1 | `handleReset` called `onExit()` after `resetBattle()` | Clicking "REMATCH" exited the arena instead of restarting |
| 2 | No button shown in tournament draw — `handleBattleEnd` returns early on draw | Tournament bracket permanently frozen |

---

## Fix Applied

**Commit surface:** `src/components/features/BattleView.tsx` only

### Handler Refactor

| Handler | Before | After |
|---------|--------|-------|
| `handleReset` | `resetBattle()` → `onExit()` | Removed |
| `handleRematch` *(new)* | — | `setShowResult(false)` → `setAiSummary(null)` → `resetBattle()` — stays in arena |
| `handleExitToMenu` *(new)* | — | `setShowResult(false)` → `setAiSummary(null)` → `resetBattle()` → `onExit()` |

### Button Block Refactor

Replaced the binary `isTournament` guard with a draw-aware three-branch conditional:

```tsx
{/* Draw — shown in ALL contexts */}
{state.winner === 'draw' && (
  <>
    <Button onClick={handleRematch}>REMATCH</Button>
    <Button variant="secondary" onClick={handleExitToMenu}>
      {isTournament ? 'BACK TO BRACKET' : 'EXIT ARENA'}
    </Button>
  </>
)}

{/* Non-draw Freeplay */}
{state.winner !== 'draw' && !isTournament && (
  <>
    <Button onClick={handleRematch}>REMATCH</Button>
    <Button variant="secondary" onClick={handleExitToMenu}>EXIT ARENA</Button>
  </>
)}

{/* Non-draw Tournament — auto-advances via onMatchComplete */}
{state.winner !== 'draw' && isTournament && (
  <div>ADVANCING TO BRACKET...</div>
)}
```

---

## State Leak Prevention

`handleRematch` intentionally omits `onExit()`. The engine's `RESET` action in `useBattleEngine.ts` restores all participants to `maxHP`, clears `isDead`, resets the timer, clears logs, and sets `winner: null` — a clean slate with the same Beyblade lineup loaded.

Tournament bracket state (`useTournament.ts`) is never touched by a rematch — it remains in `TournamentView` parent scope and is only mutated by `advanceTournament()`, which is never called on draw.

---

## Validation

| Scenario | Result |
|----------|--------|
| TypeScript build (`npx tsc --noEmit`) | ✅ Zero errors |
| Freeplay draw → REMATCH | ✅ Arena resets, HP/timer clean |
| Freeplay draw → EXIT ARENA | ✅ Routes to menu |
| Tournament draw → BACK TO BRACKET | ✅ Returns to bracket, bracket state intact |
| Tournament non-draw → auto-advance | ✅ No regression |
| Freeplay non-draw → REMATCH / EXIT | ✅ No regression |

---

## Files Changed

| File | Change Type |
|------|-------------|
| `src/components/features/BattleView.tsx` | Modified |
| `docs/milestones/battle-draw-resolution.md` | New (this file) |
