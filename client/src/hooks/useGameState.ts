import { useState, useCallback, useEffect, useRef } from "react";
import { GameState, NPCStats, DiceState, GameOverState } from "@/lib/gameLogic";
import { rollDice as rollDiceLogic, calculatePeaceEffect } from "@/lib/gameLogic";
import { TurnManager } from "@/lib/turnManager";

const initialNPC1: NPCStats = {
  health: 100,
  maxHealth: 100,
  armor: 25,
  maxArmor: 25,
  willToFight: 75,
  maxWill: 100,
  awareness: 25,
  maxAwareness: 100
};

const initialNPC2: NPCStats = {
  health: 85,
  maxHealth: 100,
  armor: 15,
  maxArmor: 15,
  willToFight: 60,
  maxWill: 100,
  awareness: 45,
  maxAwareness: 100
};

const initialGameState: GameState = {
  currentTurn: 'npc1',
  turnCounter: 1,
  npc1: initialNPC1,
  npc2: initialNPC2,
  druid: {
    hidden: true,
    actionPoints: 1,
    maxActionPoints: 1
  },
  gameOver: false,
  targetingMode: false,
  combatLog: ['Turn 1: Combat begins'],
  gameOverState: null
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [diceState, setDiceState] = useState<DiceState>({
    visible: false,
    rolling: false,
    result: null,
    effect: ''
  });
  const [combatLogMode, setCombatLogMode] = useState<'hidden' | 'small' | 'large'>('small');
  
  const turnManagerRef = useRef<TurnManager | null>(null);

  const addLogEntry = useCallback((message: string) => {
    setGameState(prev => ({
      ...prev,
      combatLog: [...prev.combatLog, `Turn ${prev.turnCounter}: ${message}`]
    }));
  }, []);

  const checkGameEnd = useCallback((currentState?: typeof gameState) => {
    const stateToCheck = currentState || gameState;
    const { npc1, npc2 } = stateToCheck;
    
    // Check if druid is revealed (awareness reaches 100%)
    if (npc1.awareness >= 100 || npc2.awareness >= 100) {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        gameOverState: {
          title: 'MISSION FAILED',
          message: 'The druid has been detected!',
          icon: '💀'
        }
      }));
      return true;
    }
    
    // Check if any NPC died (health reaches 0)
    if (npc1.health <= 0 || npc2.health <= 0) {
      const deadNPC = npc1.health <= 0 ? 'Gareth' : 'Lyra';
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        gameOverState: {
          title: 'COMBAT ENDED',
          message: `${deadNPC} has been defeated!`,
          icon: '⚔️'
        }
      }));
      return true;
    }
    
    // Check if any NPC lost will to fight
    if (npc1.willToFight <= 0 || npc2.willToFight <= 0) {
      const fleeingNPC = npc1.willToFight <= 0 ? 'Gareth' : 'Lyra';
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        gameOverState: {
          title: 'PEACE ACHIEVED',
          message: `${fleeingNPC} has lost the will to fight!`,
          icon: '🕊️'
        }
      }));
      return true;
    }
    
    return false;
  }, [gameState]);

  // Initialize turn manager
  useEffect(() => {
    if (!turnManagerRef.current) {
      turnManagerRef.current = new TurnManager(
        setGameState,
        setDiceState,
        addLogEntry,
        checkGameEnd
      );
    }
  }, [addLogEntry, checkGameEnd]);

  // Auto-execute NPC turns when it's their turn
  useEffect(() => {
    if (!turnManagerRef.current || gameState.gameOver) return;
    
    const { currentTurn } = gameState;
    if (currentTurn === 'npc1' || currentTurn === 'npc2') {
      // Only execute if not already executing
      if (!turnManagerRef.current.isCurrentlyExecuting()) {
        turnManagerRef.current.executeTurn(gameState);
      }
    }
  }, [gameState.currentTurn, gameState.gameOver]);

  const usePeaceAbility = useCallback(async (targetId: 'npc1' | 'npc2') => {
    if (!turnManagerRef.current) return;
    
    // Check if druid has action points
    if (gameState.druid.actionPoints <= 0) return;
    
    const roll = await new Promise<number>((resolve) => {
      setDiceState({
        visible: true,
        rolling: true,
        result: null,
        effect: 'Determining outcome...'
      });

      setTimeout(() => {
        const result = rollDiceLogic(1, 6);
        setDiceState(prev => ({
          ...prev,
          rolling: false,
          result,
          effect: `Rolled ${result}`
        }));

        setTimeout(() => {
          setDiceState(prev => ({ ...prev, visible: false }));
          resolve(result);
        }, 1000);
      }, 1500);
    });
    const effect = calculatePeaceEffect(roll);
    
    setGameState(prev => {
      const newState = { ...prev };
      const target = newState[targetId];
      
      // Reduce target's will to fight
      target.willToFight = Math.max(0, target.willToFight - effect.willReduction);
      
      // Increase awareness for both NPCs (only druid actions affect awareness)
      newState.npc1.awareness = Math.min(newState.npc1.maxAwareness, newState.npc1.awareness + effect.awarenessIncrease);
      newState.npc2.awareness = Math.min(newState.npc2.maxAwareness, newState.npc2.awareness + effect.awarenessIncrease);
      
      // Consume action point
      newState.druid.actionPoints = Math.max(0, newState.druid.actionPoints - 1);
      
      newState.targetingMode = false;
      
      return newState;
    });
    
    addLogEntry(`Druid uses Peace Aura on ${targetId === 'npc1' ? 'Gareth' : 'Lyra'} (-${effect.willReduction} will, +${effect.awarenessIncrease} awareness)`);
    
    // Check for game end after druid action
    setTimeout(() => {
      setGameState(prev => {
        checkGameEnd(prev);
        return prev;
      });
    }, 1500);
  }, [addLogEntry, checkGameEnd, gameState.druid.actionPoints]);

  const endTurn = useCallback(() => {
    if (turnManagerRef.current) {
      // Reset action points when ending turn
      setGameState(prev => ({
        ...prev,
        druid: {
          ...prev.druid,
          actionPoints: prev.druid.maxActionPoints
        }
      }));
      turnManagerRef.current.manualAdvanceTurn();
    }
  }, []);

  const setTargetingMode = useCallback((targeting: boolean) => {
    setGameState(prev => ({ ...prev, targetingMode: targeting }));
    if (targeting) {
      addLogEntry('Select target for Peace Aura');
    }
  }, [addLogEntry]);

  const restartGame = useCallback(() => {
    setGameState({
      ...initialGameState,
      npc1: { ...initialNPC1 },
      npc2: { ...initialNPC2 },
      combatLog: ['Turn 1: Combat begins']
    });
    setDiceState({
      visible: false,
      rolling: false,
      result: null,
      effect: ''
    });
  }, []);

  const toggleCombatLog = useCallback(() => {
    setCombatLogMode(prev => {
      switch (prev) {
        case 'hidden': return 'small';
        case 'small': return 'large';
        case 'large': return 'hidden';
        default: return 'small';
      }
    });
  }, []);

  return {
    gameState,
    diceState,
    usePeaceAbility,
    endTurn,
    restartGame,
    setTargetingMode,
    combatLogMode,
    toggleCombatLog
  };
}