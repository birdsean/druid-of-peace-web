import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  globalSkillManager,
  SkillNodeDisplay,
  SkillTree,
} from "@/lib/skillTreeLoader";
import { globalHistoryManager } from "@/lib/historySystem";
import { debugReset, debugUnlockSkill } from "@/lib/historyDebug";
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
import SkillNode from "@/components/skills/SkillNode";
import ConnectionLine from "@/components/skills/ConnectionLine";
import SkillDetailPanel from "@/components/skills/SkillDetailPanel";
import TreeSelector from "@/components/skills/TreeSelector";
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
                debugUnlockSkill(globalHistoryManager, "wind_whisperer")
              }
              className="w-full h-8 text-xs bg-yellow-600 hover:bg-yellow-700 text-white font-mono"
            >
              UNLOCK WIND WHISPERER
            </Button>
            <Button
              onClick={() => debugReset(globalHistoryManager)}
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
