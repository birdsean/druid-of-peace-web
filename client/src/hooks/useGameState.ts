import { useState, useCallback } from "react";
import {
  GameState,
  NPCStats,
  NPC,
} from "@/lib/gameLogic";
import { useBattleEvents } from "./useBattleEvents";
import { useCharacterData } from "./useCharacterData";
import { useDiceRolling } from "./useDiceRolling";
import { useEncounterCompletion } from "./useEncounterCompletion";

// Default character stats for initialization
const defaultStats: NPCStats = {
  health: 80,
  maxHealth: 80,
  armor: 30,
  maxArmor: 30,
  willToFight: 60,
  maxWill: 60,
  awareness: 20,
  maxAwareness: 100,
};

const defaultNPC: NPC = {
  id: "unknown",
  name: "Unknown",
  icon: "?",
  color: "gray",
  description: "Unknown NPC",
  position: "left",
  stats: defaultStats,
  actions: [],
};

const defaultDruidStats = {
  hidden: true,
  actionPoints: 3,
  maxActionPoints: 3,
};

const initialGameState: GameState = {
  currentTurn: "npc1",
  turnCounter: 1,
  npc1: {
    id: "npc1",
    name: "Gareth",
    icon: "⚔️",
    color: "#6b7280",
    description: "A gruff warrior with weathered armor",
    position: "left",
    stats: defaultStats,
    actions: ["slash", "guard"],
  },
  npc2: {
    id: "npc2",
    name: "Lyra",
    icon: "🏹",
    color: "#3b82f6",
    description: "A skilled archer with keen eyes",
    position: "right",
    stats: {
      health: 70,
      maxHealth: 70,
      armor: 20,
      maxArmor: 20,
      willToFight: 50,
      maxWill: 50,
      awareness: 30,
      maxAwareness: 100,
    },
    actions: ["arrow_shot", "dodge"],
  },
  druid: {
    id: "druid",
    name: "Druid of Peace",
    icon: "🌿",
    color: "#22c55e",
    stats: defaultDruidStats,
    abilities: [],
  },
  gameOver: false,
  targetingMode: false,
  combatLog: ["Turn 1: Combat begins"],
  gameOverState: null,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [combatLogMode, setCombatLogMode] = useState<"hidden" | "small" | "large">(
    "hidden",
  );

  const addLogEntry = useCallback((message: string) => {
    setGameState((prev) => ({
      ...prev,
      combatLog: [...prev.combatLog, `Turn ${prev.turnCounter}: ${message}`],
    }));
  }, []);

  const checkGameEnd = useCallback(
    (currentState?: GameState) => {
      const stateToCheck = currentState || gameState;
      const { npc1, npc2 } = stateToCheck;

      if (npc1.stats.awareness >= 100 || npc2.stats.awareness >= 100) {
        setGameState((prev) => ({
          ...prev,
          gameOver: true,
          gameOverState: {
            title: "MISSION FAILED",
            message: "The druid has been detected!",
            icon: "💀",
          },
        }));
        return true;
      }

      if (npc1.stats.health <= 0 || npc2.stats.health <= 0) {
        const deadNPC = npc1.stats.health <= 0 ? npc1.name : npc2.name;
        setGameState((prev) => ({
          ...prev,
          gameOver: true,
          gameOverState: {
            title: "COMBAT ENDED",
            message: `${deadNPC} has been defeated!`,
            icon: "⚔️",
          },
        }));
        return true;
      }

      if (npc1.stats.willToFight <= 0 || npc2.stats.willToFight <= 0) {
        const fleeingNPC = npc1.stats.willToFight <= 0 ? "Gareth" : "Lyra";
        setGameState((prev) => ({
          ...prev,
          gameOver: true,
          gameOverState: {
            title: "PEACE ACHIEVED",
            message: `${fleeingNPC} has lost the will to fight!`,
            icon: "🕊️",
          },
        }));
        return true;
      }

      return false;
    },
    [gameState],
  );

  const { battleEvents, addBattleEvent } = useBattleEvents(setGameState);
  const { diceState, usePeaceAbility, endTurn, turnManagerRef, setAutoTurnEnabled } =
    useDiceRolling(gameState, setGameState, addLogEntry, checkGameEnd);
  const { applyItemEffects } = useCharacterData(
    gameState,
    setGameState,
    addBattleEvent,
    addLogEntry,
  );
  const completeEncounter = useEncounterCompletion();

  const setTargetingMode = useCallback(
    (targeting: boolean) => {
      setGameState((prev) => ({ ...prev, targetingMode: targeting }));
      if (targeting) {
        addLogEntry("Select target for Peace Aura");
      }
    },
    [addLogEntry],
  );

  const restartGame = useCallback(() => {
    setGameState({
      ...initialGameState,
      npc1: { ...defaultNPC },
      npc2: { ...defaultNPC },
      combatLog: ["Turn 1: Combat begins"],
    });
    setCombatLogMode("hidden");
  }, []);

  const toggleCombatLog = useCallback(() => {
    setCombatLogMode((prev) => {
      switch (prev) {
        case "hidden":
          return "small";
        case "small":
          return "large";
        case "large":
          return "hidden";
        default:
          return "small";
      }
    });
  }, []);

  const triggerGameOver = useCallback(
    (title: string, message: string, icon: string) => {
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        gameOverState: { title, message, icon },
      }));
    },
    [],
  );

  return {
    gameState,
    diceState,
    usePeaceAbility,
    endTurn,
    restartGame,
    setTargetingMode,
    combatLogMode,
    toggleCombatLog,
    completeEncounter,
    triggerGameOver,
    turnManagerRef,
    setAutoTurnEnabled,
    applyItemEffects,
    battleEvents,
  };
}
