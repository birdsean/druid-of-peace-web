import { Button } from "@/components/ui/button";
import { SkillNodeDisplay } from "@/lib/skillTreeLoader";

export interface SkillDetailPanelProps {
  node: SkillNodeDisplay | null;
  onClose: () => void;
  onLearn: (skillId: string) => void;
  onPanelHover?: (isHovering: boolean) => void;
}

export default function SkillDetailPanel({
  node,
  onClose,
  onLearn,
  onPanelHover,
}: SkillDetailPanelProps) {
  if (!node) return null;

  return (
    <div
      className="absolute right-4 top-4 bottom-4 w-80 bg-black bg-opacity-90 rounded-lg p-6 border-2 border-amber-400 z-30"
      onMouseEnter={() => onPanelHover?.(true)}
      onMouseLeave={() => {
        onPanelHover?.(false);
        setTimeout(onClose, 200);
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-mono text-amber-400">{node.name}</h3>
        <Button onClick={onClose} className="w-8 h-8 p-0 bg-gray-700 hover:bg-gray-600">
          ✕
        </Button>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">{node.icon}</div>
          <div className="flex gap-2 justify-center flex-wrap">
            {node.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 bg-gray-700 rounded font-mono">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-amber-400 font-mono text-sm mb-2">DESCRIPTION:</h4>
          <p className="text-gray-300 text-sm">{node.description}</p>
        </div>

        <div>
          <h4 className="text-amber-400 font-mono text-sm mb-2">HINT:</h4>
          <p className="text-gray-400 text-sm italic">"{node.hint}"</p>
        </div>

        <div>
          <h4 className="text-amber-400 font-mono text-sm mb-2">TYPE:</h4>
          <p className="text-gray-300 text-sm capitalize">{node.type}</p>
        </div>

        {Object.keys(node.effects).length > 0 && (
          <div>
            <h4 className="text-amber-400 font-mono text-sm mb-2">EFFECTS:</h4>
            <div className="space-y-1">
              {Object.entries(node.effects).map(([key, value]) => (
                <div key={key} className="text-xs text-gray-300 font-mono">
                  • {key}:{" "}
                  {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-600">
          {node.isLearned ? (
            <div className="text-green-400 font-mono text-center">✓ LEARNED</div>
          ) : node.isPending ? (
            <Button onClick={() => onLearn(node.id)} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-mono animate-pulse">
              CLAIM SKILL
            </Button>
          ) : node.isDiscovered ? (
            <Button onClick={() => onLearn(node.id)} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-mono">
              LEARN SKILL
            </Button>
          ) : (
            <div className="text-gray-500 font-mono text-center">❓ UNKNOWN</div>
          )}
        </div>
      </div>
    </div>
  );
}
