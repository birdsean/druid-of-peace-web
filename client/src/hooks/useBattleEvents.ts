import { useState, useCallback } from "react";
import { BattleEvent, createBattleEvent, formatBattleEventForLog } from "@/lib/events";
import { GameState } from "@/lib/gameLogic";

export function useBattleEvents(
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
) {
  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([
    createBattleEvent(1, "game_start", "druid"),
  ]);

  const addBattleEvent = useCallback(
    (event: BattleEvent) => {
      setBattleEvents((prev) => [...prev, event]);
      setGameState((prev) => ({
        ...prev,
        combatLog: [...prev.combatLog, `Turn ${event.turn}: ${formatBattleEventForLog(event)}`],
      }));
    },
    [setGameState],
  );

  return { battleEvents, addBattleEvent };
}
