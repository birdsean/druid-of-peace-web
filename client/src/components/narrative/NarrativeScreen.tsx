import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

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

interface NarrativeScript {
  id: string;
  title: string;
  startPage: string;
  pages: NarrativePage[];
}

interface NarrativeScreenProps {
  script: NarrativeScript;
  onComplete: () => void;
  onChoice?: (choiceId: string, pageId: string) => void;
}

export default function NarrativeScreen({ script, onComplete, onChoice }: NarrativeScreenProps) {
  const [currentPageKey, setCurrentPageKey] = useState(script.startPage);
  const [visitedPages, setVisitedPages] = useState<string[]>([script.startPage]);

  const getCurrentPage = () => {
    return script.pages.find(page => page.key === currentPageKey);
  };

  const goToNext = () => {
    const currentPage = getCurrentPage();
    if (!currentPage) return;

    if (currentPage.next === "map") {
      onComplete();
      return;
    }

    if (currentPage.next) {
      setCurrentPageKey(currentPage.next);
      setVisitedPages(prev => [...prev, currentPage.next!]);
    }
  };

  const goToPrev = () => {
    const currentPage = getCurrentPage();
    if (!currentPage || !currentPage.prev) return;

    setCurrentPageKey(currentPage.prev);
  };

  const handleChoice = (choiceNext: string) => {
    if (choiceNext === "map") {
      onComplete();
      return;
    }
    
    if (onChoice) {
      onChoice(choiceNext, currentPageKey);
    }
    
    setCurrentPageKey(choiceNext);
    setVisitedPages(prev => [...prev, choiceNext]);
  };

  const currentPage = getCurrentPage();
  if (!currentPage) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Error: Page not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 text-white p-8 flex items-center justify-center">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center font-mono text-emerald-200">
            {script.title}
          </h1>
          
          <div className="space-y-6">
            {currentPage.items.map((item, index) => (
              <div key={index}>
                {item.type === 'text' && (
                  <p className="text-lg leading-relaxed text-green-100 font-mono">
                    {item.content}
                  </p>
                )}
                
                {item.type === 'image' && item.src && (
                  <div className="text-center">
                    <img 
                      src={item.src} 
                      alt={item.alt || ''} 
                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                    />
                  </div>
                )}
                
                {item.type === 'choice' && (
                  <div className="text-center">
                    <Button
                      onClick={() => handleChoice(item.next || currentPage.next || 'map')}
                      className={`px-8 py-4 text-lg font-mono bg-${item.color || 'emerald'}-600 hover:bg-${item.color || 'emerald'}-700 border-2 border-${item.color || 'emerald'}-400 text-white shadow-lg transition-all duration-200 hover:scale-105`}
                      title={item.tooltip}
                    >
                      {item.text}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between pt-6">
            <Button
              onClick={goToPrev}
              disabled={!currentPage.prev}
              className="px-6 py-2 font-mono bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </Button>
            
            <div className="text-center text-sm text-green-300 font-mono">
              Page {script.pages.findIndex(p => p.key === currentPageKey) + 1} of {script.pages.length}
            </div>
            
            <Button
              onClick={goToNext}
              disabled={!currentPage.next || currentPage.items.some(item => item.type === 'choice')}
              className="px-6 py-2 font-mono bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}