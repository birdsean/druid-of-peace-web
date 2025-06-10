import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useInventory } from '@/hooks/useInventory';
import { loadItems } from '@/lib/inventory';
import { IS_DEBUG } from '@/lib/debug';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

interface InventoryScreenProps {
  isModal?: boolean;
  onClose?: () => void;
  onUseItem?: (itemId: string) => void;
}

export default function InventoryScreen({ isModal = false, onClose, onUseItem }: InventoryScreenProps) {
  const { inventory, addItem } = useInventory();
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [, setLocation] = useLocation();
  const allItems = loadItems();

  const handleUseItem = (itemId: string) => {
    if (onUseItem) {
      onUseItem(itemId);
    }
  };

  return (
    <div className={cn(
      "bg-gradient-to-b from-green-800 via-green-600 to-green-400 overflow-hidden",
      isModal ? "fixed inset-0 z-50" : "w-screen h-screen"
    )}>
      {/* Forest Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080')"
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <h1 className="text-4xl font-bold text-white font-mono shadow-lg">
          🎒 INVENTORY
        </h1>
        
        <div className="flex items-center gap-4">
          {/* Debug Toggle */}
          {IS_DEBUG && (
            <Button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className={cn(
                "bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-400 text-white",
                showDebugPanel && "bg-yellow-700"
              )}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Items
            </Button>
          )}

          {/* Close/Exit Button */}
          {(isModal && onClose) ? (
            <Button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 border-2 border-red-400 text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          ) : (
            <Button
              onClick={() => setLocation('/map')}
              className="bg-red-600 hover:bg-red-700 border-2 border-red-400 text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Exit to Map
            </Button>
          )}
        </div>
      </div>

      {/* Debug Panel */}
      {IS_DEBUG && showDebugPanel && (
        <div className="absolute top-20 right-6 z-20 bg-gray-900 rounded-lg p-4 shadow-lg border-2 border-yellow-400 max-w-sm">
          <div className="text-sm font-mono text-yellow-400 mb-3">ADD ITEMS</div>
          <div className="grid grid-cols-1 gap-2">
            {allItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => addItem(item.id, 1)}
                className="flex items-center justify-start text-left h-auto p-2 bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white"
              >
                <span className="text-lg mr-2">{item.icon}</span>
                <div>
                  <div className="text-xs font-mono">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Grid */}
      <div className="relative z-10 p-6">
        <div className="bg-black bg-opacity-80 rounded-lg p-6 border-2 border-amber-400">
          {inventory.items.length === 0 ? (
            <div className="text-center text-white font-mono py-12">
              <div className="text-6xl mb-4">📦</div>
              <div className="text-xl">Your inventory is empty</div>
              <div className="text-gray-400 mt-2">Collect items during your adventures</div>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-4">
              {inventory.items.map((invItem) => (
                <div
                  key={invItem.item.id}
                  className="relative group"
                >
                  <Button
                    onClick={() => handleUseItem(invItem.item.id)}
                    className="w-full h-24 bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-amber-400 text-white flex flex-col items-center justify-center p-2 transition-all duration-200"
                    title={invItem.item.description}
                    disabled={!onUseItem}
                  >
                    <div className="text-2xl mb-1">{invItem.item.icon}</div>
                    <div className="text-xs font-mono text-center leading-tight">{invItem.item.name}</div>
                    
                    {/* Stack count */}
                    {invItem.count > 1 && (
                      <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {invItem.count}
                      </div>
                    )}
                  </Button>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 border border-gray-600 whitespace-nowrap">
                      {invItem.item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}