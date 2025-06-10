import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, DruidStats, NPCStats, NPC, PC } from './gameLogic';
import { useDiceActionSystem, DiceActionState } from './diceActionSystem';
import { ActionIntent } from './actionEffects';
import { BattleEvent, createBattleEvent } from './events';

export function useEnhancedGameState() {
  const [gameState, setGameState] = useState<GameState>({
    currentTurn: "druid",
    turnCounter: 1,
    npc1: {
      id: "npc1",
      name: "Angry Merchant",
      icon: "🛒",
      color: "#dc2626",
      description: "A frustrated merchant",
      stats: {
        health: 80, maxHealth: 80,
        armor: 30, maxArmor: 30,
        willToFight: 60, maxWill: 60,
        awareness: 20, maxAwareness: 100
      },
      actions: ["attack", "defend"]
    },
    npc2: {
      id: "npc2",
      name: "Territorial Guard",
      icon: "⚔️",
      color: "#7c2d12",
      description: "A protective guard",
      stats: {
        health: 70, maxHealth: 70,
        armor: 20, maxArmor: 20,
        willToFight: 50, maxWill: 50,
        awareness: 30, maxAwareness: 100
      },
      actions: ["attack", "defend"]
    },
    druid: {
      id: "druid",
      name: "Peaceful Druid",
      icon: "🌿",
      color: "#16a34a",
      stats: {
        hidden: true,
        actionPoints: 3,
        maxActionPoints: 3
      }
    },
    gameOver: false,
    targetingMode: false,
    combatLog: [],
    gameOverState: null
  });

  const [battleEvents, setBattleEvents] = useState<BattleEvent[]>([]);

  const addBattleEvent = useCallback((event: BattleEvent) => {
    setBattleEvents(prev => [...prev, event]);
  }, []);

  const { diceActionState, executeAction, clearLastAction } = useDiceActionSystem(addBattleEvent);

  const performPeaceAction = useCallback(async (targetId: 'npc1' | 'npc2') => {
    const intent: ActionIntent = {
      actor: 'druid',
      type: 'peace_aura',
      target: targetId,
      turnCounter: gameState.turnCounter
    };

    const { roll, effect } = await executeAction(intent);

    setGameState(prev => {
      const newState = { ...prev };
      const target = newState[targetId];
      
      if (effect.willReduction) {
        target.stats.willToFight = Math.max(0, target.stats.willToFight - effect.willReduction);
      }
      
      if (effect.awarenessChange) {
        newState.npc1.stats.awareness = Math.min(newState.npc1.stats.maxAwareness, 
          newState.npc1.stats.awareness + effect.awarenessChange);
        newState.npc2.stats.awareness = Math.min(newState.npc2.stats.maxAwareness, 
          newState.npc2.stats.awareness + effect.awarenessChange);
      }
      
      newState.druid.stats.actionPoints = Math.max(0, newState.druid.stats.actionPoints - 1);
      newState.targetingMode = false;
      
      return newState;
    });

    return { roll, effect };
  }, [gameState.turnCounter, executeAction]);

  const performNPCAction = useCallback(async (npcId: 'npc1' | 'npc2', actionType: 'attack' | 'defend') => {
    const intent: ActionIntent = {
      actor: npcId,
      type: actionType,
      target: actionType === 'attack' ? (npcId === 'npc1' ? 'npc2' : 'npc1') : undefined,
      turnCounter: gameState.turnCounter
    };

    const { roll, effect } = await executeAction(intent);

    setGameState(prev => {
      const newState = { ...prev };
      const actor = newState[npcId];
      
      if (actionType === 'attack' && intent.target) {
        const target = newState[intent.target];
        
        if (effect.damage) {
          let remainingDamage = effect.damage;
          let armorDamage = 0;
          let healthDamage = 0;
          
          // Only apply to NPC targets that have these stats
          if (intent.target !== 'druid') {
            const npcTarget = target as NPC;
            const npcStats = npcTarget.stats as NPCStats;
            if (npcStats.armor > 0) {
              armorDamage = Math.min(npcStats.armor, effect.armorDamage || 0);
              npcStats.armor = Math.max(0, npcStats.armor - armorDamage);
              remainingDamage -= armorDamage;
            }
            
            if (remainingDamage > 0) {
              const oldHealth = npcStats.health;
              npcStats.health = Math.max(0, npcStats.health - remainingDamage);
              healthDamage = oldHealth - npcStats.health;
            }
            
            const willLost = healthDamage * 0.5;
            npcStats.willToFight = Math.max(0, npcStats.willToFight - willLost);
          }
        }
      } else if (actionType === 'defend' && effect.healing) {
        // Only apply to NPC actors that have these stats
        if (intent.actor !== 'druid' && actor.stats) {
          actor.stats.health = Math.min(actor.stats.maxHealth, actor.stats.health + effect.healing);
        }
      }
      
      return newState;
    });

    return { roll, effect };
  }, [gameState.turnCounter, executeAction]);

  return {
    gameState,
    setGameState,
    battleEvents,
    diceActionState,
    performPeaceAction,
    performNPCAction,
    addBattleEvent,
    clearLastAction
  };
}