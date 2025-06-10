import type { EncounterHistory, PCHistoryStore } from './store';

// Determine if any skills should unlock from a completed encounter
export function checkSkillUnlocks(
  history: PCHistoryStore,
  encounter: EncounterHistory
): string[] {
  const newlyUnlocked: string[] = [];

  // Wind Whisperer: use peace aura while forest wind is active
  if (!history.skillsUnlocked.includes('wind_whisperer')) {
    const hasUsedPeaceAura = encounter.actions.some(a => a.type === 'peace_aura');
    const hasForestWind =
      encounter.environmentalEffects.includes('forest_wind') ||
      encounter.actions.some(a => a.environmentalEffects?.includes('forest_wind'));

    if (hasUsedPeaceAura && hasForestWind) {
      history.skillsUnlocked.push('wind_whisperer');
      history.pendingSkills.push('wind_whisperer');
      newlyUnlocked.push('wind_whisperer');
    }
  }

  return newlyUnlocked;
}

// Apply modifiers for unlocked skills to an action effect
export function applyHistorySkillEffects(
  baseEffect: any,
  skillsClaimed: string[]
): any {
  let modifiedEffect = { ...baseEffect };

  if (skillsClaimed.includes('wind_whisperer')) {
    if (modifiedEffect.willReduction) {
      modifiedEffect.willReduction = Math.floor(modifiedEffect.willReduction * 1.1);
    }
  }

  return modifiedEffect;
}

