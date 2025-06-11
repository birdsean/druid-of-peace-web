import { render, screen, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock hooks and data loaders before importing the component
vi.mock('@/hooks/useGameState', () => ({
  useGameState: vi.fn(),
}));
vi.mock('@/hooks/useInventory', () => ({
  useInventory: vi.fn(),
}));
vi.mock('@/lib/characterLoader', () => ({
  loadNPCData: vi.fn(),
  loadPCData: vi.fn(),
}));

import { useGameState } from '@/hooks/useGameState';
import { useInventory } from '@/hooks/useInventory';
import { loadNPCData, loadPCData } from '@/lib/characterLoader';
import { setGlobalMapState } from '@/lib/mapState';
import GameBoard from '@/components/game/GameBoard';

const npcTemplate = {
  id: 'npc',
  name: 'NPC',
  icon: 'N',
  color: 'gray',
  position: 'left' as const,
  description: '',
  stats: {
    health: 10,
    maxHealth: 10,
    armor: 0,
    maxArmor: 0,
    willToFight: 10,
    maxWill: 10,
    awareness: 0,
    maxAwareness: 100,
  },
  actions: [],
};

const energyCrystal = {
  id: 'energy_crystal',
  name: 'Energy Crystal',
  description: 'restore',
  icon: '💎',
  type: 'consumable' as const,
  effects: { restoreAP: 1 },
};

const pcData = {
  id: 'druid',
  name: 'Druid',
  icon: '🌿',
  color: 'green',
  stats: { hidden: false, actionPoints: 2, maxActionPoints: 2 },
  abilities: [
    { key: 'peaceAura', name: 'Peace Aura', description: 'Calm foes', icon: '🕊️', cost: 1 },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  setGlobalMapState({ resolveEncounter: vi.fn(), currentEncounterZone: 'zone1', activeWeatherEffect: 'rain_boost' });
  (loadNPCData as any).mockResolvedValue([
    { ...npcTemplate, id: 'npc1' },
    { ...npcTemplate, id: 'npc2' },
  ]);
  (loadPCData as any).mockResolvedValue(pcData);

  const setTargetingMode = vi.fn();
  const applyItemEffects = vi.fn();
  const gameState = {
    currentTurn: 'druid' as const,
    turnCounter: 1,
    npc1: { ...npcTemplate, id: 'npc1' },
    npc2: { ...npcTemplate, id: 'npc2', position: 'right' as const },
    druid: { ...pcData },
    gameOver: false,
    targetingMode: false,
    combatLog: [],
    gameOverState: null,
  };

  (useGameState as any).mockReturnValue({
    gameState,
    diceState: { visible: false, rolling: false, result: null, effect: '' },
    usePeaceAbility: vi.fn(),
    endTurn: vi.fn(),
    restartGame: vi.fn(),
    setTargetingMode,
    combatLogMode: 'hidden',
    toggleCombatLog: vi.fn(),
    triggerGameOver: vi.fn(),
    turnManagerRef: { current: null },
    setAutoTurnEnabled: vi.fn(),
    applyItemEffects,
  });

  (useInventory as any).mockReturnValue({
    inventory: { items: [{ item: energyCrystal, count: 1 }] },
    useItem: vi.fn().mockReturnValue(true),
  });
});

function setup() {
  return render(<GameBoard />);
}

describe('GameBoard component', () => {
  it('activates targeting mode on Peace Aura click', async () => {
    const { container } = setup();
    await waitForElementToBeRemoved(() => screen.getByText(/Loading character data/i));
    const btn = screen.getByTitle(/Peace Aura/i);
    fireEvent.click(btn);

    const { setTargetingMode } = (useGameState as any).mock.results[0].value;
    expect(setTargetingMode).toHaveBeenCalledWith(true);
  });

  it('uses item and applies effects', async () => {
    setup();
    await waitForElementToBeRemoved(() => screen.getByText(/Loading character data/i));
    fireEvent.click(screen.getByTitle('Use Item'));
    const itemButton = await screen.findByTitle(energyCrystal.description);
    fireEvent.click(itemButton);

    const { applyItemEffects } = (useGameState as any).mock.results[0].value;
    const { useItem } = (useInventory as any).mock.results[0].value;

    expect(useItem).toHaveBeenCalledWith('energy_crystal');
    expect(applyItemEffects).toHaveBeenCalledWith(energyCrystal.effects, energyCrystal.name);
  });

  it('displays active weather effect from map state', async () => {
    setup();
    await waitForElementToBeRemoved(() => screen.getByText(/Loading character data/i));
    expect(screen.getByText(/RAIN_BOOST/i)).toBeInTheDocument();
  });
});

