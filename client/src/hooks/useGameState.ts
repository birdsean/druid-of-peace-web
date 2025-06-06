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

  const checkGameEnd = useCallback(() => {
    const { npc1, npc2 } = gameState;
    
    // Check if druid is revealed
    if (npc1.awareness >= 80 || npc2.awareness >= 80) {
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
    
    // Check if both NPCs have lost will to fight
    if (npc1.willToFight <= 0 && npc2.willToFight <= 0) {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        gameOverState: {
          title: 'PEACE ACHIEVED',
          message: 'Both NPCs have lost their will to fight!',
          icon: '✌️'
        }
      }));
      return true;
    }
    
    // Check if individual NPCs fled
    if (npc1.willToFight <= 0) {
      addLogEntry('NPC1 flees the battle');
    }
    if (npc2.willToFight <= 0) {
      addLogEntry('NPC2 flees the battle');
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
          target.health = Math.max(0, target.health - damage);
          addLogEntry(`${npcId.toUpperCase()} attacks ${targetId.toUpperCase()} for ${damage} damage`);
          break;
        case 'defend':
          npc.health = Math.min(npc.maxHealth, npc.health + 5);
          addLogEntry(`${npcId.toUpperCase()} defends and recovers`);
          break;
        case 'investigate':
          const awarenessIncrease = Math.floor(Math.random() * 15) + 5;
          npc.awareness = Math.min(npc.maxAwareness, npc.awareness + awarenessIncrease);
          addLogEntry(`${npcId.toUpperCase()} becomes more aware (+${awarenessIncrease})`);
          break;
      }

      return newState;
    });

    setTimeout(() => {
      if (!checkGameEnd()) {
        nextTurn();
      }
    }, 1500);
  }, [rollDice, addLogEntry, checkGameEnd]);

  const usePeaceAbility = useCallback(async (targetId: 'npc1' | 'npc2') => {
    const roll = await rollDice(1, 6);
    const effect = calculatePeaceEffect(roll);
    
    setGameState(prev => {
      const newState = { ...prev };
      const target = newState[targetId];
      
      // Reduce target's will to fight
      target.willToFight = Math.max(0, target.willToFight - effect.willReduction);
      
      // Increase awareness for both NPCs
      newState.npc1.awareness = Math.min(newState.npc1.maxAwareness, newState.npc1.awareness + effect.awarenessIncrease);
      newState.npc2.awareness = Math.min(newState.npc2.maxAwareness, newState.npc2.awareness + effect.awarenessIncrease);
      
      newState.targetingMode = false;
      
      return newState;
    });
    
    addLogEntry(`Druid uses Peace Aura on ${targetId.toUpperCase()} (-${effect.willReduction} will, +${effect.awarenessIncrease} awareness)`);
    
    setTimeout(() => {
      if (!checkGameEnd()) {
        nextTurn();
      }
    }, 1500);
  }, [rollDice, addLogEntry, checkGameEnd]);

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
