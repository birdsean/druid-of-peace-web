import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatusBar from '@/components/game/StatusBar';

describe('StatusBar', () => {
  const defaultProps = {
    targetingMode: false,
    canUseActions: true,
    combatLogMode: 'hidden' as const,
    showDebugPanel: false,
    onToggleCombatLog: vi.fn(),
    onToggleDebug: vi.fn(),
    onEndTurn: vi.fn(),
    onFlee: vi.fn(),
    onOpenInventory: vi.fn(),
  };

  it('shows status text based on targetingMode', () => {
    const { rerender } = render(<StatusBar {...defaultProps} />);
    expect(screen.getByText('✋ READY')).toBeInTheDocument();
    rerender(<StatusBar {...defaultProps} targetingMode={true} />);
    expect(screen.getByText('🎯 TARGETING')).toBeInTheDocument();
  });

  it('calls handlers on button clicks', () => {
    render(<StatusBar {...defaultProps} />);
    fireEvent.click(screen.getByTitle('Combat Log: hidden'));
    fireEvent.click(screen.getByTitle('End Turn'));
    fireEvent.click(screen.getByTitle('Flee from encounter'));
    expect(defaultProps.onToggleCombatLog).toHaveBeenCalled();
    expect(defaultProps.onEndTurn).toHaveBeenCalled();
    expect(defaultProps.onFlee).toHaveBeenCalled();
  });
});
