import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  globalSkillManager,
  SkillNodeDisplay,
  SkillTree,
} from "@/lib/skillTreeLoader";
import { globalHistoryManager } from "@/lib/historySystem";
import {
  ArrowLeft,
  TreePine,
  Flame,
  Eye,
  Mountain,
  History,
  Target,
} from "lucide-react";
import { IS_DEBUG } from "@/lib/debug";
import HistoryDebugModal from "@/components/HistoryDebugModal";
import SkillRequirementsModal from "@/components/SkillRequirementsModal";
import SkillUnlockNotification from "@/components/SkillUnlockNotification";

interface SkillNodeProps {
  node: SkillNodeDisplay;
  onHover: (node: SkillNodeDisplay | null) => void;
  onLearn: (skillId: string) => void;
  onClick: () => void;
  treeColor: string;
}

function SkillNode({
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

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  active: boolean;
}

function ConnectionLine({ from, to, color, active }: ConnectionLineProps) {
  const length = Math.sqrt(
    Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2),
  );
  const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;

  return (
    <div
      className="absolute origin-left transition-all duration-300"
      style={{
        left: `${from.x}px`,
        top: `${from.y}px`,
        width: `${length}px`,
        height: "3px",
        backgroundColor: active ? color : "#4b5563",
        transform: `rotate(${angle}deg)`,
        opacity: active ? 1 : 0.3,
        zIndex: 1,
      }}
    />
  );
}

interface SkillDetailPanelProps {
  node: SkillNodeDisplay | null;
  onClose: () => void;
  onLearn: (skillId: string) => void;
  onPanelHover?: (isHovering: boolean) => void;
}

function SkillDetailPanel({
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
        <Button
          onClick={onClose}
          className="w-8 h-8 p-0 bg-gray-700 hover:bg-gray-600"
        >
          ✕
        </Button>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">{node.icon}</div>
          <div className="flex gap-2 justify-center flex-wrap">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-gray-700 rounded font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-amber-400 font-mono text-sm mb-2">
            DESCRIPTION:
          </h4>
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
            <div className="text-green-400 font-mono text-center">
              ✓ LEARNED
            </div>
          ) : node.isPending ? (
            <Button
              onClick={() => onLearn(node.id)}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-mono animate-pulse"
            >
              CLAIM SKILL
            </Button>
          ) : node.isDiscovered ? (
            <Button
              onClick={() => onLearn(node.id)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-mono"
            >
              LEARN SKILL
            </Button>
          ) : (
            <div className="text-gray-500 font-mono text-center">
              ❓ UNKNOWN
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TreeSelector({
  selectedTree,
  onTreeSelect,
  skillTrees,
}: {
  selectedTree: string;
  onTreeSelect: (tree: string) => void;
  skillTrees: Record<string, SkillTree>;
}) {
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

export default function Skills() {
  const [, setLocation] = useLocation();
  const [selectedTree, setSelectedTree] = useState("diplomacy");
  const [hoveredNode, setHoveredNode] = useState<SkillNodeDisplay | null>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNodeDisplay | null>(
    null,
  );
  const [isHoveringPanel, setIsHoveringPanel] = useState(false);
  const [skillTrees, setSkillTrees] = useState<Record<string, SkillTree>>({});
  const [visibleNodes, setVisibleNodes] = useState<SkillNodeDisplay[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [newlyUnlockedSkills, setNewlyUnlockedSkills] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await globalSkillManager.loadSkillTrees();
      if (data) {
        setSkillTrees(data.skillTrees);
        setDataLoaded(true);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      const nodes = globalSkillManager.getVisibleSkillsForTree(selectedTree);
      setVisibleNodes(nodes);
    }
  }, [selectedTree, dataLoaded]);

  useEffect(() => {
    const unsubscribe = globalSkillManager.subscribe(() => {
      const nodes = globalSkillManager.getVisibleSkillsForTree(selectedTree);
      setVisibleNodes(nodes);
    });
    return unsubscribe;
  }, [selectedTree]);

  // Listen for history changes to show skill unlock notifications
  useEffect(() => {
    const unsubscribe = globalHistoryManager.subscribe((history) => {
      if (history.pendingSkills.length > 0) {
        setNewlyUnlockedSkills(history.pendingSkills);
      }
    });
    return unsubscribe;
  }, []);

  const handleLearnSkill = useCallback((skillId: string) => {
    globalSkillManager.learnSkill(skillId);
  }, []);

  const handleNodeClick = useCallback((node: SkillNodeDisplay) => {
    setSelectedNode(node);
  }, []);

  const handleHoverNode = useCallback(
    (node: SkillNodeDisplay | null) => {
      if (!isHoveringPanel) {
        setHoveredNode(node);
      }
    },
    [isHoveringPanel],
  );

  const renderConnections = () => {
    const currentTree = skillTrees[selectedTree];
    if (!currentTree) return null;

    const connections: JSX.Element[] = [];
    visibleNodes.forEach((node) => {
      node.connections.forEach((connectedId) => {
        const connectedNode = visibleNodes.find((n) => n.id === connectedId);
        if (connectedNode) {
          const isActive =
            node.isLearned ||
            connectedNode.isLearned ||
            node.isDiscovered ||
            connectedNode.isDiscovered;

          connections.push(
            <ConnectionLine
              key={`${node.id}-${connectedId}`}
              from={node.position}
              to={connectedNode.position}
              color={currentTree.color}
              active={isActive}
            />,
          );
        }
      });
    });

    return connections;
  };

  if (!dataLoaded) {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 flex items-center justify-center">
        <div className="text-white font-mono text-xl">
          Loading Skill Trees...
        </div>
      </div>
    );
  }

  const currentTree = skillTrees[selectedTree];

  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900" />

      {/* Tree Selector */}
      <TreeSelector
        selectedTree={selectedTree}
        onTreeSelect={setSelectedTree}
        skillTrees={skillTrees}
      />

      {/* Tree Title */}
      {currentTree && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 text-center">
          <div className="bg-black bg-opacity-80 rounded-lg p-4 border-2 border-amber-400">
            <div className="text-3xl mb-2">{currentTree.icon}</div>
            <h1 className="text-2xl font-mono text-amber-400 mb-2">
              {currentTree.name}
            </h1>
            <p className="text-gray-300 text-sm max-w-md">
              {currentTree.description}
            </p>
          </div>
        </div>
      )}

      {/* Skill Graph */}
      <div className="absolute inset-0 pt-40 pb-20">
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="relative" style={{ width: "800px", height: "600px" }}>
            {/* Connection Lines */}
            {renderConnections()}

            {/* Skill Nodes */}
            {visibleNodes.map((node) => (
              <SkillNode
                key={node.id}
                node={node}
                onHover={handleHoverNode}
                onLearn={handleLearnSkill}
                onClick={() => handleNodeClick(node)}
                treeColor={currentTree?.color || "#6b7280"}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Skill Detail Panel */}
      <SkillDetailPanel
        node={hoveredNode || selectedNode}
        onClose={() => {
          setHoveredNode(null);
          setSelectedNode(null);
        }}
        onLearn={handleLearnSkill}
        onPanelHover={setIsHoveringPanel}
      />

      {/* Debug Panel */}
      {IS_DEBUG && (
        <div className="absolute bottom-4 left-4 z-30">
          <div className="bg-black bg-opacity-80 rounded-lg p-4 border-2 border-red-400 space-y-2">
            <div className="text-red-400 font-mono text-sm mb-2">
              SKILL DEBUG:
            </div>
            <Button
              onClick={() => globalSkillManager.debugLearnAllSkills()}
              className="w-full h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-mono"
            >
              LEARN ALL SKILLS
            </Button>
            <Button
              onClick={() => globalSkillManager.debugResetSkills()}
              className="w-full h-8 text-xs bg-red-600 hover:bg-red-700 text-white font-mono"
            >
              RESET SKILLS
            </Button>
            <Button
              onClick={() =>
                globalHistoryManager.debugUnlockSkill("wind_whisperer")
              }
              className="w-full h-8 text-xs bg-yellow-600 hover:bg-yellow-700 text-white font-mono"
            >
              UNLOCK WIND WHISPERER
            </Button>
            <Button
              onClick={() => globalHistoryManager.debugReset()}
              className="w-full h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-mono"
            >
              RESET HISTORY
            </Button>
            <Button
              onClick={() => setShowHistoryModal(true)}
              className="w-full h-8 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-mono"
            >
              <History className="w-3 h-3 mr-1" />
              VIEW HISTORY
            </Button>
            <Button
              onClick={() => setShowRequirementsModal(true)}
              className="w-full h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white font-mono"
            >
              <Target className="w-3 h-3 mr-1" />
              SKILL REQUIREMENTS
            </Button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-30">
        <div className="bg-black bg-opacity-80 rounded-lg p-4 border-2 border-amber-400">
          <h3 className="text-amber-400 font-mono text-sm mb-3">LEGEND:</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-gray-300">Learned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-transparent"></div>
              <span className="text-gray-300">Discovered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-600"></div>
              <span className="text-gray-300">Hidden</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <Button
          onClick={() => setLocation("/map")}
          className="bg-gray-600 hover:bg-gray-700 text-white border-2 border-gray-400 font-mono"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          RETURN TO MAP
        </Button>
      </div>

      {/* Debug Modals */}
      {showHistoryModal && (
        <HistoryDebugModal onClose={() => setShowHistoryModal(false)} />
      )}

      {showRequirementsModal && (
        <SkillRequirementsModal
          onClose={() => setShowRequirementsModal(false)}
        />
      )}

      {/* Skill Unlock Notification */}
      {newlyUnlockedSkills.length > 0 && (
        <SkillUnlockNotification
          skillIds={newlyUnlockedSkills}
          onClose={() => setNewlyUnlockedSkills([])}
          onViewSkills={() => {
            // Already on skills page, just close notification
          }}
        />
      )}
    </div>
  );
}
