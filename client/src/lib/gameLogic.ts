export interface NPCStats {
  health: number;
  maxHealth: number;
  willToFight: number;
  maxWill: number;
  awareness: number;
  maxAwareness: number;
}

export interface DruidStats {
  hidden: boolean;
  actionsRemaining: number;
}

export interface GameOverState {
  title: string;
  message: string;
  icon: string;
}

export interface GameState {
  currentTurn: "npc1" | "npc2" | "druid";
  turnCounter: number;
  npc1: NPCStats;
  npc2: NPCStats;
  druid: DruidStats;
  gameOver: boolean;
  targetingMode: boolean;
  combatLog: string[];
  gameOverState: GameOverState | null;
}

export interface DiceState {
  visible: boolean;
  rolling: boolean;
  result: number | null;
  effect: string;
}

export interface NPCAction {
  type: "attack" | "defend";
  description: string;
}

export interface PeaceEffect {
  willReduction: number;
  awarenessIncrease: number;
}

export function rollDice(min = 1, max = 6): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function executeNPCAction(roll: number): NPCAction {
  if (roll % 2 == 0) {
    return {
      type: "attack",
      description: "NPC attacks the other character",
    };
  } else {
    return {
      type: "defend",
      description: "NPC defends and recovers health",
    };
  }
}

export function calculatePeaceEffect(roll: number): PeaceEffect {
  const willReduction = roll * 8 + Math.floor(Math.random() * 10) + 5;
  const awarenessIncrease = Math.floor(roll / 2) + 1;

  return {
    willReduction,
    awarenessIncrease,
  };
}
