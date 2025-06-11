import { describe, it, expect, vi } from "vitest";
import { TurnManager } from "../lib/turnManager";
import type { GameState, DiceState } from "../lib/gameLogic";

function createBaseState(
  currentTurn: "npc1" | "npc2" | "druid",
  turnCounter = 1,
): GameState {
  return {
    currentTurn,
    turnCounter,
    npc1: {
      id: "npc1",
      name: "NPC 1",
      icon: "",
      color: "",
      description: "",
      position: "left",
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
      immobilized: 0,
    },
    npc2: {
      id: "npc2",
      name: "NPC 2",
      icon: "",
      color: "",
      description: "",
      position: "right",
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
      immobilized: 0,
    },
    druid: {
      id: "druid",
      name: "Druid",
      icon: "",
      color: "",
      stats: {
        hidden: true,
        actionPoints: 3,
        maxActionPoints: 3,
      },
      abilities: [],
    },
    gameOver: false,
    targetingMode: false,
    combatLog: [],
    gameOverState: null,
  };
}

describe("TurnManager", () => {
  it("advanceTurn cycles turns correctly", () => {
    const manager = new TurnManager(vi.fn(), vi.fn(), vi.fn(), vi.fn());

    let state = createBaseState("npc1", 1);
    state = manager.advanceTurn(state);
    expect(state.currentTurn).toBe("npc2");
    expect(state.turnCounter).toBe(1);

    state = manager.advanceTurn(state);
    expect(state.currentTurn).toBe("druid");
    expect(state.turnCounter).toBe(1);

    state = manager.advanceTurn(state);
    expect(state.currentTurn).toBe("npc1");
    expect(state.turnCounter).toBe(2);
  });

  it("manualAdvanceTurn advances when game not ended", () => {
    const setGameState = vi.fn();
    const manager = new TurnManager(
      setGameState,
      vi.fn(),
      vi.fn(),
      vi.fn().mockReturnValue(false),
    );

    manager.manualAdvanceTurn();
    expect(setGameState).toHaveBeenCalledTimes(1);

    const updateFn = setGameState.mock.calls[0][0] as (
      s: GameState,
    ) => GameState;
    const base = createBaseState("npc1", 1);
    const result = updateFn(base);

    expect(result.currentTurn).toBe("npc2");
    expect(result.turnCounter).toBe(1);
  });

  it("manualAdvanceTurn does not advance when game ended", () => {
    const setGameState = vi.fn();
    const checkEnd = vi.fn().mockReturnValue(true);
    const manager = new TurnManager(setGameState, vi.fn(), vi.fn(), checkEnd);

    manager.manualAdvanceTurn();
    expect(setGameState).toHaveBeenCalledTimes(1);

    const updateFn = setGameState.mock.calls[0][0] as (
      s: GameState,
    ) => GameState;
    const base = createBaseState("npc1", 1);
    const result = updateFn(base);

    expect(checkEnd).toHaveBeenCalledWith(base);
    expect(result).toBe(base);
  });

  it("executeTurn resolves NPC turns using timers", async () => {
    vi.useFakeTimers();

    const setGameState = vi.fn();
    const addLogEntry = vi.fn();
    const manager = new TurnManager(
      setGameState,
      vi.fn(),
      addLogEntry,
      vi.fn().mockReturnValue(false),
    );

    vi.spyOn(manager, "rollDiceWithAnimation").mockResolvedValue(4);
    vi.spyOn(Math, "random").mockReturnValue(0);

    const base = createBaseState("npc1", 1);
    base.npc2.stats.armor = 5;
    base.npc2.stats.maxArmor = 5;

    const promise = manager.executeTurn(base);
    await vi.runAllTimersAsync();
    await promise;

    expect(setGameState).toHaveBeenCalledTimes(2);

    const stateAfterAction = (
      setGameState.mock.calls[0][0] as (s: GameState) => GameState
    )(base);

    expect(addLogEntry).toHaveBeenCalledTimes(1);
    expect(addLogEntry.mock.calls[0][0]).toContain("Gareth attacks");

    expect(stateAfterAction.npc2.stats.armor).toBe(0);
    expect(stateAfterAction.npc2.stats.health).toBe(5);
    expect(stateAfterAction.npc2.stats.willToFight).toBeCloseTo(7.5);

    const finalState = (
      setGameState.mock.calls[1][0] as (s: GameState) => GameState
    )(stateAfterAction);

    expect(finalState.currentTurn).toBe("npc2");
    expect(finalState.turnCounter).toBe(1);

    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("skips turn when NPC is snared", async () => {
    vi.useFakeTimers();

    const setGameState = vi.fn();
    const addLogEntry = vi.fn();
    const manager = new TurnManager(
      setGameState,
      vi.fn(),
      addLogEntry,
      vi.fn().mockReturnValue(false),
    );

    const base = createBaseState("npc1", 1);
    (base as any).npc1.immobilized = 1;

    const promise = manager.executeTurn(base);
    await vi.runAllTimersAsync();
    await promise;

    expect(addLogEntry).toHaveBeenCalledWith(
      expect.stringContaining("restrained"),
    );

    expect(setGameState).toHaveBeenCalledTimes(2);
    const afterDebuff = (
      setGameState.mock.calls[0][0] as (s: GameState) => GameState
    )(base);
    expect(afterDebuff.npc1.immobilized).toBe(0);

    const updated = (
      setGameState.mock.calls[1][0] as (s: GameState) => GameState
    )(afterDebuff);
    expect(updated.currentTurn).toBe("npc2");

    vi.useRealTimers();
  });
});
