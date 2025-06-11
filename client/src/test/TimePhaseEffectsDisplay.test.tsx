import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimePhaseEffectsDisplay from '@/components/game/TimePhaseEffectsDisplay';

// ensure deterministic phase info
vi.mock('@/lib/timeSystem', () => ({
  globalTimeManager: {
    getCurrentPhaseInfo: () => ({
      name: 'Dawn',
      icon: '🌅',
      colorPalette: { accent: '#fff' },
    }),
  },
}));

const effects = ['rain_boost'];

describe('TimePhaseEffectsDisplay', () => {
  it('shows phase info and environmental effects', () => {
    render(<TimePhaseEffectsDisplay activeEnvironmentalEffects={effects} />);
    expect(screen.getByText('🌅')).toBeInTheDocument();
    expect(screen.getByText(/DAWN/i)).toBeInTheDocument();
    expect(screen.getByText(/RAIN_BOOST/)).toBeInTheDocument();
  });
});
