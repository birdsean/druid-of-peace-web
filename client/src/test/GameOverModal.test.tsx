import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('wouter', () => ({
  useLocation: () => ['', vi.fn()],
}));

const resolveEncounter = vi.fn();
vi.mock('../lib/mapState', () => ({
  getGlobalMapState: () => ({
    resolveEncounter,
    currentEncounterZone: 'zone1',
  }),
}));

import { globalHistoryManager } from '../lib/historySystem';
import { debugReset } from '../lib/historyDebug';
import GameOverModal from '../components/game/GameOverModal';

describe('GameOverModal history', () => {
  beforeEach(() => {
    debugReset(globalHistoryManager);
    vi.restoreAllMocks();
  });

  it('records successful encounters', () => {
    const onRestart = vi.fn();
    const spy = vi.spyOn(globalHistoryManager, 'completeEncounter');

    render(
      <GameOverModal
        visible
        title="PEACE ACHIEVED"
        message="done"
        icon=""
        onRestart={onRestart}
      />
    );

    fireEvent.click(screen.getByText(/RETURN TO MAP/i));
    expect(spy).toHaveBeenCalledWith('success');
    expect(onRestart).toHaveBeenCalled();
  });

  it('records fled encounters', () => {
    const onRestart = vi.fn();
    const spy = vi.spyOn(globalHistoryManager, 'completeEncounter');

    render(
      <GameOverModal
        visible
        title="FLED ENCOUNTER"
        message="done"
        icon=""
        onRestart={onRestart}
      />
    );

    fireEvent.click(screen.getByText(/RETURN TO MAP/i));
    expect(spy).toHaveBeenCalledWith('fled');
  });
});
