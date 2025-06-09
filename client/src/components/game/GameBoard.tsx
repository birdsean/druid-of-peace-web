import { useGameState } from "@/hooks/useGameState";
import NPCCharacter, { NPCStatsDisplay } from "./NPCCharacter";
import DruidCharacter from "./DruidCharacter";
import TurnIndicator from "./TurnIndicator";
import DiceDisplay from "./DiceDisplay";
import GameOverModal from "./GameOverModal";
import CombatLog from "./CombatLog";
import { loadNPCData, loadPCData } from "@/lib/characterLoader";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    triggerGameOver
  } = useGameState();

  // Load character data
  const npcData = loadNPCData();
  const pcData = loadPCData();

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

      {/* Player Utils Panel - Left Side */}
      <div className="absolute bottom-4 left-4 z-30">
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg p-3 shadow-lg border-2 border-gray-400">
          <div className="flex flex-col gap-3">
            {/* Flee Button */}
            <Button
              onClick={() => handleAbilityUse("flee")}
              disabled={!canUseActions}
              className={cn(
                "w-24 h-10 text-sm font-mono border-2 transition-all duration-200",
                canUseActions 
                  ? "bg-red-600 hover:bg-red-700 border-red-400 text-white" 
                  : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed"
              )}
            >
              🏃 FLEE
            </Button>

            {/* End Turn Button */}
            <Button
              onClick={handleEndTurn}
              disabled={!canUseActions}
              className={cn(
                "w-24 h-10 text-sm font-mono border-2 transition-all duration-200",
                canUseActions
                  ? "bg-orange-600 hover:bg-orange-700 border-orange-400 text-white"
                  : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed"
              )}
            >
              ⏰ END
            </Button>

            {/* Combat Log Toggle */}
            <Button
              onClick={toggleCombatLog}
              className="w-24 h-10 text-sm font-mono border-2 bg-blue-600 hover:bg-blue-700 border-blue-400 text-white transition-all duration-200"
            >
              <CombatLogIcon size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Player Actions Panel - Bottom Center */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-t-lg p-4 shadow-lg border-2 border-orange-400">
          <div className="flex items-center justify-between">
            {/* Left side - Druid Character and Action Points */}
            <div className="flex items-center space-x-4">
              {/* Druid Character Icon */}
              <div className="relative">
                <div className="w-16 h-16 bg-green-700 rounded-full border-4 border-green-400 flex items-center justify-center text-2xl shadow-lg">
                  🌿
                </div>
                {gameState.druid.hidden && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-600 rounded-full border-2 border-purple-400 flex items-center justify-center text-xs text-white">
                    👁️
                  </div>
                )}
              </div>

              {/* Action Points */}
              <div className="text-center">
                <div className="text-xs font-mono text-orange-200 mb-1">ACTION POINTS</div>
                <div className="flex space-x-1">
                  {Array.from({ length: gameState.druid.maxActionPoints }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-8 h-8 rounded border-2 flex items-center justify-center text-lg font-bold",
                        i < gameState.druid.actionPoints
                          ? "bg-yellow-400 border-yellow-300 text-yellow-800"
                          : "bg-gray-600 border-gray-500 text-gray-400"
                      )}
                    >
                      ⚡
                    </div>
                  ))}
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
                      "h-12 px-6 text-lg font-mono border-2 transition-all duration-200",
                      canUseActions && hasActionPoints && ability.cost <= gameState.druid.actionPoints
                        ? gameState.targetingMode && ability.key === "peaceAura"
                          ? "bg-green-700 border-green-500 text-white"
                          : "bg-green-600 hover:bg-green-700 border-green-400 text-white"
                        : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed"
                    )}
                    title={ability.description}
                  >
                    <span className="mr-2">{ability.icon}</span>
                    {ability.name}
                    <span className="ml-2 text-sm">({ability.cost})</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Right side - Status Info */}
            <div className="text-right">
              <div className="text-xs font-mono text-orange-200 mb-1">STATUS</div>
              <div className="text-sm font-mono text-white">
                {gameState.targetingMode ? "🎯 TARGETING" : "✋ READY"}
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* Combat Log */}
      <CombatLog entries={gameState.combatLog} mode={combatLogMode} />
    </div>
  );
}