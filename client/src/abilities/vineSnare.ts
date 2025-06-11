import { Ability } from "./types";

export const vineSnare: Ability = {
  start(ctx) {
    ctx.setPendingAbility("vineSnare");
    ctx.setTargetingMode(true);
  },
  execute(ctx, targetId) {
    if (!targetId) return;
    ctx.useAbility("vineSnare", targetId as "npc1" | "npc2");
    ctx.clearPendingAbility();
    ctx.setTargetingMode(false);
  },
};
