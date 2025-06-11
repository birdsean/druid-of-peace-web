import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PlayerUtilsPanel from '@/components/game/PlayerUtilsPanel';

const abilities = [
  { key: 'peaceAura', name: 'Peace Aura', description: 'Calm foes', icon: '🕊️', cost: 1 },
  { key: 'flee', name: 'Flee', description: 'Run away', icon: '🏃', cost: 2 },
];

const defaultProps = {
  actionPoints: 2,
  maxActionPoints: 2,
  abilities,
  targetingMode: false,
  canUseActions: true,
  combatLogMode: 'hidden' as const,
  showDebugPanel: false,
  onAbilityUse: vi.fn(),
  onToggleCombatLog: vi.fn(),
  onToggleDebug: vi.fn(),
  onEndTurn: vi.fn(),
  onFlee: vi.fn(),
  onOpenInventory: vi.fn(),
};

describe('PlayerUtilsPanel', () => {
  it('renders action points and abilities', () => {
    render(<PlayerUtilsPanel {...defaultProps} />);
    expect(screen.getByText('AP')).toBeInTheDocument();
    expect(screen.getByTitle(/Peace Aura/)).toBeInTheDocument();
  });

  it('handles button clicks', () => {
    render(<PlayerUtilsPanel {...defaultProps} />);
    fireEvent.click(screen.getByTitle(/Peace Aura/));
    fireEvent.click(screen.getByTitle('Combat Log: hidden'));
    fireEvent.click(screen.getByTitle('End Turn'));
    fireEvent.click(screen.getByTitle('Flee from encounter'));
    fireEvent.click(screen.getByTitle('Use Item'));
    expect(defaultProps.onAbilityUse).toHaveBeenCalledWith('peaceAura');
    expect(defaultProps.onToggleCombatLog).toHaveBeenCalled();
    expect(defaultProps.onEndTurn).toHaveBeenCalled();
    expect(defaultProps.onFlee).toHaveBeenCalled();
    expect(defaultProps.onOpenInventory).toHaveBeenCalled();
  });
});
