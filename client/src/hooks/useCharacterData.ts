import { useEffect, useCallback } from "react";
import { loadNPCData, loadPCData } from "@/lib/characterLoader";
import { GameState } from "@/lib/gameLogic";
import { applyItemEffectsToState } from "@/lib/gameEngine";
import { BattleEvent, createBattleEvent } from "@/lib/events";

export function useCharacterData(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  addBattleEvent: (event: BattleEvent) => void,
  addLogEntry: (entry: string) => void,
) {
  useEffect(() => {
    const loadCharacterData = async () => {
      try {
        const npcs = await loadNPCData();
        const pc = await loadPCData();

        if (npcs.length >= 2 && pc) {
          setGameState((prev) => ({
            ...prev,
            npc1: {
              ...npcs[0],
              description: "A frustrated merchant",
              position: npcs[0].position || "left",
              actions: ["attack", "defend"],
            },
            npc2: {
              ...npcs[1],
              description: "A territorial guard",
              position: npcs[1].position || "right",
              actions: ["attack", "defend"],
            },
            druid: {
              ...pc,
              abilities: pc.abilities || [],
            },
          }));
        }
      } catch (error) {
        console.error("Failed to load character data:", error);
      }
    };

    loadCharacterData();
  }, [setGameState]);

  const applyItemEffects = useCallback(
    (itemEffects: any, itemName: string, targetId?: 'npc1' | 'npc2') => {
      let descriptions: string[] = [];

      setGameState((prev) => {
        const result = applyItemEffectsToState(prev, itemEffects, targetId);
        descriptions = result.descriptions;
        return result.state;
      });

      const event = createBattleEvent(gameState.turnCounter, "item_use", "druid", {
        action: "use_item",
        result: descriptions.join(", "),
        effect: descriptions.join(", "),
        itemName,
      });
      addBattleEvent(event);

      addLogEntry(`Used ${itemName}: ${descriptions.join(", ")}`);
    },
    [addBattleEvent, addLogEntry, gameState.turnCounter, setGameState],
  );

  return { applyItemEffects };
}
