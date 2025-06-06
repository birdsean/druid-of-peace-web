import { useState, useCallback, useEffect } from "react";
import { GameState, NPCStats, DiceState, GameOverState } from "@/lib/gameLogic";
import { rollDice as rollDiceLogic, executeNPCAction, calculatePeaceEffect } from "@/lib/gameLogic";

const initialNPC1: NPCStats = {
  health: 100,
  maxHealth: 100,
  willToFight: 75,
  maxWill: 100,
  awareness: 25,
  maxAwareness: 100
};

const initialNPC2: NPCStats = {
  health: 85,
  maxHealth: 100,
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
    actionsRemaining: 1
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

  const addLogEntry = useCallback((message: string) => {
    setGameState(prev => ({
      ...prev,
      combatLog: [...prev.combatLog, `Turn ${prev.turnCounter}: ${message}`]
    }));
  }, []);

  const rollDice = useCallback(async (min = 1, max = 6): Promise<number> => {
    return new Promise((resolve) => {
      setDiceState({
        visible: true,
        rolling: true,
        result: null,
        effect: 'Determining outcome...'
      });

      setTimeout(() => {
        const result = rollDiceLogic(min, max);
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
  }, []);

  const nextTurn = useCallback(() => {
    setGameState(prev => {
      let newTurn: 'npc1' | 'npc2' | 'druid';
      let newTurnCounter = prev.turnCounter;
      
      if (prev.currentTurn === 'npc1') {
        newTurn = 'npc2';
      } else if (prev.currentTurn === 'npc2') {
        newTurn = 'druid';
      } else {
        newTurn = 'npc1';
        newTurnCounter++;
      }
      
      return {
        ...prev,
        currentTurn: newTurn,
        turnCounter: newTurnCounter
      };
    });
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
  }, [gameState, addLogEntry]);

  const executeNPCTurn = useCallback(async (npcId: 'npc1' | 'npc2') => {
    const roll = await rollDice(1, 6);
    const action = executeNPCAction(roll);
    
    setGameState(prev => {
      const newState = { ...prev };
      const npc = newState[npcId];
      const targetId = npcId === 'npc1' ? 'npc2' : 'npc1';
      const target = newState[targetId];

      switch (action.type) {
        case 'attack':
          const damage = Math.floor(Math.random() * 20) + 10;
          const oldHealth = target.health;
          target.health = Math.max(0, target.health - damage);
          // Each point of health lost removes half a point of will to fight
          const healthLost = oldHealth - target.health;
          const willLost = healthLost * 0.5;
          target.willToFight = Math.max(0, target.willToFight - willLost);
          addLogEntry(`${npcId === 'npc1' ? 'Gareth' : 'Lyra'} attacks for ${damage} damage (${willLost.toFixed(1)} will lost)`);
          break;
        case 'defend':
          npc.health = Math.min(npc.maxHealth, npc.health + 5);
          addLogEntry(`${npcId === 'npc1' ? 'Gareth' : 'Lyra'} defends and recovers`);
          break;
        case 'investigate':
          // NPCs investigating no longer affects awareness - only druid actions do
          addLogEntry(`${npcId === 'npc1' ? 'Gareth' : 'Lyra'} investigates but finds nothing`);
          break;
      }

      return newState;
    });

    // Check for game end conditions after state update
    setTimeout(() => {
      setGameState(prev => {
        // Check game end with the updated state
        const gameEnded = checkGameEnd(prev);
        if (!gameEnded) {
          // Only advance turn if game hasn't ended
          let newTurn: 'npc1' | 'npc2' | 'druid';
          let newTurnCounter = prev.turnCounter;
          
          if (prev.currentTurn === 'npc1') {
            newTurn = 'npc2';
          } else if (prev.currentTurn === 'npc2') {
            newTurn = 'druid';
          } else {
            newTurn = 'npc1';
            newTurnCounter++;
          }
          
          return {
            ...prev,
            currentTurn: newTurn,
            turnCounter: newTurnCounter
          };
        }
        return prev;
      });
    }, 1500);
  }, [rollDice, addLogEntry, checkGameEnd, nextTurn, gameState]);

  const usePeaceAbility = useCallback(async (targetId: 'npc1' | 'npc2') => {
    const roll = await rollDice(1, 6);
    const effect = calculatePeaceEffect(roll);
    
    setGameState(prev => {
      const newState = { ...prev };
      const target = newState[targetId];
      
      // Reduce target's will to fight
      target.willToFight = Math.max(0, target.willToFight - effect.willReduction);
      
      // Increase awareness for both NPCs (only druid actions affect awareness)
      newState.npc1.awareness = Math.min(newState.npc1.maxAwareness, newState.npc1.awareness + effect.awarenessIncrease);
      newState.npc2.awareness = Math.min(newState.npc2.maxAwareness, newState.npc2.awareness + effect.awarenessIncrease);
      
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
  }, [rollDice, addLogEntry, checkGameEnd]);

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

  // No auto-execution - all turns are manual

  return {
    gameState,
    diceState,
    executeNPCTurn,
    usePeaceAbility,
    nextTurn,
    restartGame,
    setTargetingMode,
    rollDice
  };
}