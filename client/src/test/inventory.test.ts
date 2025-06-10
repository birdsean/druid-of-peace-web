import { describe, it, expect } from 'vitest';
import { loadItems, getItemById } from '../lib/inventory';
import type { Item } from '../lib/inventory';

describe('Inventory System', () => {
  describe('loadItems', () => {
    it('should load and return array of items', () => {
      const items = loadItems();
      
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      
      // Verify item structure
      items.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('icon');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('effects');
        expect(typeof item.id).toBe('string');
        expect(typeof item.name).toBe('string');
        expect(typeof item.description).toBe('string');
        expect(typeof item.icon).toBe('string');
        expect(item.type).toBe('consumable');
      });
    });

    it('should include healing herbs with correct properties', () => {
      const items = loadItems();
      const healingHerbs = items.find(item => item.id === 'healing_herbs');
      
      expect(healingHerbs).toBeDefined();
      expect(healingHerbs?.name).toBe('Healing Herbs');
      expect(healingHerbs?.effects.heal).toBeGreaterThan(0);
    });

    it('should include calming tea with correct properties', () => {
      const items = loadItems();
      const calmingTea = items.find(item => item.id === 'calming_tea');
      
      expect(calmingTea).toBeDefined();
      expect(calmingTea?.name).toBe('Calming Tea');
      expect(calmingTea?.effects.reduceWill).toBeGreaterThan(0);
    });

    it('should include meditation stones with correct properties', () => {
      const items = loadItems();
      const meditationStones = items.find(item => item.id === 'meditation_stones');
      
      expect(meditationStones).toBeDefined();
      expect(meditationStones?.name).toBe('Meditation Stones');
      expect(meditationStones?.effects.restoreAP).toBeGreaterThan(0);
    });
  });

  describe('getItemById', () => {
    it('should return item when valid ID is provided', () => {
      const item = getItemById('healing_herbs');
      
      expect(item).toBeDefined();
      expect(item?.id).toBe('healing_herbs');
      expect(item?.name).toBe('Healing Herbs');
    });

    it('should return undefined for invalid ID', () => {
      const item = getItemById('nonexistent_item');
      
      expect(item).toBeUndefined();
    });

    it('should return undefined for empty ID', () => {
      const item = getItemById('');
      
      expect(item).toBeUndefined();
    });

    it('should handle all available items', () => {
      const items = loadItems();
      
      items.forEach(expectedItem => {
        const foundItem = getItemById(expectedItem.id);
        expect(foundItem).toBeDefined();
        expect(foundItem?.id).toBe(expectedItem.id);
        expect(foundItem?.name).toBe(expectedItem.name);
      });
    });
  });

  describe('Item Effects', () => {
    it('should have valid effect structures', () => {
      const items = loadItems();
      
      items.forEach(item => {
        const effects = item.effects;
        
        // At least one effect should be present
        const hasEffect = effects.heal || effects.reduceAwareness || 
                          effects.reduceWill || effects.restoreAP || effects.targetAll;
        expect(hasEffect).toBeTruthy();
        
        // Numeric effects should be positive
        if (effects.heal) expect(effects.heal).toBeGreaterThan(0);
        if (effects.reduceAwareness) expect(effects.reduceAwareness).toBeGreaterThan(0);
        if (effects.reduceWill) expect(effects.reduceWill).toBeGreaterThan(0);
        if (effects.restoreAP) expect(effects.restoreAP).toBeGreaterThan(0);
        
        // targetAll should be boolean if present
        if (effects.targetAll !== undefined) {
          expect(typeof effects.targetAll).toBe('boolean');
        }
      });
    });

    it('should have smoke bomb with area effect', () => {
      const items = loadItems();
      const smokeBomb = items.find(item => item.id === 'smoke_bomb');
      
      expect(smokeBomb).toBeDefined();
      expect(smokeBomb?.effects.targetAll).toBe(true);
      expect(smokeBomb?.effects.reduceAwareness).toBeGreaterThan(0);
    });
  });
});