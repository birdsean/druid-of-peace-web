import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SkillNode from '@/components/skills/SkillNode';
import ConnectionLine from '@/components/skills/ConnectionLine';
import SkillDetailPanel from '@/components/skills/SkillDetailPanel';
import TreeSelector from '@/components/skills/TreeSelector';
import type { SkillNodeDisplay, SkillTree } from '@/lib/skillTreeLoader';

const sampleNode: SkillNodeDisplay = {
  id: 'test',
  name: 'Test Skill',
  description: 'desc',
  hint: 'hint',
  tags: [],
  category: 'test',
  prerequisites: [],
  connections: [],
  position: { x: 10, y: 20 },
  icon: 'T',
  type: 'passive',
  effects: {},
  isLearned: false,
  isDiscovered: true,
  isVisible: true,
  isPending: false,
};

const treeData: Record<string, SkillTree> = {
  test: {
    category: 'test',
    name: 'Test Tree',
    description: '',
    icon: 't',
    color: '#fff',
    nodes: [],
  },
  other: {
    category: 'other',
    name: 'Other Tree',
    description: '',
    icon: 'o',
    color: '#000',
    nodes: [],
  },
};

describe('Skill components', () => {
  it('SkillNode calls handlers on interaction', () => {
    const hover = vi.fn();
    const learn = vi.fn();
    const click = vi.fn();
    render(
      <SkillNode
        node={sampleNode}
        onHover={hover}
        onLearn={learn}
        onClick={click}
        treeColor="#fff"
      />,
    );

    const nodeEl = screen.getByText('T').parentElement as HTMLElement;
    fireEvent.mouseEnter(nodeEl);
    expect(hover).toHaveBeenCalledWith(sampleNode);

    fireEvent.mouseLeave(nodeEl);
    expect(hover).toHaveBeenLastCalledWith(null);

    fireEvent.click(nodeEl);
    expect(learn).toHaveBeenCalledWith('test');
    expect(click).toHaveBeenCalled();
  });

  it('ConnectionLine sets style correctly', () => {
    render(
      <ConnectionLine
        from={{ x: 0, y: 0 }}
        to={{ x: 3, y: 4 }}
        color="#000"
        active
      />,
    );
    const line = screen.getByRole('presentation');
    expect(line.style.width).toBe('5px');
    expect(line.style.transform).toContain('rotate');
  });

  it('SkillDetailPanel shows info and triggers actions', () => {
    const close = vi.fn();
    const learn = vi.fn();
    const hover = vi.fn();
    render(
      <SkillDetailPanel
        node={sampleNode}
        onClose={close}
        onLearn={learn}
        onPanelHover={hover}
      />,
    );

    expect(screen.getByText('Test Skill')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /LEARN SKILL/i }));
    expect(learn).toHaveBeenCalledWith('test');
    fireEvent.click(screen.getByRole('button', { name: /✕/i }));
    expect(close).toHaveBeenCalled();
  });

  it('TreeSelector renders buttons and selects tree', () => {
    const select = vi.fn();
    render(
      <TreeSelector selectedTree="test" onTreeSelect={select} skillTrees={treeData} />,
    );

    const otherBtn = screen.getByRole('button', { name: /Other Tree/i });
    fireEvent.click(otherBtn);
    expect(select).toHaveBeenCalledWith('other');
  });
});
