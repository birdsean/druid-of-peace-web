export interface NPCActionConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  effects: {
    damage?: { min: number; max: number };
    armorDamage?: { min: number; max: number };
    armorRestore?: { min: number; max: number };
    willIncrease?: { min: number; max: number };
    willDecrease?: { min: number; max: number };
    awarenessIncrease?: number | { min: number; max: number };
  };
  requirements?: {
    minWillToFight?: number;
    maxWillToFight?: number;
    minAwareness?: number;
  };
  weight: number;
}

export interface NPCActionsData {
  npcActions: Record<string, NPCActionConfig>;
}

export async function loadNPCActions(): Promise<NPCActionsData | null> {
  try {
    const response = await fetch('/data/characters/actions.json');
    if (!response.ok) throw new Error('Failed to load NPC actions');
    return await response.json();
  } catch (error) {
    console.error('Error loading NPC actions:', error);
    return null;
  }
}

export async function getActionById(actionId: string): Promise<NPCActionConfig | undefined> {
  const actionsData = await loadNPCActions();
  return actionsData?.npcActions[actionId];
}

export function selectNPCAction(
  availableActions: string[], 
  npcStats: any, 
  actionsConfig: Record<string, NPCActionConfig>
): string {
  const validActions = availableActions.filter(actionId => {
    const action = actionsConfig[actionId];
    if (!action) return false;

    const req = action.requirements;
    if (!req) return true;

    if (req.minWillToFight && npcStats.willToFight < req.minWillToFight) return false;
    if (req.maxWillToFight && npcStats.willToFight > req.maxWillToFight) return false;
    if (req.minAwareness && npcStats.awareness < req.minAwareness) return false;

    return true;
  });

  if (validActions.length === 0) return availableActions[0] || 'attack';

  // Weighted random selection
  const totalWeight = validActions.reduce((sum, actionId) => {
    return sum + (actionsConfig[actionId]?.weight || 1);
  }, 0);

  let random = Math.random() * totalWeight;
  
  for (const actionId of validActions) {
    const weight = actionsConfig[actionId]?.weight || 1;
    random -= weight;
    if (random <= 0) return actionId;
  }

  return validActions[0];
}