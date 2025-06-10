import { describe, it, expect, beforeEach } from 'vitest'
import { globalHistoryManager, type EncounterHistory, applyHistorySkillEffects } from './index'

// helper to run through a simple encounter
function runWindWhispererEncounter() {
  globalHistoryManager.startEncounter('forest', 'Forest', 1, ['forest_wind'])
  globalHistoryManager.addPlayerAction({ type: 'peace_aura', environmentalEffects: ['forest_wind'] })
  return globalHistoryManager.completeEncounter('success')
}

describe('HistoryManager basic flow', () => {
  beforeEach(() => {
    globalHistoryManager.debugReset()
  })

  it('records encounters and unlocks skills', () => {
    const unlocked = runWindWhispererEncounter()

    expect(unlocked).toContain('wind_whisperer')

    const history = globalHistoryManager.getHistory()
    expect(history.totalEncounters).toBe(1)
    expect(history.successfulEncounters).toBe(1)
    expect(history.skillsUnlocked).toContain('wind_whisperer')
    expect(history.pendingSkills).toContain('wind_whisperer')
  })

  it('applies skill effects when claimed', () => {
    runWindWhispererEncounter()
    globalHistoryManager.claimSkill('wind_whisperer')
    const baseEffect = { willReduction: 10 }
    const modified = applyHistorySkillEffects(baseEffect, globalHistoryManager.getHistory().skillsClaimed)
    expect(modified.willReduction).toBe(11)
  })
})
