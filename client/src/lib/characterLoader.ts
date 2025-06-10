// Character data now loaded from parent-level data directory

import { NPC, PC } from "./gameLogic";

export interface NPCCharacterData {
  id: string;
  name: string;
  icon: string;
  color: string;
  position: "left" | "right";
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

export async function loadNPCData(): Promise<NPC[]> {
  try {
    const response = await fetch("/data/characters/npcs.json");
    if (!response.ok) throw new Error("Failed to load NPC data");
    const data: NPCCharacterData[] = await response.json();
    // Convert NPCCharacterData to NPC format
    return data.map(npc => ({
      ...npc,
      position: npc.position || "left",
      description: `NPC character: ${npc.name}`,
      actions: ["attack", "defend"]
    }));
  } catch (error) {
    console.error("Error loading NPC data:", error);
    return [];
  }
}

export async function loadPCData(): Promise<PC | null> {
  try {
    const response = await fetch("/data/characters/pc.json");
    if (!response.ok) throw new Error("Failed to load PC data");
    const data: PCCharacterData = await response.json();
    // Convert PCCharacterData to PC format
    return {
      ...data,
      abilities: data.abilities || []
    };
  } catch (error) {
    console.error("Error loading PC data:", error);
    return null;
  }
}

export async function getNPCById(
  id: string,
): Promise<NPCCharacterData | undefined> {
  const npcs = await loadNPCData();
  return npcs.find((npc) => npc.id === id);
}
