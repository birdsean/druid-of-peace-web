import { GameState, rollDice, executeNPCAction, DiceState } from './gameLogic';

export class TurnManager {
  private isExecuting = false;
  private executionPromise: Promise<void> | null = null;

  constructor(
    private setGameState: React.Dispatch<React.SetStateAction<GameState>>,
    private setDiceState: React.Dispatch<React.SetStateAction<DiceState>>,
    private addLogEntry: (entry: string) => void,
    private checkGameEnd: (state?: GameState) => boolean
  ) {}

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

    if (currentTurn === 'druid') {
      // Druid turn - wait for manual action, don't auto-execute
      return;
    }

    // NPC turn - auto-execute
    const npcId = currentTurn;
    const roll = await this.rollDiceWithAnimation();
    const action = executeNPCAction(roll);

    // Update game state with NPC action
    this.setGameState(prev => {
      const newState = { ...prev };
      const npc = newState[npcId];
      const targetId = npcId === 'npc1' ? 'npc2' : 'npc1';
      const target = newState[targetId];

      switch (action.type) {
        case 'attack':
          const damage = Math.floor(Math.random() * 20) + 10;
          let remainingDamage = damage;
          let armorDamage = 0;
          let healthDamage = 0;
          
          // Apply damage to armor first
          if (target.armor > 0) {
            armorDamage = Math.min(target.armor, remainingDamage);
            target.armor = Math.max(0, target.armor - armorDamage);
            remainingDamage -= armorDamage;
          }
          
          // Apply remaining damage to health
          if (remainingDamage > 0) {
            const oldHealth = target.health;
            target.health = Math.max(0, target.health - remainingDamage);
            healthDamage = oldHealth - target.health;
          }
          
          // Will to fight decreases based on health damage only
          const willLost = healthDamage * 0.5;
          target.willToFight = Math.max(0, target.willToFight - willLost);
          
          let damageText = `${damage} damage`;
          if (armorDamage > 0 && healthDamage > 0) {
            damageText += ` (${armorDamage} to armor, ${healthDamage} to health)`;
          } else if (armorDamage > 0) {
            damageText += ` (blocked by armor)`;
          }
          
          this.addLogEntry(`${npcId === 'npc1' ? 'Gareth' : 'Lyra'} attacks for ${damageText}${willLost > 0 ? ` (${willLost.toFixed(1)} will lost)` : ''}`);
          break;
        case 'defend':
          npc.health = Math.min(npc.maxHealth, npc.health + 5);
          this.addLogEntry(`${npcId === 'npc1' ? 'Gareth' : 'Lyra'} defends and recovers`);
          break;
        default:
          // Handle any other action types
          this.addLogEntry(`${npcId === 'npc1' ? 'Gareth' : 'Lyra'} takes an unknown action`);
          break;
      }

      return newState;
    });

    // Wait for action animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check for game end and advance turn
    this.setGameState(prev => {
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
        effect: 'Rolling...'
      });

      setTimeout(() => {
        const result = rollDice(1, 6);
        this.setDiceState(prev => ({
          ...prev,
          rolling: false,
          result,
          effect: `Rolled ${result}`
        }));

        setTimeout(() => {
          this.setDiceState(prev => ({ ...prev, visible: false }));
          resolve(result);
        }, 1000);
      }, 1000);
    });
  }

  advanceTurn(state: GameState): GameState {
    let newTurn: 'npc1' | 'npc2' | 'druid';
    let newTurnCounter = state.turnCounter;

    if (state.currentTurn === 'npc1') {
      newTurn = 'npc2';
    } else if (state.currentTurn === 'npc2') {
      newTurn = 'druid';
    } else {
      newTurn = 'npc1';
      newTurnCounter++;
    }

    return {
      ...state,
      currentTurn: newTurn,
      turnCounter: newTurnCounter
    };
  }

  manualAdvanceTurn(): void {
    this.setGameState(prev => {
      if (!this.checkGameEnd(prev)) {
        return this.advanceTurn(prev);
      }
      return prev;
    });
  }

  isCurrentlyExecuting(): boolean {
    return this.isExecuting;
  }
}