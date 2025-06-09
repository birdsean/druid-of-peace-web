import { rollDice } from './gameLogic';
import { createBattleEvent } from './events';

export interface ActionIntent {
  actor: 'npc1' | 'npc2' | 'druid';
  type: 'attack' | 'defend' | 'peace_aura' | 'observe' | 'meditate';
  target?: 'npc1' | 'npc2' | 'druid';
  turnCounter: number;
}

export interface ActionEffect {
  damage?: number;
  healing?: number;
  willReduction?: number;
  awarenessChange?: number;
  armorDamage?: number;
  actionPointsGained?: number;
  description: string;
}

export function calculateActionEffect(intent: ActionIntent): { roll: number; effect: ActionEffect } {
  const roll = rollDice(1, 6);
  
  switch (intent.type) {
    case 'attack':
      return calculateAttackEffect(roll, intent);
    case 'defend':
      return calculateDefendEffect(roll, intent);
    case 'peace_aura':
      return calculatePeaceEffect(roll, intent);
    case 'observe':
      return calculateObserveEffect(roll, intent);
    case 'meditate':
      return calculateMeditateEffect(roll, intent);
    default:
      return {
        roll,
        effect: {
          description: 'Unknown action'
        }
      };
  }
}

function calculateAttackEffect(roll: number, intent: ActionIntent): { roll: number; effect: ActionEffect } {
  const baseDamage = roll + 3; // Base attack damage
  const armorPiercing = Math.max(0, roll - 3); // Higher rolls pierce armor better
  
  return {
    roll,
    effect: {
      damage: baseDamage,
      armorDamage: Math.min(baseDamage, armorPiercing + 2),
      description: `Attack deals ${baseDamage} damage (roll: ${roll})`
    }
  };
}

function calculateDefendEffect(roll: number, intent: ActionIntent): { roll: number; effect: ActionEffect } {
  const healing = Math.max(3, roll + 1); // Minimum 3 healing, scales with roll
  
  return {
    roll,
    effect: {
      healing,
      description: `Defend recovers ${healing} health (roll: ${roll})`
    }
  };
}

function calculatePeaceEffect(roll: number, intent: ActionIntent): { roll: number; effect: ActionEffect } {
  let willReduction = 0;
  let awarenessIncrease = 0;
  
  if (roll >= 5) {
    willReduction = 15;
    awarenessIncrease = 5;
  } else if (roll >= 3) {
    willReduction = 10;
    awarenessIncrease = 8;
  } else {
    willReduction = 5;
    awarenessIncrease = 12;
  }
  
  return {
    roll,
    effect: {
      willReduction,
      awarenessChange: awarenessIncrease,
      description: `Peace aura reduces will by ${willReduction}, increases awareness by ${awarenessIncrease} (roll: ${roll})`
    }
  };
}

function calculateObserveEffect(roll: number, intent: ActionIntent): { roll: number; effect: ActionEffect } {
  const awarenessReduction = Math.max(2, roll);
  
  return {
    roll,
    effect: {
      awarenessChange: -awarenessReduction,
      description: `Observe reduces NPC awareness by ${awarenessReduction} (roll: ${roll})`
    }
  };
}

function calculateMeditateEffect(roll: number, intent: ActionIntent): { roll: number; effect: ActionEffect } {
  const apGained = roll >= 4 ? 2 : 1;
  
  return {
    roll,
    effect: {
      actionPointsGained: apGained,
      description: `Meditate restores ${apGained} action points (roll: ${roll})`
    }
  };
}

export function createActionEvents(intent: ActionIntent, roll: number, effect: ActionEffect): Array<any> {
  const events = [];
  
  // Intent event
  const intentEvent = createBattleEvent(
    intent.turnCounter,
    intent.actor === 'druid' ? 'druid_action' : 'npc_action',
    intent.actor,
    {
      action: `${intent.type}_intent`,
      target: intent.target,
      result: `Rolling dice for ${intent.type}...`
    }
  );
  events.push(intentEvent);
  
  // Effect event
  const effectEvent = createBattleEvent(
    intent.turnCounter,
    intent.actor === 'druid' ? 'druid_action' : 'npc_action',
    intent.actor,
    {
      action: `${intent.type}_effect`,
      target: intent.target,
      result: effect.description,
      damage: effect.damage,
      effect: effect.description
    }
  );
  events.push(effectEvent);
  
  return events;
}