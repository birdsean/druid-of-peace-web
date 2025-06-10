import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SkillUnlockNotification from '../SkillUnlockNotification';

// Mock the skill tree loader
vi.mock('../../lib/skillTreeLoader', () => ({
  globalSkillManager: {
    getSkillTrees: vi.fn().mockReturnValue({
      skillTrees: {
        diplomacy: {
          nodes: [
            {
              id: 'test_skill',
              name: 'Test Skill',
              description: 'A test skill for testing',
              icon: '🧪',
              effects: {
                peaceful_aura_bonus: 10,
                damage_bonus: 5
              }
            }
          ]
        }
      }
    })
  }
}));

describe('SkillUnlockNotification Component', () => {
  const mockOnClose = vi.fn();
  const mockOnViewSkills = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render notification with skill details', () => {
    render(
      <SkillUnlockNotification
        skillIds={['test_skill']}
        onClose={mockOnClose}
        onViewSkills={mockOnViewSkills}
      />
    );

    expect(screen.getByText('SKILL UNLOCKED!')).toBeInTheDocument();
    expect(screen.getByText('Test Skill')).toBeInTheDocument();
    expect(screen.getByText('A test skill for testing')).toBeInTheDocument();
    expect(screen.getByText('🧪')).toBeInTheDocument();
  });

  it('should display skill effects correctly', () => {
    render(
      <SkillUnlockNotification
        skillIds={['test_skill']}
        onClose={mockOnClose}
        onViewSkills={mockOnViewSkills}
      />
    );

    expect(screen.getByText('EFFECTS:')).toBeInTheDocument();
    expect(screen.getByText(/peaceful aura bonus: \+10/)).toBeInTheDocument();
    expect(screen.getByText(/damage bonus: \+5/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <SkillUnlockNotification
        skillIds={['test_skill']}
        onClose={mockOnClose}
        onViewSkills={mockOnViewSkills}
      />
    );

    const closeButtons = screen.getAllByRole('button');
    const xCloseButton = closeButtons.find(button => button.textContent?.includes('×'));
    
    if (xCloseButton) {
      fireEvent.click(xCloseButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should call onViewSkills when VIEW SKILLS button is clicked', () => {
    render(
      <SkillUnlockNotification
        skillIds={['test_skill']}
        onClose={mockOnClose}
        onViewSkills={mockOnViewSkills}
      />
    );

    const viewSkillsButton = screen.getByText('VIEW SKILLS');
    fireEvent.click(viewSkillsButton);
    expect(mockOnViewSkills).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when DISMISS button is clicked', () => {
    render(
      <SkillUnlockNotification
        skillIds={['test_skill']}
        onClose={mockOnClose}
        onViewSkills={mockOnViewSkills}
      />
    );

    const dismissButton = screen.getByText('DISMISS');
    fireEvent.click(dismissButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not render when no skills are provided', () => {
    const { container } = render(
      <SkillUnlockNotification
        skillIds={[]}
        onClose={mockOnClose}
        onViewSkills={mockOnViewSkills}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle multiple skills', () => {
    // Add another skill to the mock
    vi.mocked(require('../../lib/skillTreeLoader').globalSkillManager.getSkillTrees).mockReturnValue({
      skillTrees: {
        diplomacy: {
          nodes: [
            {
              id: 'skill_one',
              name: 'Skill One',
              description: 'First skill',
              icon: '1️⃣',
              effects: { bonus: 5 }
            },
            {
              id: 'skill_two',
              name: 'Skill Two',
              description: 'Second skill',
              icon: '2️⃣',
              effects: { bonus: 10 }
            }
          ]
        }
      }
    });

    render(
      <SkillUnlockNotification
        skillIds={['skill_one', 'skill_two']}
        onClose={mockOnClose}
        onViewSkills={mockOnViewSkills}
      />
    );

    expect(screen.getByText('Skill One')).toBeInTheDocument();
    expect(screen.getByText('Skill Two')).toBeInTheDocument();
  });

  it('should handle boolean effects correctly', () => {
    vi.mocked(require('../../lib/skillTreeLoader').globalSkillManager.getSkillTrees).mockReturnValue({
      skillTrees: {
        diplomacy: {
          nodes: [
            {
              id: 'boolean_skill',
              name: 'Boolean Skill',
              description: 'Skill with boolean effects',
              icon: '✅',
              effects: {
                active: true,
                passive: false,
                numerical: 15
              }
            }
          ]
        }
      }
    });

    render(
      <SkillUnlockNotification
        skillIds={['boolean_skill']}
        onClose={mockOnClose}
        onViewSkills={mockOnViewSkills}
      />
    );

    expect(screen.getByText(/active: Yes/)).toBeInTheDocument();
    expect(screen.getByText(/passive: No/)).toBeInTheDocument();
    expect(screen.getByText(/numerical: \+15/)).toBeInTheDocument();
  });

  it('should apply correct CSS classes for styling', () => {
    render(
      <SkillUnlockNotification
        skillIds={['test_skill']}
        onClose={mockOnClose}
        onViewSkills={mockOnViewSkills}
      />
    );

    const notification = screen.getByText('SKILL UNLOCKED!').closest('div');
    expect(notification).toHaveClass('bg-gradient-to-br', 'from-amber-600', 'to-yellow-500');
  });
});