import { SkillNodeDisplay } from "@/lib/skillTreeLoader";

export interface SkillNodeProps {
  node: SkillNodeDisplay;
  onHover: (node: SkillNodeDisplay | null) => void;
  onLearn: (skillId: string) => void;
  onClick: () => void;
  treeColor: string;
}

export default function SkillNode({
  node,
  onHover,
  onLearn,
  onClick,
  treeColor,
}: SkillNodeProps) {
  const getNodeStyle = () => {
    if (node.isLearned) {
      return {
        backgroundColor: treeColor,
        borderColor: treeColor,
        color: "white",
        transform: "scale(1.1)",
        boxShadow: `0 0 20px ${treeColor}40`,
      };
    } else if (node.isPending) {
      return {
        backgroundColor: "#fbbf24",
        borderColor: "#f59e0b",
        color: "white",
        borderWidth: "3px",
        animation: "pulse 2s infinite",
        boxShadow: "0 0 15px #fbbf2480",
      };
    } else if (node.isDiscovered) {
      return {
        backgroundColor: "transparent",
        borderColor: treeColor,
        color: treeColor,
        borderWidth: "3px",
      };
    } else {
      return {
        backgroundColor: "#374151",
        borderColor: "#6b7280",
        color: "#9ca3af",
      };
    }
  };

  return (
    <div
      className="absolute cursor-pointer transition-all duration-300 hover:scale-110"
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
      onMouseEnter={() => onHover(node)}
      onMouseLeave={() => onHover(null)}
      onClick={() => {
        node.isDiscovered && !node.isLearned && onLearn(node.id);
        onClick();
      }}
    >
      <div
        className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-bold transition-all duration-300"
        style={getNodeStyle()}
      >
        {node.isVisible ? node.icon : "❓"}
      </div>

      {node.isVisible && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-xs font-mono text-white bg-black bg-opacity-70 px-2 py-1 rounded whitespace-nowrap">
            {node.name}
          </div>
        </div>
      )}
    </div>
  );
}
