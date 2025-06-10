import type { GameState, PeaceEffect } from './gameLogic';
import type { ItemEffect } from './inventory';

/**
 * Apply the results of a Peace Aura action to the game state.
 * This function is pure and does not mutate the original state.
 */
export function resolvePeaceAuraEffects(
  state: GameState,
  targetId: 'npc1' | 'npc2',
  effect: PeaceEffect,
): GameState {
  const newState: GameState = {
    ...state,
    npc1: { ...state.npc1, stats: { ...state.npc1.stats } },
    npc2: { ...state.npc2, stats: { ...state.npc2.stats } },
    druid: { ...state.druid, stats: { ...state.druid.stats } },
  };

  const target = newState[targetId];
  target.stats.willToFight = Math.max(0, target.stats.willToFight - effect.willReduction);

  newState.npc1.stats.awareness = Math.min(
    newState.npc1.stats.maxAwareness,
    newState.npc1.stats.awareness + effect.awarenessIncrease,
  );
  newState.npc2.stats.awareness = Math.min(
    newState.npc2.stats.maxAwareness,
    newState.npc2.stats.awareness + effect.awarenessIncrease,
  );

  newState.druid.stats.actionPoints = Math.max(0, newState.druid.stats.actionPoints - 1);
  newState.targetingMode = false;

  return newState;
}

/**
 * Apply item effects to the game state. Returns the updated state and a
 * description of the effects applied for logging purposes.
 */
export function applyItemEffectsToState(
  state: GameState,
  itemEffects: ItemEffect,
): { state: GameState; descriptions: string[] } {
  const newState: GameState = {
    ...state,
    npc1: { ...state.npc1, stats: { ...state.npc1.stats } },
    npc2: { ...state.npc2, stats: { ...state.npc2.stats } },
    druid: { ...state.druid, stats: { ...state.druid.stats } },
  };
  const descriptions: string[] = [];

  if (itemEffects.restoreAP) {
    const apRestored = Math.min(
      itemEffects.restoreAP,
      newState.druid.stats.maxActionPoints - newState.druid.stats.actionPoints,
    );
    newState.druid.stats.actionPoints = Math.min(
      newState.druid.stats.maxActionPoints,
      newState.druid.stats.actionPoints + itemEffects.restoreAP,
    );
    descriptions.push(`AP +${apRestored}`);
  }

  if (itemEffects.reduceAwareness && itemEffects.targetAll) {
    const npc1Reduced = Math.min(itemEffects.reduceAwareness, newState.npc1.stats.awareness);
    const npc2Reduced = Math.min(itemEffects.reduceAwareness, newState.npc2.stats.awareness);
    newState.npc1.stats.awareness = Math.max(
      0,
      newState.npc1.stats.awareness - itemEffects.reduceAwareness,
    );
    newState.npc2.stats.awareness = Math.max(
      0,
      newState.npc2.stats.awareness - itemEffects.reduceAwareness,
    );
    descriptions.push(`Awareness -${npc1Reduced}/-${npc2Reduced}`);
  }

  if (itemEffects.reduceWill && itemEffects.targetAll) {
    const npc1WillReduced = Math.min(itemEffects.reduceWill, newState.npc1.stats.willToFight);
    const npc2WillReduced = Math.min(itemEffects.reduceWill, newState.npc2.stats.willToFight);
    newState.npc1.stats.willToFight = Math.max(
      0,
      newState.npc1.stats.willToFight - itemEffects.reduceWill,
    );
    newState.npc2.stats.willToFight = Math.max(
      0,
      newState.npc2.stats.willToFight - itemEffects.reduceWill,
    );
    descriptions.push(`Will -${npc1WillReduced}/-${npc2WillReduced}`);
  }

  return { state: newState, descriptions };
}

/**
 * Advance the turn order. Returns a new game state with the currentTurn and
 * turnCounter updated.
 */
export function advanceTurn(state: GameState): GameState {
  let newTurn: 'npc1' | 'npc2' | 'druid';
  let newTurnCounter = state.turnCounter;

  if (state.currentTurn === 'npc1') {
    newTurn = 'npc2';
  } else if (state.currentTurn === 'npc2') {
    newTurn = 'druid';
  } else {
    newTurn = 'npc1';
    newTurnCounter++;
  }

  return { ...state, currentTurn: newTurn, turnCounter: newTurnCounter };
}
