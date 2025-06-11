import { useEffect, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import NPCCharacter, { NPCStatsDisplay } from "./NPCCharacter";
import DruidCharacter from "./DruidCharacter";
import TurnIndicator from "./TurnIndicator";
import DiceDisplay from "./DiceDisplay";
import GameOverModal from "./GameOverModal";
import CombatLog from "./CombatLog";
import InventoryScreen from "@/components/inventory/InventoryScreen";
import ActionPanel from "./ActionPanel";
import StatusBar from "./StatusBar";
import DebugPanel from "./DebugPanel";
import abilities from "@/abilities";
import { GameContext } from "@/abilities/types";
import {
  loadNPCData,
  loadPCData,
  NPCCharacterData,
  PCCharacterData,
} from "@/lib/characterLoader";
import { useInventory } from "@/hooks/useInventory";
import { getItemById } from "@/lib/inventory";

import { IS_DEBUG, initialDebugState, DebugState } from "@/lib/debug";
import {
  globalTimeManager,
  applyPhaseColorPalette,
  getTimeBasedEnvironmentalEffect,
} from "@/lib/timeSystem";
import {
  getEnvironmentalEffectById,
} from "@/lib/environmentLoader";

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

    // Add time-based environmental effect
    const timeEffect = getTimeBasedEnvironmentalEffect(timeState.currentPhase);
    setActiveEnvironmentalEffects([timeEffect.id]);

    const unsubscribe = globalTimeManager.subscribe((newTimeState) => {
      setCurrentTimePhase(newTimeState.currentPhase);
      applyPhaseColorPalette(newTimeState.currentPhase);

      // Update time-based environmental effect
      const newTimeEffect = getTimeBasedEnvironmentalEffect(
        newTimeState.currentPhase,
      );
      setActiveEnvironmentalEffects([newTimeEffect.id]);
    });

    return unsubscribe;
  }, []);

  // Debug state
  const [debugState, setDebugState] = useState<DebugState>(initialDebugState);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Inventory state
  const { inventory, useItem } = useInventory();
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
    if (!item || !useItem(itemId)) return;

    // Apply item effects using the hook function
    applyItemEffects(item.effects, item.name);

    // Close inventory modal
    setShowInventoryModal(false);
  };

  const hasActionPoints = gameState.druid.stats.actionPoints > 0;
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
      <div className="absolute left-1/2 transform -translate-x-1/2 top-20 z-30">
        <div className="bg-black bg-opacity-80 rounded-lg p-3 border-2 border-amber-400 space-y-2">
          <div className="text-center">
            <div className="text-2xl">
              {globalTimeManager.getCurrentPhaseInfo().icon}
            </div>
            <div
              className="text-xs font-mono font-bold px-2 py-1 rounded"
              style={{
                backgroundColor:
                  globalTimeManager.getCurrentPhaseInfo().colorPalette.accent +
                  "40",
                color:
                  globalTimeManager.getCurrentPhaseInfo().colorPalette.accent,
              }}
            >
              {globalTimeManager.getCurrentPhaseInfo().name}
            </div>
          </div>

          {activeEnvironmentalEffects.length > 0 && (
            <div className="border-t border-amber-400/30 pt-2">
              <div className="text-xs text-amber-400 font-mono mb-1">
                ACTIVE EFFECTS:
              </div>
              {activeEnvironmentalEffects.map((effectId) => (
                <div key={effectId} className="text-xs text-gray-300 font-mono">
                  • {effectId.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Character Stats at Top */}
      <NPCStatsDisplay name={gameState.npc1.name} npc={gameState.npc1.stats} position="left" />
      <NPCStatsDisplay name={gameState.npc2.name} npc={gameState.npc2.stats} position="right" />

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
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 shadow-lg border-t-2 border-orange-400">
          <div className="flex items-center justify-between">
            {/* Left side - PC Character Token and Action Points */}
            <div className="flex items-center space-x-4">
              {/* PC Character Token */}
              <div className="relative">
                <div className="w-12 h-12 bg-green-700 rounded-full border-4 border-green-400 flex items-center justify-center text-lg shadow-lg">
                  🌿
                </div>
              </div>

              {/* Action Points */}
              <div className="text-center">
                <div className="text-xs font-mono text-orange-200 mb-1">AP</div>
                <div className="text-lg font-mono text-white font-bold">
                  {gameState.druid.stats.actionPoints}/
                  {gameState.druid.stats.maxActionPoints}
                </div>
              </div>
            </div>

            {/* Center - Abilities */}
            <div className="flex-1 flex justify-center">
              <ActionPanel
                abilities={pcData?.abilities || []}
                actionPoints={gameState.druid.stats.actionPoints}
                canUseActions={canUseActions}
                onAbilityUse={handleAbilityUse}
              />
            </div>

            {/* Right side - Utils and Status */}
            <StatusBar
              targetingMode={gameState.targetingMode}
              canUseActions={canUseActions}
              combatLogMode={combatLogMode}
              showDebugPanel={showDebugPanel}
              onToggleCombatLog={toggleCombatLog}
              onToggleDebug={() => setShowDebugPanel(!showDebugPanel)}
              onEndTurn={handleEndTurn}
              onFlee={handleFleeAbility}
              onOpenInventory={() => setShowInventoryModal(true)}
            />
          </div>
        </div>
      </div>

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
