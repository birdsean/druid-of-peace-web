import { GameState, rollDice, executeNPCAction, DiceState } from "./gameLogic";

export class TurnManager {
  private isExecuting = false;
  private executionPromise: Promise<void> | null = null;
  private autoTurnEnabled = true;

  constructor(
    private setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    private setDiceState: React.Dispatch<React.SetStateAction<DiceState>>,
    private addLogEntry: (entry: string) => void,
    private checkGameEnd: (state?: GameState) => boolean,
  ) {}

  setAutoTurnEnabled(enabled: boolean) {
    this.autoTurnEnabled = enabled;
  }

  async executeTurn(currentState: GameState): Promise<void> {
    // Prevent multiple executions
    if (this.isExecuting) {
      return this.executionPromise || Promise.resolve();
    }

    this.isExecuting = true;
    this.executionPromise = this._doExecuteTurn(currentState);

    try {
      await this.executionPromise;
    } finally {
      this.isExecuting = false;
      this.executionPromise = null;
    }
  }

  private async _doExecuteTurn(currentState: GameState): Promise<void> {
    const { currentTurn } = currentState;

    if (currentTurn === "druid") {
      // Druid turn - wait for manual action, don't auto-execute
      return;
    }

    // NPC turn - only auto-execute if auto-turn is enabled
    if (!this.autoTurnEnabled) {
      return;
    }

    const npcId = currentTurn;
    const roll = await this.rollDiceWithAnimation();
    const action = executeNPCAction(roll);

    // Update game state with NPC action
    this.setGameState((prev) => {
      const newState = { ...prev };
      const npc = newState[npcId];
      const targetId = npcId === "npc1" ? "npc2" : "npc1";
      const target = newState[targetId];

      switch (action.type) {
        case "attack":
          const damage = Math.floor(Math.random() * 20) + 10;
          let remainingDamage = damage;
          let armorDamage = 0;
          let healthDamage = 0;
          const { stats } = target;

          // Apply damage to armor first
          if (stats.armor > 0) {
            armorDamage = Math.min(stats.armor, remainingDamage);
            stats.armor = Math.max(0, stats.armor - armorDamage);
            remainingDamage -= armorDamage;
          }

          // Apply remaining damage to health
          if (remainingDamage > 0) {
            const oldHealth = stats.health;
            stats.health = Math.max(0, stats.health - remainingDamage);
            healthDamage = oldHealth - stats.health;
          }

          // Will to fight decreases based on health damage only
          const willLost = healthDamage * 0.5;
          stats.willToFight = Math.max(0, stats.willToFight - willLost);

          let damageText = `${damage} damage`;
          if (armorDamage > 0 && healthDamage > 0) {
            damageText += ` (${armorDamage} to armor, ${healthDamage} to health)`;
          } else if (armorDamage > 0) {
            damageText += ` (blocked by armor)`;
          }

          this.addLogEntry(
            `${npcId === "npc1" ? "Gareth" : "Lyra"} attacks for ${damageText}${willLost > 0 ? ` (${willLost.toFixed(1)} will lost)` : ""}`,
          );
          break;
        case "defend":
          npc.stats.health = Math.min(
            npc.stats.maxHealth,
            npc.stats.health + 5,
          );
          this.addLogEntry(
            `${npcId === "npc1" ? "Gareth" : "Lyra"} defends and recovers`,
          );
          break;
        default:
          // Handle any other action types
          this.addLogEntry(
            `${npcId === "npc1" ? "Gareth" : "Lyra"} takes an unknown action`,
          );
          break;
      }

      return newState;
    });

    // Wait for action animation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check for game end and advance turn
    this.setGameState((prev) => {
      if (!this.checkGameEnd(prev)) {
        return this.advanceTurn(prev);
      }
      return prev;
    });
  }

  async rollDiceWithAnimation(): Promise<number> {
    return new Promise((resolve) => {
      this.setDiceState({
        visible: true,
        rolling: true,
        result: null,
        effect: "Rolling...",
      });

      setTimeout(() => {
        const result = rollDice(1, 6);
        this.setDiceState((prev) => ({
          ...prev,
          rolling: false,
          result,
          effect: `Rolled ${result}`,
        }));

        setTimeout(() => {
          this.setDiceState((prev) => ({ ...prev, visible: false }));
          resolve(result);
        }, 1000);
      }, 1000);
    });
  }

  advanceTurn(state: GameState): GameState {
    let newTurn: "npc1" | "npc2" | "druid";
    let newTurnCounter = state.turnCounter;

    if (state.currentTurn === "npc1") {
      newTurn = "npc2";
    } else if (state.currentTurn === "npc2") {
      newTurn = "druid";
    } else {
      newTurn = "npc1";
      newTurnCounter++;
    }

    return {
      ...state,
      currentTurn: newTurn,
      turnCounter: newTurnCounter,
    };
  }

  manualAdvanceTurn(): void {
    this.setGameState((prev) => {
      if (!this.checkGameEnd(prev)) {
        return this.advanceTurn(prev);
      }
      return prev;
    });
  }

  isCurrentlyExecuting(): boolean {
    return this.isExecuting;
  }

  async executeDebugNPCAction(
    npcId: "npc1" | "npc2",
    actionType: "attack" | "defend",
  ): Promise<void> {
    if (this.isExecuting) return;

    this.isExecuting = true;

    try {
      const roll = await this.rollDiceWithAnimation();

      // Force the action type instead of using roll to determine it
      const action = {
        type: actionType,
        description:
          actionType === "attack"
            ? "attacks fiercely!"
            : "takes a defensive stance.",
      };

      // Update game state with forced NPC action
      this.setGameState((prev) => {
        const newState = { ...prev };
        const npc = newState[npcId];
        const targetId = npcId === "npc1" ? "npc2" : "npc1";
        const target = newState[targetId];
        const { stats } = target;

        if (action.type === "attack") {
          // Apply damage, accounting for armor
          const damage = Math.max(1, roll - stats.armor);
          stats.health = Math.max(0, stats.health - damage);
          stats.armor = Math.max(0, stats.armor - 1); // Reduce armor
        } else {
          // Defend - restore some armor
          npc.stats.armor = Math.min(
            npc.stats.maxArmor,
            npc.stats.armor + roll,
          );
        }

        return newState;
      });

      this.addLogEntry(
        `${npcId === "npc1" ? "Gareth" : "Lyra"} ${action.description} (Roll: ${roll})`,
      );

      // Check for game end after action
      setTimeout(() => {
        this.setGameState((prev) => {
          this.checkGameEnd(prev);
          return prev;
        });
      }, 1000);

      // Advance turn after action
      setTimeout(() => {
        this.setGameState((prev) => this.advanceTurn(prev));
      }, 1500);
    } finally {
      this.isExecuting = false;
    }
  }
}
