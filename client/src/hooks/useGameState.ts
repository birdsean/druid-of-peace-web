import { useState, useCallback, useEffect, useRef } from "react";
import {
  GameState,
  NPCStats,
  DiceState,
  GameOverState,
  NPC,
} from "@/lib/gameLogic";
import {
  rollDice as rollDiceLogic,
  calculatePeaceEffect,
} from "@/lib/gameLogic";
import { TurnManager } from "@/lib/turnManager";
import {
  resolvePeaceAuraEffects,
  applyItemEffectsToState,
  advanceTurn as advanceTurnState,
} from "@/lib/gameEngine";
import { loadNPCData, loadPCData } from "@/lib/characterLoader";
import { getGlobalMapState } from "@/lib/mapState";
import {
  BattleEvent,
  createBattleEvent,
  formatBattleEventForLog,
} from "@/lib/events";
import { useDiceActionSystem } from "@/lib/diceActionSystem";
import { ActionIntent } from "@/lib/actionEffects";

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

const defaultDruid = {
  id: "druid",
  name: "Druid of Peace",
  icon: "ðŸŒ¿",
  color: "green",
  stats: defaultDruidStats,
  abilities: []
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
    actions: ["slash", "guard"]
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
    actions: ["arrow_shot", "dodge"]
  },
  druid: {
    id: "druid",
    name: "Druid of Peace",
    icon: "🌿",
    color: "#22c55e",
    stats: defaultDruidStats,
    abilities: []
  },
  gameOver: false,
  targetingMode: false,
  combatLog: ["Turn 1: Combat begins"],
  gameOverState: null,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [diceState, setDiceState] = useState<DiceState>({
    visible: false,
    rolling: false,
    result: null,
    effect: "",
  });

  // Load character data and update game state
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
              actions: ["attack", "defend"]
            },
            npc2: {
              ...npcs[1], 
              description: "A territorial guard",
              position: npcs[1].position || "right",
              actions: ["attack", "defend"]
            },
            druid: {
              ...pc,
              abilities: pc.abilities || []
            },
          }));
        }
      } catch (error) {
        console.error("Failed to load character data:", error);
      }
    };

    loadCharacterData();
  }, []);

  const [combatLogMode, setCombatLogMode] = useState<
    "hidden" | "small" | "large"
  >("hidden");
  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([
    createBattleEvent(1, "game_start", "druid"),
  ]);

  const turnManagerRef = useRef<TurnManager | null>(null);

  const addBattleEvent = useCallback(
    (event: BattleEvent) => {
      setBattleEvents((prev) => [...prev, event]);
      // Update combat log from events
      setGameState((prev) => ({
        ...prev,
        combatLog: [...battleEvents, event].map(
          (e) => `Turn ${e.turn}: ${formatBattleEventForLog(e)}`,
        ),
      }));
    },
    [battleEvents],
  );

  const addLogEntry = useCallback((message: string) => {
    setGameState((prev) => ({
      ...prev,
      combatLog: [...prev.combatLog, `Turn ${prev.turnCounter}: ${message}`],
    }));
  }, []);

  // Initialize dice action system after addBattleEvent is defined
  const { diceActionState } = useDiceActionSystem(addBattleEvent);

  const checkGameEnd = useCallback(
    (currentState?: typeof gameState) => {
      const stateToCheck = currentState || gameState;
      const { npc1, npc2 } = stateToCheck;

      // Check if druid is revealed (awareness reaches 100%)
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

      // Check if any NPC died (health reaches 0)
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

      // Check if any NPC lost will to fight
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

  // Initialize turn manager
  useEffect(() => {
    if (!turnManagerRef.current) {
      turnManagerRef.current = new TurnManager(
        setGameState,
        setDiceState,
        addLogEntry,
        checkGameEnd,
      );
    }
  }, [addLogEntry, checkGameEnd]);

  // Auto-execute NPC turns when it's their turn
  useEffect(() => {
    if (!turnManagerRef.current || gameState.gameOver) return;

    const { currentTurn } = gameState;
    if (currentTurn === "npc1" || currentTurn === "npc2") {
      // Only execute if not already executing
      if (!turnManagerRef.current.isCurrentlyExecuting()) {
        turnManagerRef.current.executeTurn(gameState);
      }
    }
  }, [gameState.currentTurn, gameState.gameOver]);

  const usePeaceAbility = useCallback(
    async (targetId: "npc1" | "npc2") => {
      if (!turnManagerRef.current) return;

      // Check if druid has action points
      if (gameState.druid.stats.actionPoints <= 0) return;

      const roll = await new Promise<number>((resolve) => {
        setDiceState({
          visible: true,
          rolling: true,
          result: null,
          effect: "Determining outcome...",
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
      const effect = calculatePeaceEffect(roll);

      setGameState((prev) =>
        resolvePeaceAuraEffects(prev, targetId, effect),
      );

      addLogEntry(
        `Druid uses Peace Aura on ${targetId === "npc1" ? "Gareth" : "Lyra"} (-${effect.willReduction} will, +${effect.awarenessIncrease} awareness)`,
      );

      // Check for game end after druid action
      setTimeout(() => {
        setGameState((prev) => {
          checkGameEnd(prev);
          return prev;
        });
      }, 1500);
    },
    [addLogEntry, checkGameEnd, gameState.druid.stats.actionPoints],
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
  }, [checkGameEnd]);

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
    setDiceState({
      visible: false,
      rolling: false,
      result: null,
      effect: "",
    });
    setCombatLogMode("hidden");
  }, []);

  // Handle encounter completion and heat updates
  const completeEncounter = useCallback((success: boolean) => {
    const mapState = getGlobalMapState();
    if (mapState.resolveEncounter && mapState.currentEncounterZone) {
      mapState.resolveEncounter(mapState.currentEncounterZone, success);
    }
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
        gameOverState: {
          title,
          message,
          icon,
        },
      }));
    },
    [],
  );

  const setAutoTurnEnabled = useCallback((enabled: boolean) => {
    if (turnManagerRef.current) {
      turnManagerRef.current.setAutoTurnEnabled(enabled);
    }
  }, []);

  const applyItemEffects = useCallback(
    (itemEffects: any, itemName: string) => {
      let effectsDescription: string[] = [];

      setGameState((prev) => {
        const result = applyItemEffectsToState(prev, itemEffects);
        effectsDescription = result.descriptions;
        return result.state;
      });

      // Create battle event for item use
      const event = createBattleEvent(
        gameState.turnCounter,
        "item_use",
        "druid",
        {
          action: "use_item",
          result: effectsDescription.join(", "),
          effect: effectsDescription.join(", "),
          itemName: itemName,
        },
      );
      addBattleEvent(event);

      addLogEntry(`Used ${itemName}: ${effectsDescription.join(", ")}`);
    },
    [addLogEntry, addBattleEvent, gameState.turnCounter],
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
    setGameState,
    addLogEntry,
    applyItemEffects,
    battleEvents,
  };
}
