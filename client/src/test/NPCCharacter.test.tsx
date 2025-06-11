import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NPCCharacter from '@/components/game/NPCCharacter';

const stats = {
  health: 10,
  maxHealth: 10,
  armor: 0,
  maxArmor: 0,
  willToFight: 10,
  maxWill: 10,
  awareness: 0,
  maxAwareness: 100,
};

describe('NPCCharacter animations', () => {
  it('applies attack animation class', () => {
    const { container } = render(
      <NPCCharacter
        id="npc1"
        name="NPC"
        npc={stats}
        position="left"
        targetingMode={false}
        onClick={() => {}}
        icon="A"
        color="bg-red-500"
        isAnimating={true}
        animationType="attack"
      />
    );

    expect(container.querySelector('.animate-attack-right')).toBeTruthy();
  });

  it('applies hit animation class', () => {
    const { container } = render(
      <NPCCharacter
        id="npc1"
        name="NPC"
        npc={stats}
        position="left"
        targetingMode={false}
        onClick={() => {}}
        icon="A"
        color="bg-red-500"
        isAnimating={true}
        animationType="hit"
      />
    );

    expect(container.querySelector('.animate-hit-shake')).toBeTruthy();
  });
});
