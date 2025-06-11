import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PlayerActionPanel from '@/components/game/PlayerActionPanel';

const abilities = [
  { key: 'camp', name: 'Make Camp', description: 'Rest and recover', icon: '⛺', cost: 1 },
  { key: 'pray', name: 'Pray', description: 'Seek guidance', icon: '🙏', cost: 2 },
];

const defaultProps = {
  actionPoints: 3,
  maxActionPoints: 3,
  targetingMode: false,
  abilities,
  onAbilityUse: vi.fn(),
  onEndTurn: vi.fn(),
  onOpenInventory: vi.fn(),
  onOpenSkills: vi.fn(),
  onExitGame: vi.fn(),
  onToggleCombatLog: vi.fn(),
  combatLogMode: 'hidden' as const,
  isPlayerTurn: true,
  onCancelAction: vi.fn(),
};

describe('PlayerActionPanel', () => {
  it('renders action points and abilities', () => {
    render(<PlayerActionPanel {...defaultProps} />);
    expect(screen.getByText('AP')).toBeInTheDocument();
    expect(screen.getByTitle(/Make Camp/)).toBeInTheDocument();
  });

  it('calls handlers on button click', () => {
    render(<PlayerActionPanel {...defaultProps} />);
    fireEvent.click(screen.getByTitle(/Make Camp/));
    fireEvent.click(screen.getByTitle('End Turn'));
    fireEvent.click(screen.getByTitle('Combat Log: hidden'));
    fireEvent.click(screen.getByTitle('Open Inventory'));
    fireEvent.click(screen.getByTitle('Open Skills'));
    fireEvent.click(screen.getByTitle('Exit Game'));
    expect(defaultProps.onAbilityUse).toHaveBeenCalledWith('camp');
    expect(defaultProps.onEndTurn).toHaveBeenCalled();
    expect(defaultProps.onToggleCombatLog).toHaveBeenCalled();
    expect(defaultProps.onOpenInventory).toHaveBeenCalled();
    expect(defaultProps.onOpenSkills).toHaveBeenCalled();
    expect(defaultProps.onExitGame).toHaveBeenCalled();
  });

  it('disables abilities without points', () => {
    render(<PlayerActionPanel {...defaultProps} actionPoints={0} />);
    expect(screen.getByTitle(/Make Camp/)).toBeDisabled();
  });

  it('shows targeting mode indicator and handles cancel', () => {
    render(<PlayerActionPanel {...defaultProps} targetingMode={true} />);
    expect(screen.getByText(/Select target/)).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Cancel pending action'));
    expect(defaultProps.onCancelAction).toHaveBeenCalled();
  });

  it('hides optional buttons when handlers not provided', () => {
    render(
      <PlayerActionPanel {...defaultProps} onOpenInventory={undefined} onOpenSkills={undefined} onExitGame={undefined} />
    );
    expect(screen.queryByTitle('Open Inventory')).toBeNull();
    expect(screen.queryByTitle('Open Skills')).toBeNull();
    expect(screen.queryByTitle('Exit Game')).toBeNull();
  });
});
