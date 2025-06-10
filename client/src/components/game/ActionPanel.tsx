import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PCAbility } from "@/lib/characterLoader";

interface ActionPanelProps {
  abilities: PCAbility[];
  actionPoints: number;
  canUseActions: boolean;
  onAbilityUse: (abilityKey: string) => void;
}

export default function ActionPanel({
  abilities,
  actionPoints,
  canUseActions,
  onAbilityUse,
}: ActionPanelProps) {
  return (
    <div className="flex space-x-4">
      {abilities.map((ability) => (
        <Button
          key={ability.key}
          onClick={() => onAbilityUse(ability.key)}
          disabled={
            !canUseActions ||
            actionPoints <= 0 ||
            ability.cost > actionPoints
          }
          className={cn(
            "w-12 h-12 text-2xl border-2 transition-all duration-200",
            canUseActions &&
              actionPoints > 0 &&
              ability.cost <= actionPoints
              ? "bg-green-600 hover:bg-green-700 border-green-400 text-white"
              : "bg-gray-500 border-gray-400 text-gray-300 cursor-not-allowed",
          )}
          title={`${ability.name}: ${ability.description} (Cost: ${ability.cost})`}
        >
          {ability.icon}
        </Button>
      ))}
    </div>
  );
}
