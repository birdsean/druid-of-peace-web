import { GameState } from "@/lib/gameLogic";

export interface GameContext {
  gameState: GameState;
  setTargetingMode: (targeting: boolean) => void;
  // When an ability begins it can set `pendingAbility` via this callback.
  // This tells the UI that the ability is awaiting further input and the next
  // applicable interaction should trigger its `execute` method.
  setPendingAbility: (ability: string | null) => void;
  // Clears the pending ability after execution or cancellation.
  clearPendingAbility: () => void;
  /**
   * Generic ability invocation. The game board doesn't need to know
   * about every individual ability function.
   */
  useAbility: (key: string, targetId: "npc1" | "npc2") => void;
  triggerGameOver: (title: string, message: string, icon: string) => void;
}

export interface Ability {
  start?: (ctx: GameContext) => void | Promise<void>;
  execute?: (ctx: GameContext, targetId?: string) => void | Promise<void>;
}
