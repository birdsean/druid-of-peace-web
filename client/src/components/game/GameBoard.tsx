import { useEffect, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import NPCCharacter, { NPCStatsDisplay } from "./NPCCharacter";
import DruidCharacter from "./DruidCharacter";
import TurnIndicator from "./TurnIndicator";
import DiceDisplay from "./DiceDisplay";
import GameOverModal from "./GameOverModal";
import CombatLog from "./CombatLog";
import InventoryScreen from "@/components/inventory/InventoryScreen";
import {
  loadNPCData,
  loadPCData,
  NPCCharacterData,
  PCCharacterData,
} from "@/lib/characterLoader";
import { useInventory } from "@/hooks/useInventory";
import { getItemById, ItemEffect } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Minimize2,
  Settings,
  Play,
  Pause,
  Sword,
  Shield,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IS_DEBUG, initialDebugState, DebugState } from "@/lib/debug";
import {
  globalTimeManager,
  applyPhaseColorPalette,
  getTimeBasedEnvironmentalEffect,
} from "@/lib/timeSystem";
import {
  loadEnvironmentalEffects,
  getEnvironmentalEffectById,
} from "@/lib/environmentLoader";

export default function GameBoard() {
  const {
    gameState,
    usePeaceAbility,
    endTurn,
    restartGame,
    setTargetingMode,
    diceState,
    combatLogMode,
    toggleCombatLog,
    triggerGameOver,
    turnManagerRef,
    setAutoTurnEnabled,
    applyItemEffects,
    executeAction,
  } = useGameState();

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

  const handleNPCClick = (npcId: "npc1" | "npc2") => {
    if (gameState.targetingMode && gameState.currentTurn === "druid") {
      executeAction({
        actor: "druid",
        type: "peace_aura",
        target: npcId,
        turnCounter: gameState.turnCounter,
      });
      setTargetingMode(false);
    }
  };

  const handlePeaceAbilityClick = () => {
    if (gameState.currentTurn === "druid" && !gameState.targetingMode) {
      setTargetingMode(true);
    }
  };

  const handleEndTurn = () => {
    if (gameState.currentTurn === "druid" && !gameState.targetingMode) {
      endTurn();
    }
  };

  const handleAbilityUse = (abilityKey: string) => {
    if (abilityKey === "peaceAura") {
      handlePeaceAbilityClick();
    } else if (abilityKey === "flee") {
      handleFleeAbility();
    }
  };

  const handleFleeAbility = () => {
    const confirmed = window.confirm(
      "Are you sure you want to flee? This will count as a loss and the conflict will remain unresolved.",
    );
    if (confirmed) {
      triggerGameOver(
        "FLED ENCOUNTER",
        "The druid escaped, but the conflict remains unresolved...",
        "🏃",
      );
    }
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

  const getCombatLogIcon = () => {
    switch (combatLogMode) {
      case "hidden":
        return EyeOff;
      case "small":
        return Eye;
      case "large":
        return Minimize2;
      default:
        return Eye;
    }
  };

  const CombatLogIcon = getCombatLogIcon();

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
                  {gameState.druid.actionPoints}/
                  {gameState.druid.maxActionPoints}
                </div>
              </div>
            </div>

            {/* Center - Abilities */}
            <div className="flex-1 flex justify-center">
              <div className="flex space-x-4">
                {pcData?.abilities.map((ability) => (
                  <Button
                    key={ability.key}
                    onClick={() => handleAbilityUse(ability.key)}
                    disabled={
                      !canUseActions ||
                      !hasActionPoints ||
                      ability.cost > gameState.druid.actionPoints
                    }
                    className={cn(
                      "w-12 h-12 text-2xl border-2 transition-all duration-200",
                      canUseActions &&
                        hasActionPoints &&
                        ability.cost <= gameState.druid.actionPoints
                        ? "bg-green-600 hover:bg-green-700 border-green-400 text-white"
                        : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed",
                    )}
                    title={`${ability.name}: ${ability.description} (Cost: ${ability.cost})`}
                  >
                    {ability.icon}
                  </Button>
                ))}
              </div>
            </div>

            {/* Right side - Utils and Status */}
            <div className="flex items-center space-x-4">
              {/* Status Info */}
              <div className="text-right mr-4">
                <div className="text-xs font-mono text-orange-200 mb-1">
                  STATUS
                </div>
                <div className="text-sm font-mono text-white">
                  {gameState.targetingMode ? "🎯 TARGETING" : "✋ READY"}
                </div>
              </div>

              {/* Utils Section */}
              <div className="flex items-center space-x-2 border-l border-orange-300 pl-4">
                {/* Combat Log Toggle */}
                <Button
                  onClick={toggleCombatLog}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 text-white"
                  title={`Combat Log: ${combatLogMode}`}
                >
                  <CombatLogIcon className="w-5 h-5" />
                </Button>

                {/* Use Item */}
                <Button
                  onClick={() => setShowInventoryModal(true)}
                  disabled={!canUseActions}
                  className={cn(
                    "w-12 h-12 border-2 transition-all duration-200",
                    canUseActions
                      ? "bg-amber-600 hover:bg-amber-700 border-amber-400 text-white"
                      : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed",
                  )}
                  title="Use Item"
                >
                  <Package className="w-5 h-5" />
                </Button>

                {/* Debug Toggle */}
                {IS_DEBUG && (
                  <Button
                    onClick={() => setShowDebugPanel(!showDebugPanel)}
                    className={cn(
                      "w-12 h-12 border-2 transition-all duration-200",
                      showDebugPanel
                        ? "bg-yellow-700 border-yellow-500 text-white"
                        : "bg-yellow-600 hover:bg-yellow-700 border-yellow-400 text-white",
                    )}
                    title="Toggle debug panel"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                )}

                {/* End Turn */}
                <Button
                  onClick={handleEndTurn}
                  disabled={!canUseActions}
                  className={cn(
                    "w-12 h-12 border-2 transition-all duration-200",
                    canUseActions
                      ? "bg-orange-600 hover:bg-orange-700 border-orange-400 text-white"
                      : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed",
                  )}
                  title="End Turn"
                >
                  ⏰
                </Button>

                {/* Flee */}
                <Button
                  onClick={handleFleeAbility}
                  disabled={!canUseActions}
                  className={cn(
                    "w-12 h-12 border-2 transition-all duration-200",
                    canUseActions
                      ? "bg-red-600 hover:bg-red-700 border-red-400 text-white"
                      : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed",
                  )}
                  title="Flee from encounter"
                >
                  🏃
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel - Center of Battle Area */}
      {IS_DEBUG && showDebugPanel && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-gray-900 rounded-lg p-4 shadow-lg border-2 border-yellow-400 min-w-64">
            <div className="text-center mb-3">
              <div className="text-sm font-mono text-yellow-400">
                DEBUG CONTROLS
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Auto Turn Toggle */}
              <Button
                onClick={toggleAutoTurn}
                className={cn(
                  "w-full h-10 text-sm border-2 transition-all duration-200",
                  debugState.autoTurn
                    ? "bg-green-600 hover:bg-green-700 border-green-400 text-white"
                    : "bg-red-600 hover:bg-red-700 border-red-400 text-white",
                )}
                title="Toggle automatic NPC turns"
              >
                {debugState.autoTurn ? (
                  <Play className="w-4 h-4 mr-2" />
                ) : (
                  <Pause className="w-4 h-4 mr-2" />
                )}
                Auto Turn: {debugState.autoTurn ? "ON" : "OFF"}
              </Button>

              {/* NPC Action Buttons */}
              {!debugState.autoTurn && (
                <>
                  <div className="text-xs font-mono text-gray-400 text-center mt-2">
                    MANUAL NPC ACTIONS
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono text-white">
                      Gareth (NPC1)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDebugNPCAction("npc1", "attack")}
                        className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 border-2 border-red-400 text-white"
                        title="Gareth Attack"
                      >
                        <Sword className="w-3 h-3 mr-1" />
                        Attack
                      </Button>
                      <Button
                        onClick={() => handleDebugNPCAction("npc1", "defend")}
                        className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 text-white"
                        title="Gareth Defend"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Defend
                      </Button>
                    </div>

                    <div className="text-xs font-mono text-white">
                      Lyra (NPC2)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDebugNPCAction("npc2", "attack")}
                        className="flex-1 h-8 text-xs bg-red-600 hover:bg-red-700 border-2 border-red-400 text-white"
                        title="Lyra Attack"
                      >
                        <Sword className="w-3 h-3 mr-1" />
                        Attack
                      </Button>
                      <Button
                        onClick={() => handleDebugNPCAction("npc2", "defend")}
                        className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 text-white"
                        title="Lyra Defend"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Defend
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
