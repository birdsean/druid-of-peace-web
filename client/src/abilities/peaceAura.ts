import { Ability } from "./types";

export const peaceAura: Ability = {
  start(ctx) {
    ctx.setPendingAbility("peaceAura");
    ctx.setTargetingMode(true);
  },
  execute(ctx, targetId) {
    if (!targetId) return;
    ctx.usePeaceAbility(targetId as "npc1" | "npc2");
    ctx.clearPendingAbility();
    ctx.setTargetingMode(false);
  },
};
