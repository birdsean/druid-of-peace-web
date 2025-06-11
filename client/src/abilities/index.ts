import { Ability } from "./types";
import { peaceAura } from "./peaceAura";
import { flee } from "./flee";

const registry: Record<string, Ability> = {
  peaceAura,
  flee,
};

export default registry;
