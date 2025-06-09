import garethData from '../characters/npc/gareth.json';
import lyraData from '../characters/npc/lyra.json';
import druidData from '../characters/pc/druid.json';

export interface NPCCharacterData {
  id: string;
  name: string;
  icon: string;
  color: string;
  position: 'left' | 'right';
  stats: {
    health: number;
    maxHealth: number;
    armor: number;
    maxArmor: number;
    willToFight: number;
    maxWill: number;
    awareness: number;
    maxAwareness: number;
  };
}

export interface PCAbility {
  key: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
}

export interface PCCharacterData {
  id: string;
  name: string;
  icon: string;
  color: string;
  stats: {
    hidden: boolean;
    actionPoints: number;
    maxActionPoints: number;
  };
  abilities: PCAbility[];
}

export function loadNPCData(): NPCCharacterData[] {
  return [garethData, lyraData] as NPCCharacterData[];
}

export function loadPCData(): PCCharacterData {
  return druidData as PCCharacterData;
}

export function getNPCById(id: string): NPCCharacterData | undefined {
  const npcs = loadNPCData();
  return npcs.find(npc => npc.id === id);
}