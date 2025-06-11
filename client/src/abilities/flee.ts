import { Ability } from "./types";

export const flee: Ability = {
  start(ctx) {
    const confirmed = window.confirm(
      "Are you sure you want to flee? This will count as a loss and the conflict will remain unresolved."
    );
    if (confirmed) {
      ctx.triggerGameOver(
        "FLED ENCOUNTER",
        "The druid escaped, but the conflict remains unresolved...",
        "🏃"
      );
    }
  },
};
