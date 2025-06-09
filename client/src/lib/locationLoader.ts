export interface LocationData {
  id: string;
  name: string;
  heat: number;
  hasEncounter: boolean;
  position: { x: number; y: number };
  icon: string;
  description: string;
}

export async function loadLocationData(): Promise<LocationData[]> {
  try {
    const response = await fetch('/data/locations/forest-zones.json');
    if (!response.ok) throw new Error('Failed to load location data');
    return await response.json();
  } catch (error) {
    console.error('Error loading location data:', error);
    return [];
  }
}

export async function getLocationById(id: string): Promise<LocationData | undefined> {
  const locations = await loadLocationData();
  return locations.find(location => location.id === id);
}