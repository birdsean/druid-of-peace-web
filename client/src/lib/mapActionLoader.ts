import type { PCAbility } from './characterLoader';

export type MapAction = PCAbility;

export async function loadMapActions(): Promise<MapAction[]> {
  try {
    const response = await fetch('/data/map-actions.json');
    if (!response.ok) throw new Error('Failed to load map actions');
    return await response.json();
  } catch (error) {
    console.error('Error loading map actions:', error);
    return [];
  }
}
