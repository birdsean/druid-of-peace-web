import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Calendar, User, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { globalHistoryManager, type PCHistoryStore, type EncounterHistory, type PlayerAction } from '@/lib/history';

interface HistoryDebugModalProps {
  onClose: () => void;
}

export default function HistoryDebugModal({ onClose }: HistoryDebugModalProps) {
  const [history] = useState<PCHistoryStore>(globalHistoryManager.getHistory());

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-gray-900 border-2 border-amber-400 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-amber-400 font-mono">PC HISTORY</h2>
          </div>
          <Button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white p-1 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(80vh-100px)]">
          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-3 rounded border border-gray-600 text-center">
              <div className="text-2xl font-bold text-green-400">{history.totalEncounters}</div>
              <div className="text-xs text-gray-400 font-mono">TOTAL</div>
            </div>
            <div className="bg-gray-800 p-3 rounded border border-gray-600 text-center">
              <div className="text-2xl font-bold text-blue-400">{history.successfulEncounters}</div>
              <div className="text-xs text-gray-400 font-mono">SUCCESS</div>
            </div>
            <div className="bg-gray-800 p-3 rounded border border-gray-600 text-center">
              <div className="text-2xl font-bold text-red-400">{history.failedEncounters}</div>
              <div className="text-xs text-gray-400 font-mono">FAILED</div>
            </div>
            <div className="bg-gray-800 p-3 rounded border border-gray-600 text-center">
              <div className="text-2xl font-bold text-yellow-400">{history.fleesCount}</div>
              <div className="text-xs text-gray-400 font-mono">FLED</div>
            </div>
          </div>

          {/* Skills Status */}
          <div className="mb-6">
            <h3 className="text-amber-400 font-mono text-lg mb-3">SKILLS STATUS</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800 p-3 rounded border border-gray-600">
                <div className="text-sm text-gray-400 font-mono mb-1">UNLOCKED</div>
                <div className="text-xs space-y-1">
                  {history.skillsUnlocked.length === 0 ? (
                    <div className="text-gray-500">None</div>
                  ) : (
                    history.skillsUnlocked.map(skill => (
                      <div key={skill} className="text-green-400">{skill}</div>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-gray-600">
                <div className="text-sm text-gray-400 font-mono mb-1">PENDING</div>
                <div className="text-xs space-y-1">
                  {history.pendingSkills.length === 0 ? (
                    <div className="text-gray-500">None</div>
                  ) : (
                    history.pendingSkills.map(skill => (
                      <div key={skill} className="text-yellow-400">{skill}</div>
                    ))
                  )}
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-gray-600">
                <div className="text-sm text-gray-400 font-mono mb-1">CLAIMED</div>
                <div className="text-xs space-y-1">
                  {history.skillsClaimed.length === 0 ? (
                    <div className="text-gray-500">None</div>
                  ) : (
                    history.skillsClaimed.map(skill => (
                      <div key={skill} className="text-blue-400">{skill}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Encounters */}
          <div>
            <h3 className="text-amber-400 font-mono text-lg mb-3">ENCOUNTER HISTORY</h3>
            {history.encounters.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No encounters recorded</div>
            ) : (
              <div className="space-y-3">
                {history.encounters.slice().reverse().map((encounter, index) => (
                  <div key={encounter.id} className="bg-gray-800 border border-gray-600 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="font-mono text-amber-400">{encounter.zoneName}</span>
                        <span className={cn(
                          "px-2 py-1 text-xs font-mono rounded",
                          encounter.result === 'success' && "bg-green-600 text-white",
                          encounter.result === 'failure' && "bg-red-600 text-white",
                          encounter.result === 'fled' && "bg-yellow-600 text-white"
                        )}>
                          {encounter.result.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        Turn {encounter.turn} • {formatDuration(encounter.duration)}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-300 mb-2">
                      <span className="font-mono">Time:</span> {encounter.timePhase} |{' '}
                      <span className="font-mono">Effects:</span> {encounter.environmentalEffects.join(', ') || 'None'} |{' '}
                      <span className="font-mono">Weather:</span> {encounter.weatherActive || 'None'}
                    </div>

                    {encounter.actions.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-400 font-mono mb-1">ACTIONS:</div>
                        <div className="space-y-1">
                          {encounter.actions.map((action, actionIndex) => (
                            <div key={action.id} className="text-xs bg-gray-700 p-2 rounded">
                              <span className="text-blue-400 font-mono">{action.type}</span>
                              {action.target && <span className="text-gray-300"> → {action.target}</span>}
                              {action.roll && <span className="text-yellow-400"> (Roll: {action.roll})</span>}
                              {action.itemUsed && <span className="text-green-400"> [Item: {action.itemUsed}]</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}