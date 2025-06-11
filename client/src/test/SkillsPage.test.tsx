import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSetLocation = vi.fn();

vi.mock('wouter', () => ({
  useLocation: () => ['', mockSetLocation],
}));

vi.mock('../lib/skillTreeLoader', async () => {
  const actual = await vi.importActual('../lib/skillTreeLoader');
  const sampleData = {
    skillTrees: {
      diplomacy: {
        category: 'diplomacy',
        name: 'Diplomacy',
        description: '',
        icon: 'D',
        color: '#fff',
        nodes: [],
      },
    },
  };
  return {
    ...actual,
    globalSkillManager: {
      loadSkillTrees: vi.fn().mockResolvedValue(sampleData),
      getVisibleSkillsForTree: vi.fn().mockReturnValue([]),
      subscribe: vi.fn().mockReturnValue(() => {}),
      learnSkill: vi.fn(),
      debugLearnAllSkills: vi.fn(),
      debugResetSkills: vi.fn(),
    },
  };
});

import Skills from '../pages/skills';

beforeEach(() => {
  mockSetLocation.mockClear();
});

describe('Skills page navigation', () => {
  it('navigates to map when exit button clicked', async () => {
    render(<Skills />);
    const btn = await screen.findByRole('button', { name: /Exit to Map/i });
    fireEvent.click(btn);
    expect(mockSetLocation).toHaveBeenCalledWith('/map');
  });

  it('navigates to map on Escape key', async () => {
    render(<Skills />);
    await screen.findByRole('button', { name: /Exit to Map/i });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockSetLocation).toHaveBeenCalledWith('/map');
  });
});
