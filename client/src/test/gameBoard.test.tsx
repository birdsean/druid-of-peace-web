import { render, screen, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock hooks and data loaders before importing the component
vi.mock('@/hooks/useGameState', () => ({
  useGameState: vi.fn(),
}));
vi.mock('@/hooks/InventoryProvider', () => ({
  useInventoryContext: vi.fn(),
}));
vi.mock('@/lib/characterLoader', () => ({
  loadNPCData: vi.fn(),
  loadPCData: vi.fn(),
}));

import { useGameState } from '@/hooks/useGameState';
import { useInventoryContext } from '@/hooks/InventoryProvider';
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
  targetType: 'self' as const,
  effects: { restoreAP: 1 },
};

const smokeBomb = {
  id: 'smoke_bomb',
  name: 'Smoke Bomb',
  description: 'bomb',
  icon: '💨',
  type: 'consumable' as const,
  targetType: 'npc' as const,
  effects: { reduceAwareness: 5 },
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
  const setPendingAbility = vi.fn();
  const clearPendingAbility = vi.fn();
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
    pendingAbility: null,
    setPendingAbility,
    clearPendingAbility,
    combatLogMode: 'hidden',
    toggleCombatLog: vi.fn(),
    triggerGameOver: vi.fn(),
    turnManagerRef: { current: null },
    setAutoTurnEnabled: vi.fn(),
    applyItemEffects,
  });

  (useInventoryContext as any).mockReturnValue({
    inventory: { items: [{ item: energyCrystal, count: 1 }, { item: smokeBomb, count: 1 }] },
    useItem: vi.fn().mockReturnValue(true),
  });
});

function setup() {
  return render(<GameBoard />);
}

describe('GameBoard component', () => {
  it('activates targeting mode on Peace Aura click', async () => {
    const { rerender } = setup();
    await waitForElementToBeRemoved(() => screen.getByText(/Loading character data/i));
    const btn = screen.getByTitle(/Peace Aura/i);
    fireEvent.click(btn);

    const state = (useGameState as any).mock.results[0].value;
    expect(state.setTargetingMode).toHaveBeenCalledWith(true);
    expect(state.setPendingAbility).toHaveBeenCalledWith('peaceAura');

    // simulate UI state change to show banner
    state.gameState.targetingMode = true;
    rerender(<GameBoard />);

    expect(screen.getByText(/TARGETING MODE/i)).toBeInTheDocument();
  });

  it('executes Peace Aura on selected NPC', async () => {
    const { rerender } = setup();
    await waitForElementToBeRemoved(() => screen.getByText(/Loading character data/i));
    const btn = screen.getByTitle(/Peace Aura/i);
    fireEvent.click(btn);

    // simulate state update after ability start
    const state = (useGameState as any).mock.results[0].value;
    state.pendingAbility = 'peaceAura';
    rerender(<GameBoard />);

    const npcIcon = screen.getAllByText(npcTemplate.icon)[0];
    fireEvent.click(npcIcon);

    expect(state.usePeaceAbility).toHaveBeenCalledWith('npc1');
    expect(state.clearPendingAbility).toHaveBeenCalled();
    expect(state.setTargetingMode).toHaveBeenCalledWith(false);
  });

  it('uses item and applies effects', async () => {
    setup();
    await waitForElementToBeRemoved(() => screen.getByText(/Loading character data/i));
    fireEvent.click(screen.getByTitle('Use Item'));
    const itemButton = await screen.findByTitle(energyCrystal.description);
    fireEvent.click(itemButton);

    const { applyItemEffects } = (useGameState as any).mock.results[0].value;
    const { useItem } = (useInventoryContext as any).mock.results[0].value;

    expect(useItem).toHaveBeenCalledWith('energy_crystal');
    expect(applyItemEffects).toHaveBeenCalledWith(energyCrystal.effects, energyCrystal.name);
  });

  it('handles npc-target item in two phases', async () => {
    const { rerender } = setup();
    await waitForElementToBeRemoved(() => screen.getByText(/Loading character data/i));
    fireEvent.click(screen.getByTitle('Use Item'));
    const itemButton = await screen.findByTitle(smokeBomb.description);
    fireEvent.click(itemButton);

    const state = (useGameState as any).mock.results[0].value;
    const ctx = (useInventoryContext as any).mock.results[0].value;
    expect(ctx.useItem).not.toHaveBeenCalled();
    expect(state.setTargetingMode).toHaveBeenCalledWith(true);

    rerender(<GameBoard />);
    const npcIcon = screen.getAllByText(npcTemplate.icon)[0];
    fireEvent.click(npcIcon);

    expect(ctx.useItem).toHaveBeenCalledWith('smoke_bomb');
    expect(state.applyItemEffects).toHaveBeenCalledWith(smokeBomb.effects, smokeBomb.name, 'npc1');
    expect(state.setTargetingMode).toHaveBeenCalledWith(false);
  });

  it('cancels targeting mode via button', async () => {
    const { rerender } = setup();
    await waitForElementToBeRemoved(() => screen.getByText(/Loading character data/i));
    const btn = screen.getByTitle(/Peace Aura/i);
    fireEvent.click(btn);

    const state = (useGameState as any).mock.results[0].value;
    state.gameState.targetingMode = true;
    rerender(<GameBoard />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(state.clearPendingAbility).toHaveBeenCalled();
    expect(state.setTargetingMode).toHaveBeenCalledWith(false);
  });

  it('displays active weather effect from map state', async () => {
    setup();
    await waitForElementToBeRemoved(() => screen.getByText(/Loading character data/i));
    expect(screen.getByText(/RAIN_BOOST/i)).toBeInTheDocument();
  });
});

