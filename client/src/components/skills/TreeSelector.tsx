import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SkillTree } from "@/lib/skillTreeLoader";
import { TreePine, Flame, Eye, Mountain } from "lucide-react";

export interface TreeSelectorProps {
  selectedTree: string;
  onTreeSelect: (tree: string) => void;
  skillTrees: Record<string, SkillTree>;
}

export default function TreeSelector({ selectedTree, onTreeSelect, skillTrees }: TreeSelectorProps) {
  const getTreeIcon = (category: string) => {
    switch (category) {
      case "diplomacy":
        return <TreePine className="w-5 h-5" />;
      case "fire":
        return <Flame className="w-5 h-5" />;
      case "stealth":
        return <Eye className="w-5 h-5" />;
      case "earth":
        return <Mountain className="w-5 h-5" />;
      default:
        return <div className="w-5 h-5">🌟</div>;
    }
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className="flex gap-2 bg-black bg-opacity-80 rounded-lg p-3 border-2 border-amber-400">
        {Object.entries(skillTrees).map(([key, tree]) => (
          <Button
            key={key}
            onClick={() => onTreeSelect(key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 font-mono transition-all duration-200",
              selectedTree === key
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-gray-300",
            )}
            style={selectedTree === key ? { borderColor: tree.color } : {}}
          >
            {getTreeIcon(key)}
            <span>{tree.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
