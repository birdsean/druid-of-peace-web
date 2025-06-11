import { Ability } from "./types";
import { peaceAura } from "./peaceAura";
import { flee } from "./flee";
import { vineSnare } from "./vineSnare";

const registry: Record<string, Ability> = {
  peaceAura,
  flee,
  vineSnare,
};

export default registry;
