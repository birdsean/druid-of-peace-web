export interface EnvironmentalEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
  effects: {
    druidAdvantage: {
      stealthBonus?: number;
      stealthPenalty?: number;
      peaceAuraBonus?: number;
    };
    npcEffects: {
      awarenessReduction?: number;
      awarenessBonus?: number;
      investigateEffectiveness?: number;
      attackAccuracy?: number;
      attackDamage?: number;
      defenseBonus?: number;
      movementPenalty?: number;
      willCalming?: number;
      magicResistance?: number;
    };
  };
  color: string;
}

export interface EnvironmentalEffectsData {
  environmentalEffects: Record<string, EnvironmentalEffect>;
}

export async function loadEnvironmentalEffects(): Promise<EnvironmentalEffectsData | null> {
  try {
    const response = await fetch('/data/environments/effects.json');
    if (!response.ok) throw new Error('Failed to load environmental effects');
    return await response.json();
  } catch (error) {
    console.error('Error loading environmental effects:', error);
    return null;
  }
}

export async function getEnvironmentalEffectById(effectId: string): Promise<EnvironmentalEffect | undefined> {
  const effectsData = await loadEnvironmentalEffects();
  return effectsData?.environmentalEffects[effectId];
}