import { useState, useCallback, useRef, useEffect } from "react";
import { DiceState, GameState } from "@/lib/gameLogic";
import { rollDice as rollDiceLogic, calculatePeaceEffect } from "@/lib/gameLogic";
import { TurnManager } from "@/lib/turnManager";
import {
  resolvePeaceAuraEffects,
  resolveVineSnareEffects,
  advanceTurn as advanceTurnState,
} from "@/lib/gameEngine";

export function useDiceRolling(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addLogEntry: (entry: string) => void,
  checkGameEnd: (state?: GameState) => boolean,
) {
  const [diceState, setDiceState] = useState<DiceState>({
    visible: false,
    rolling: false,
    result: null,
    effect: "",
  });

  const turnManagerRef = useRef<TurnManager | null>(null);

  useEffect(() => {
    if (!turnManagerRef.current) {
      turnManagerRef.current = new TurnManager(
        setGameState,
        setDiceState,
        addLogEntry,
        checkGameEnd,
      );
    }
  }, [addLogEntry, checkGameEnd, setGameState]);

  useEffect(() => {
    if (!turnManagerRef.current || gameState.gameOver) return;
    const { currentTurn } = gameState;
    if (currentTurn === "npc1" || currentTurn === "npc2") {
      if (!turnManagerRef.current.isCurrentlyExecuting()) {
        turnManagerRef.current.executeTurn(gameState);
      }
    }
  }, [gameState.currentTurn, gameState.gameOver, gameState]);

  const rollWithAnimation = useCallback(
    async (message: string) => {
      return new Promise<number>((resolve) => {
        setDiceState({
          visible: true,
          rolling: true,
          result: null,
          effect: message,
        });
        setTimeout(() => {
          const result = rollDiceLogic(1, 6);
          setDiceState((prev) => ({
            ...prev,
            rolling: false,
            result,
            effect: `Rolled ${result}`,
          }));
          setTimeout(() => {
            setDiceState((prev) => ({ ...prev, visible: false }));
            resolve(result);
          }, 1000);
        }, 1500);
      });
    },
    [setDiceState],
  );

  const usePeaceAbility = useCallback(
    async (targetId: "npc1" | "npc2") => {
      if (!turnManagerRef.current) return;
      if (gameState.druid.stats.actionPoints <= 0) return;

      const roll = await rollWithAnimation("Determining outcome...");

      const effect = calculatePeaceEffect(roll);
      setGameState((prev) => resolvePeaceAuraEffects(prev, targetId, effect));

      const targetName = gameState[targetId].name;
      addLogEntry(
        `Druid uses Peace Aura on ${targetName} (-${effect.willReduction} will, +${effect.awarenessIncrease} awareness)`,
      );

      setTimeout(() => {
        setGameState((prev) => {
          checkGameEnd(prev);
          return prev;
        });
      }, 1500);
    },
    [addLogEntry, checkGameEnd, gameState.druid.stats.actionPoints, setGameState],
  );

  const useVineSnare = useCallback(
    async (targetId: "npc1" | "npc2") => {
      if (!turnManagerRef.current) return;
      if (gameState.druid.stats.actionPoints <= 0) return;

      await rollWithAnimation("Entangling vines...");

      setGameState((prev) => resolveVineSnareEffects(prev, targetId));

      const snaredName = gameState[targetId].name;
      addLogEntry(`Druid uses Vine Snare on ${snaredName}`);

      setTimeout(() => {
        setGameState((prev) => {
          checkGameEnd(prev);
          return prev;
        });
      }, 1500);
    },
    [addLogEntry, checkGameEnd, gameState.druid.stats.actionPoints, setGameState]
  );

  const useAbility = useCallback(
    (key: string, targetId: "npc1" | "npc2") => {
      switch (key) {
        case "peaceAura":
          usePeaceAbility(targetId);
          break;
        case "vineSnare":
          useVineSnare(targetId);
          break;
        default:
          console.warn(`Unknown ability ${key}`);
      }
    },
    [usePeaceAbility, useVineSnare]
  );

  const endTurn = useCallback(() => {
    if (turnManagerRef.current) {
      setGameState((prev) => {
        if (checkGameEnd(prev)) return prev;
        const reset = {
          ...prev,
          druid: {
            ...prev.druid,
            actionPoints: prev.druid.stats.maxActionPoints,
          },
        };
        return advanceTurnState(reset);
      });
    }
  }, [checkGameEnd, setGameState]);

  const setAutoTurnEnabled = useCallback((enabled: boolean) => {
    if (turnManagerRef.current) {
      turnManagerRef.current.setAutoTurnEnabled(enabled);
    }
  }, []);

  return {
    diceState,
    useAbility,
    endTurn,
    turnManagerRef,
    setAutoTurnEnabled,
  };
}
