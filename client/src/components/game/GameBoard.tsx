import { useEffect, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import NPCCharacter, { NPCStatsDisplay } from "./NPCCharacter";
import DruidCharacter from "./DruidCharacter";
import TurnIndicator from "./TurnIndicator";
import DiceDisplay from "./DiceDisplay";
import GameOverModal from "./GameOverModal";
import CombatLog from "./CombatLog";
import InventoryScreen from "@/components/inventory/InventoryScreen";
import PlayerUtilsPanel from "./PlayerUtilsPanel";
import TimePhaseEffectsDisplay from "./TimePhaseEffectsDisplay";
import DebugPanel from "./DebugPanel";
import abilities from "@/abilities";
import { GameContext } from "@/abilities/types";
import {
  loadNPCData,
  loadPCData,
  NPCCharacterData,
  PCCharacterData,
} from "@/lib/characterLoader";
import { useInventoryContext } from "@/hooks/InventoryProvider";
import { getItemById, Item } from "@/lib/inventory";

import { initialDebugState, DebugState } from "@/lib/debug";
import {
  globalTimeManager,
  applyPhaseColorPalette,
  getTimeBasedEnvironmentalEffect,
} from "@/lib/timeSystem";
import { getGlobalMapState } from "@/lib/mapState";

export default function GameBoard() {
  const {
    gameState,
    pendingAbility,
    usePeaceAbility,
    endTurn,
    restartGame,
    setTargetingMode,
    setPendingAbility,
    clearPendingAbility,
    diceState,
    combatLogMode,
    toggleCombatLog,
    triggerGameOver,
    turnManagerRef,
    setAutoTurnEnabled,
    applyItemEffects,
  } = useGameState();

  const abilityCtx: GameContext = {
    gameState,
    setTargetingMode,
    setPendingAbility,
    clearPendingAbility,
    usePeaceAbility,
    triggerGameOver,
  };

  // Load character data
  const [npcData, setNpcData] = useState<NPCCharacterData[]>([]);
  const [pcData, setPcData] = useState<PCCharacterData | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Time and environmental effects
  const [currentTimePhase, setCurrentTimePhase] = useState(
    globalTimeManager.getState().currentPhase,
  );
  const [activeEnvironmentalEffects, setActiveEnvironmentalEffects] = useState<
    string[]
  >([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const npcs = await loadNPCData();
        const pc = await loadPCData();
        setNpcData(npcs);
        setPcData(pc);
        setDataLoaded(true);
      } catch (error) {
        console.error("Failed to load character data:", error);
        setDataLoaded(true); // Set loaded even on error to prevent infinite loading
      }
    };
    loadData();
  }, []);

  // Subscribe to time changes and apply environmental effects
  useEffect(() => {
    const timeState = globalTimeManager.getState();
    setCurrentTimePhase(timeState.currentPhase);

    // Apply color palette for current time phase
    applyPhaseColorPalette(timeState.currentPhase);

    const mapState = getGlobalMapState();
    const weatherEffect = mapState.activeWeatherEffect || null;

    // Add time-based environmental effect along with weather effect if present
    const timeEffect = getTimeBasedEnvironmentalEffect(timeState.currentPhase);
    setActiveEnvironmentalEffects(
      weatherEffect ? [timeEffect.id, weatherEffect] : [timeEffect.id],
    );

    const unsubscribe = globalTimeManager.subscribe((newTimeState) => {
      setCurrentTimePhase(newTimeState.currentPhase);
      applyPhaseColorPalette(newTimeState.currentPhase);

      // Update time-based environmental effect while keeping weather effect
      const newTimeEffect = getTimeBasedEnvironmentalEffect(
        newTimeState.currentPhase,
      );
      setActiveEnvironmentalEffects(
        weatherEffect ? [newTimeEffect.id, weatherEffect] : [newTimeEffect.id],
      );
    });

    return unsubscribe;
  }, []);

  // Debug state
  const [debugState, setDebugState] = useState<DebugState>(initialDebugState);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Inventory state
  const { inventory, useItem } = useInventoryContext();
  const [pendingItem, setPendingItem] = useState<Item | null>(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  // Cleanup state when component unmounts
  useEffect(() => {
    return () => {
      restartGame();
    };
  }, [restartGame]);

  // When an ability has been started and is waiting for a target,
  // `pendingAbility` contains its key. Clicking an NPC should then
  // execute that ability on the chosen target.
  const handleNPCClick = (npcId: "npc1" | "npc2") => {
    if (pendingAbility) {
      abilities[pendingAbility]?.execute?.(abilityCtx, npcId);
    } else if (pendingItem) {
      applyItemEffects(pendingItem.effects, pendingItem.name, npcId);
      useItem(pendingItem.id);
      setPendingItem(null);
      setTargetingMode(false);
    }
  };

  const handleEndTurn = () => {
    if (gameState.currentTurn === "druid" && !gameState.targetingMode) {
      endTurn();
    }
  };

  const handleAbilityUse = (abilityKey: string) => {
    const ability = abilities[abilityKey];
    if (ability?.start) {
      ability.start(abilityCtx);
    }
  };

  const handleFleeAbility = () => {
    abilities.flee.start?.(abilityCtx);
  };

  // Debug functions
  const toggleAutoTurn = () => {
    setDebugState((prev) => {
      const newAutoTurn = !prev.autoTurn;
      setAutoTurnEnabled(newAutoTurn);
      return { ...prev, autoTurn: newAutoTurn };
    });
  };

  const handleDebugNPCAction = (
    npcId: "npc1" | "npc2",
    actionType: "attack" | "defend",
  ) => {
    if (turnManagerRef.current) {
      turnManagerRef.current.executeDebugNPCAction(npcId, actionType);
    }
  };

  const handleUseItem = (itemId: string) => {
    const item = getItemById(itemId);
    if (!item) return;

    if (item.targetType === "npc") {
      setShowInventoryModal(false);
      setPendingItem(item);
      setTargetingMode(true);
    } else {
      if (!useItem(itemId)) return;
      applyItemEffects(item.effects, item.name);
      setShowInventoryModal(false);
    }
  };

  const cancelPendingAction = () => {
    clearPendingAbility();
    setPendingItem(null);
    setTargetingMode(false);
  };

  const canUseActions =
    gameState.currentTurn === "druid" && !gameState.targetingMode;

  // Show loading state while character data loads
  if (!dataLoaded || !pcData) {
    return (
      <div className="w-screen h-screen bg-gradient-to-b from-sky-400 via-green-300 to-green-600 flex items-center justify-center">
        <div className="text-white text-2xl font-mono">
          Loading character data...
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-gradient-to-b from-sky-400 via-green-300 to-green-600 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-amber-900" />

      {/* Turn Indicator */}
      <TurnIndicator
        currentTurn={gameState.currentTurn}
        turnCounter={gameState.turnCounter}
      />

      {/* Time Phase & Environmental Effects Display */}
      <TimePhaseEffectsDisplay
        activeEnvironmentalEffects={activeEnvironmentalEffects}
      />

      {/* Character Stats at Top */}
      <NPCStatsDisplay
        name={gameState.npc1.name}
        npc={gameState.npc1.stats}
        position="left"
      />
      <NPCStatsDisplay
        name={gameState.npc2.name}
        npc={gameState.npc2.stats}
        position="right"
      />

      {/* NPC Characters */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20">
        <NPCCharacter
          id="npc1"
          name={gameState.npc1.name}
          npc={gameState.npc1.stats}
          position="left"
          targetingMode={gameState.targetingMode}
          onClick={() => handleNPCClick("npc1")}
          icon={gameState.npc1.icon}
          color={gameState.npc1.color}
        />
      </div>

      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20">
        <NPCCharacter
          id="npc2"
          name={gameState.npc2.name}
          npc={gameState.npc2.stats}
          position="right"
          targetingMode={gameState.targetingMode}
          onClick={() => handleNPCClick("npc2")}
          icon={gameState.npc2.icon}
          color={gameState.npc2.color}
        />
      </div>

      {/* Druid Character (Hidden) */}
      <DruidCharacter hidden={gameState.druid.stats.hidden} />

      {/* Combined Player & Utils Panel - Full Width Bottom */}
      <PlayerUtilsPanel
        actionPoints={gameState.druid.stats.actionPoints}
        maxActionPoints={gameState.druid.stats.maxActionPoints}
        abilities={pcData?.abilities || []}
        targetingMode={gameState.targetingMode}
        canUseActions={canUseActions}
        combatLogMode={combatLogMode}
        showDebugPanel={showDebugPanel}
        onAbilityUse={handleAbilityUse}
        onToggleCombatLog={toggleCombatLog}
        onToggleDebug={() => setShowDebugPanel(!showDebugPanel)}
        onEndTurn={handleEndTurn}
        onFlee={handleFleeAbility}
        onOpenInventory={() => setShowInventoryModal(true)}
        onCancelAction={cancelPendingAction}
      />

      {/* Debug Panel - Center of Battle Area */}
      <DebugPanel
        visible={showDebugPanel}
        debugState={debugState}
        onToggleAutoTurn={toggleAutoTurn}
        onNPCAction={handleDebugNPCAction}
      />

      {/* Dice Display */}
      <DiceDisplay
        visible={diceState.visible}
        result={diceState.result}
        effect={diceState.effect}
        rolling={diceState.rolling}
      />

      {/* Game Over Modal */}
      <GameOverModal
        visible={gameState.gameOver}
        title={gameState.gameOverState?.title || ""}
        message={gameState.gameOverState?.message || ""}
        icon={gameState.gameOverState?.icon || ""}
        onRestart={restartGame}
      />

      {/* Inventory Modal */}
      {showInventoryModal && (
        <InventoryScreen
          isModal={true}
          onClose={() => setShowInventoryModal(false)}
          onUseItem={handleUseItem}
        />
      )}

      {/* Game Over Modal */}
      <GameOverModal
        visible={gameState.gameOver}
        title={gameState.gameOverState?.title || ""}
        message={gameState.gameOverState?.message || ""}
        icon={gameState.gameOverState?.icon || ""}
        onRestart={restartGame}
      />

      {/* Combat Log */}
      <CombatLog entries={gameState.combatLog} mode={combatLogMode} />
    </div>
  );
}
