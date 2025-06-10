import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DebugPanel from '@/components/game/DebugPanel';

const baseProps = {
  visible: true,
  debugState: { autoTurn: true },
  onToggleAutoTurn: vi.fn(),
  onNPCAction: vi.fn(),
};

describe('DebugPanel', () => {
  it('does not render when not visible', () => {
    const { container } = render(<DebugPanel {...baseProps} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('toggles auto turn', () => {
    render(<DebugPanel {...baseProps} />);
    fireEvent.click(screen.getByTitle('Toggle automatic NPC turns'));
    expect(baseProps.onToggleAutoTurn).toHaveBeenCalled();
  });

  it('shows manual actions when autoTurn is off', () => {
    render(<DebugPanel {...baseProps} debugState={{ autoTurn: false }} />);
    fireEvent.click(screen.getByTitle('Gareth Attack'));
    expect(baseProps.onNPCAction).toHaveBeenCalledWith('npc1', 'attack');
  });
});
