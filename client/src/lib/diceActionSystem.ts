import { useState, useCallback } from "react";
import {
  calculateActionEffect,
  createActionEvents,
  ActionIntent,
} from "./actionEffects";
import { createBattleEvent } from "./events";
import { globalHistoryManager } from "./history";

export interface DiceActionState {
  isRolling: boolean;
  pendingAction: ActionIntent | null;
  lastRoll: number | null;
  lastEffect: any | null;
}

export function useDiceActionSystem(addBattleEvent: (event: any) => void) {
  const [diceActionState, setDiceActionState] = useState<DiceActionState>({
    isRolling: false,
    pendingAction: null,
    lastRoll: null,
    lastEffect: null,
  });

  const executeAction = useCallback(
    async (intent: ActionIntent): Promise<any> => {
      return new Promise((resolve) => {
        // Set rolling state and create intent event
        setDiceActionState((prev) => ({
          ...prev,
          isRolling: true,
          pendingAction: intent,
        }));

        // Create intent event
        const intentEvent = createBattleEvent(
          intent.turnCounter,
          intent.actor === "druid" ? "druid_action" : "npc_action",
          intent.actor,
          {
            action: `${intent.type}_intent`,
            target: intent.target,
            result: `Preparing to ${intent.type}...`,
          },
        );
        addBattleEvent(intentEvent);

        // Simulate dice roll animation
        setTimeout(() => {
          const { roll, effect } = calculateActionEffect(intent);

          // Track player action in history if it's a druid action
          if (intent.actor === "druid") {
            globalHistoryManager.addPlayerAction({
              type: intent.type as any,
              target: intent.target === "druid" ? undefined : intent.target,
              roll,
              effect
            });
          }

          // Create effect event
          const effectEvent = createBattleEvent(
            intent.turnCounter,
            intent.actor === "druid" ? "druid_action" : "npc_action",
            intent.actor,
            {
              action: `${intent.type}_effect`,
              target: intent.target,
              result: effect.description,
              damage: effect.damage,
              effect: effect.description,
            },
          );
          addBattleEvent(effectEvent);

          setDiceActionState((prev) => ({
            ...prev,
            isRolling: false,
            pendingAction: null,
            lastRoll: roll,
            lastEffect: effect,
          }));

          resolve({ roll, effect });
        }, 1500); // Dice roll animation duration
      });
    },
    [addBattleEvent],
  );

  const clearLastAction = useCallback(() => {
    setDiceActionState((prev) => ({
      ...prev,
      lastRoll: null,
      lastEffect: null,
    }));
  }, []);

  return {
    diceActionState,
    executeAction,
    clearLastAction,
  };
}
