import { useEffect, useState } from 'react';
import { useGameState } from "@/hooks/useGameState";
import NPCCharacter, { NPCStatsDisplay } from "./NPCCharacter";
import DruidCharacter from "./DruidCharacter";
import TurnIndicator from "./TurnIndicator";
import DiceDisplay from "./DiceDisplay";
import GameOverModal from "./GameOverModal";
import CombatLog from "./CombatLog";
import InventoryScreen from "@/components/inventory/InventoryScreen";
import { loadNPCData, loadPCData } from "@/lib/characterLoader";
import { useInventory } from "@/hooks/useInventory";
import { getItemById, ItemEffect } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Minimize2, Settings, Play, Pause, Sword, Shield, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IS_DEBUG, initialDebugState, DebugState } from '@/lib/debug';

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
    applyItemEffects
  } = useGameState();

  // Load character data
  const npcData = loadNPCData();
  const pcData = loadPCData();

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
      usePeaceAbility(npcId);
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
    triggerGameOver('FLED ENCOUNTER', 'The druid escaped, but the conflict remains...', '🏃');
  };

  // Debug functions
  const toggleAutoTurn = () => {
    setDebugState(prev => {
      const newAutoTurn = !prev.autoTurn;
      setAutoTurnEnabled(newAutoTurn);
      return { ...prev, autoTurn: newAutoTurn };
    });
  };

  const handleDebugNPCAction = (npcId: "npc1" | "npc2", actionType: "attack" | "defend") => {
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

  const hasActionPoints = gameState.druid.actionPoints > 0;
  const canUseActions = gameState.currentTurn === "druid" && !gameState.targetingMode;

  const getCombatLogIcon = () => {
    switch (combatLogMode) {
      case 'hidden': return EyeOff;
      case 'small': return Eye;
      case 'large': return Minimize2;
      default: return Eye;
    }
  };

  const CombatLogIcon = getCombatLogIcon();

  return (
    <div className="relative w-screen h-screen bg-gradient-to-b from-sky-400 via-green-300 to-green-600 overflow-hidden">
      {/* Forest Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080')",
        }}
      />

      {/* Turn Indicator */}
      <TurnIndicator
        currentTurn={gameState.currentTurn}
        turnCounter={gameState.turnCounter}
      />

      {/* Character Stats at Top */}
      <NPCStatsDisplay name="Gareth" npc={gameState.npc1} position="left" />
      <NPCStatsDisplay name="Lyra" npc={gameState.npc2} position="right" />

      {/* NPC Characters */}
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20">
        <NPCCharacter
          id="npc1"
          name="Gareth"
          npc={gameState.npc1}
          position="left"
          targetingMode={gameState.targetingMode}
          onClick={() => handleNPCClick("npc1")}
          icon="⚔️"
          color="bg-gray-700"
        />
      </div>

      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20">
        <NPCCharacter
          id="npc2"
          name="Lyra"
          npc={gameState.npc2}
          position="right"
          targetingMode={gameState.targetingMode}
          onClick={() => handleNPCClick("npc2")}
          icon="🏹"
          color="bg-blue-700"
        />
      </div>

      {/* Druid Character (Hidden) */}
      <DruidCharacter hidden={gameState.druid.hidden} />

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
                  {gameState.druid.actionPoints}/{gameState.druid.maxActionPoints}
                </div>
              </div>
            </div>

            {/* Center - Abilities */}
            <div className="flex-1 flex justify-center">
              <div className="flex space-x-4">
                {pcData.abilities.filter(ability => ability.key !== 'flee').map((ability) => (
                  <Button
                    key={ability.key}
                    onClick={() => handleAbilityUse(ability.key)}
                    disabled={!canUseActions || !hasActionPoints || ability.cost > gameState.druid.actionPoints}
                    className={cn(
                      "w-12 h-12 text-2xl border-2 transition-all duration-200",
                      canUseActions && hasActionPoints && ability.cost <= gameState.druid.actionPoints
                        ? gameState.targetingMode && ability.key === "peaceAura"
                          ? "bg-green-700 border-green-500 text-white"
                          : "bg-green-600 hover:bg-green-700 border-green-400 text-white"
                        : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed"
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
                <div className="text-xs font-mono text-orange-200 mb-1">STATUS</div>
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
                      : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed"
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
                        : "bg-yellow-600 hover:bg-yellow-700 border-yellow-400 text-white"
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
                      : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed"
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
                      : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed"
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
              <div className="text-sm font-mono text-yellow-400">DEBUG CONTROLS</div>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Auto Turn Toggle */}
              <Button
                onClick={toggleAutoTurn}
                className={cn(
                  "w-full h-10 text-sm border-2 transition-all duration-200",
                  debugState.autoTurn
                    ? "bg-green-600 hover:bg-green-700 border-green-400 text-white"
                    : "bg-red-600 hover:bg-red-700 border-red-400 text-white"
                )}
                title="Toggle automatic NPC turns"
              >
                {debugState.autoTurn ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                Auto Turn: {debugState.autoTurn ? 'ON' : 'OFF'}
              </Button>

              {/* NPC Action Buttons */}
              {!debugState.autoTurn && (
                <>
                  <div className="text-xs font-mono text-gray-400 text-center mt-2">MANUAL NPC ACTIONS</div>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-white">Gareth (NPC1)</div>
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

                    <div className="text-xs font-mono text-white">Lyra (NPC2)</div>
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
        title={gameState.gameOverState?.title || ''}
        message={gameState.gameOverState?.message || ''}
        icon={gameState.gameOverState?.icon || ''}
        onRestart={restartGame}
      />

      {/* Combat Log */}
      <CombatLog entries={gameState.combatLog} mode={combatLogMode} />
    </div>
  );
}