import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ActionPanel from '@/components/game/ActionPanel';

const abilities = [
  { key: 'peaceAura', name: 'Peace Aura', description: 'Calm foes', icon: '🕊️', cost: 1 },
  { key: 'vineSnare', name: 'Vine Snare', description: 'Snare foe', icon: '🌱', cost: 1 },
  { key: 'flee', name: 'Flee', description: 'Run away', icon: '🏃', cost: 2 },
];

describe('ActionPanel', () => {
  it('calls onAbilityUse when clicked', () => {
    const onUse = vi.fn();
    render(
      <ActionPanel abilities={abilities} actionPoints={2} canUseActions={true} onAbilityUse={onUse} />
    );
    fireEvent.click(screen.getByTitle(/Peace Aura/));
    expect(onUse).toHaveBeenCalledWith('peaceAura');
  });

  it('disables abilities without enough points', () => {
    render(
      <ActionPanel abilities={abilities} actionPoints={1} canUseActions={true} onAbilityUse={() => {}} />
    );
    const fleeBtn = screen.getByTitle(/Flee/);
    expect(fleeBtn).toBeDisabled();
  });
});
