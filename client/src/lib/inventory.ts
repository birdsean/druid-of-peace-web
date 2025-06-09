export interface ItemEffect {
  heal?: number;
  reduceAwareness?: number;
  reduceWill?: number;
  restoreAP?: number;
  targetAll?: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: "consumable";
  effects: ItemEffect;
}

export interface InventoryItem {
  item: Item;
  count: number;
}

export interface InventoryState {
  items: InventoryItem[];
}

// Load items from JSON
export function loadItems(): Item[] {
  const itemsData = {
    "items": [
      {
        "id": "healing_potion",
        "name": "Healing Potion",
        "description": "Restores health to the druid, helping maintain stealth",
        "icon": "🧪",
        "type": "consumable",
        "effects": {
          "heal": 3,
          "reduceAwareness": 1
        }
      },
      {
        "id": "smoke_bomb",
        "name": "Smoke Bomb",
        "description": "Creates a distraction, significantly reducing NPC awareness",
        "icon": "💨",
        "type": "consumable",
        "effects": {
          "reduceAwareness": 5
        }
      },
      {
        "id": "calming_herbs",
        "name": "Calming Herbs",
        "description": "Pacifies aggressive NPCs, reducing their will to fight",
        "icon": "🌿",
        "type": "consumable",
        "effects": {
          "reduceWill": 3,
          "targetAll": true
        }
      },
      {
        "id": "energy_crystal",
        "name": "Energy Crystal",
        "description": "Restores action points for the druid",
        "icon": "💎",
        "type": "consumable",
        "effects": {
          "restoreAP": 1
        }
      },
      {
        "id": "distraction_stone",
        "name": "Distraction Stone",
        "description": "Throws NPCs off guard, reducing their awareness briefly",
        "icon": "🪨",
        "type": "consumable",
        "effects": {
          "reduceAwareness": 2,
          "targetAll": true
        }
      }
    ]
  };
  
  return itemsData.items as Item[];
}

export function getItemById(id: string): Item | undefined {
  const items = loadItems();
  return items.find(item => item.id === id);
}