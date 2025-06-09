import { useGameState } from "@/hooks/useGameState";
import NPCCharacter, { NPCStatsDisplay } from "./NPCCharacter";
import DruidCharacter from "./DruidCharacter";
import TurnIndicator from "./TurnIndicator";
import PlayerActionPanel from "./PlayerActionPanel";
import DiceDisplay from "./DiceDisplay";
import GameOverModal from "./GameOverModal";
import CombatLog from "./CombatLog";

export default function GameBoard() {
  const {
    gameState,
    usePeaceAbility,
    endTurn,
    restartGame,
    setTargetingMode,
    diceState,
    combatLogMode,
    toggleCombatLog
  } = useGameState();

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

  return (
    <div className="relative w-screen h-screen flex items-center justify-center">
      <div className="relative w-full max-w-6xl h-full max-h-[600px] bg-gradient-to-b from-sky-400 via-green-300 to-green-600 overflow-hidden rounded-lg shadow-2xl">
        {/* Forest Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080')",
          }}
        />

        {/* Battleground Area */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-32 bg-amber-700 rounded-t-full opacity-90 shadow-inner" />

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
            color="bg-purple-700"
          />
        </div>

        {/* Druid Character */}
        <DruidCharacter hidden={gameState.druid.hidden} />

        {/* NPC Action Panel */}
        {(gameState.currentTurn === "npc1" ||
          gameState.currentTurn === "npc2") &&
          !gameState.gameOver && (
            <div className="absolute bottom-4 left-4 z-30">
              <div className="bg-gray-900 bg-opacity-90 rounded-lg p-4 border-2 border-blue-400">
                <h3 className="font-mono text-blue-400 text-sm mb-3">
                  {gameState.currentTurn === "npc1"
                    ? "GARETH'S TURN"
                    : "LYRA'S TURN"}
                </h3>
                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs py-3 px-4 rounded transition-colors duration-200">
                  ⚡ Taking Action
                </button>
                <div className="text-xs text-gray-400 mt-2">
                  Click to roll dice and act
                </div>
              </div>
            </div>
          )}

        {/* Player Action Panel */}
        <PlayerActionPanel
          actionPoints={gameState.druid.actionPoints}
          maxActionPoints={gameState.druid.maxActionPoints}
          targetingMode={gameState.targetingMode}
          onPeaceAbility={handlePeaceAbilityClick}
          onEndTurn={handleEndTurn}
          onToggleCombatLog={toggleCombatLog}
          combatLogMode={combatLogMode}
          isPlayerTurn={gameState.currentTurn === "druid" && !gameState.gameOver}
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

        {/* Combat Log */}
        <CombatLog entries={gameState.combatLog} />
      </div>
    </div>
  );
}
