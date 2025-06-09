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
  id: string;
  items: NarrativeItem[];
  next?: string;
}

export interface NarrativeScript {
  id: string;
  title: string;
  pages: NarrativePage[];
}

// Import narrative scripts
import introductionScript from '@/data/narratives/introduction.json';

export function loadNarrativeScript(scriptId: string): NarrativeScript | null {
  switch (scriptId) {
    case 'introduction':
      return introductionScript as NarrativeScript;
    default:
      console.warn(`Narrative script '${scriptId}' not found`);
      return null;
  }
}

export function getAllNarrativeIds(): string[] {
  return ['introduction'];
}