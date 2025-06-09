interface NarrativeItem {
  type: 'text' | 'image' | 'choice';
  content?: string;
  src?: string;
  alt?: string;
  text?: string;
  next?: string;
  color?: string;
  tooltip?: string;
}

interface NarrativePage {
  key: string;
  prev: string | null;
  next: string | null;
  items: NarrativeItem[];
}

export interface NarrativeScript {
  id: string;
  title: string;
  startPage: string;
  pages: NarrativePage[];
}

export async function loadNarrativeScript(scriptId: string): Promise<NarrativeScript | null> {
  try {
    const response = await fetch(`/data/narratives/${scriptId}.json`);
    if (!response.ok) throw new Error(`Failed to load narrative script: ${scriptId}`);
    return await response.json();
  } catch (error) {
    console.error('Error loading narrative script:', error);
    return null;
  }
}

export function getAllNarrativeIds(): string[] {
  return ['introduction'];
}