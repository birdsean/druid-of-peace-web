import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, X } from "lucide-react";

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

interface NarrativeScript {
  id: string;
  title: string;
  pages: NarrativePage[];
}

interface NarrativeScreenProps {
  script: NarrativeScript;
  onComplete: () => void;
  onChoice?: (choiceId: string, pageId: string) => void;
}

export default function NarrativeScreen({ script, onComplete, onChoice }: NarrativeScreenProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [renderedItems, setRenderedItems] = useState<number>(0);
  const [showNext, setShowNext] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const currentPage = script.pages[currentPageIndex];
  const isLastPage = currentPageIndex === script.pages.length - 1;
  const hasChoices = currentPage?.items.some(item => item.type === 'choice');

  // Reset rendered items when page changes
  useEffect(() => {
    setRenderedItems(0);
    setShowNext(false);
    setSelectedChoice(null);
  }, [currentPageIndex]);

  // Animation for revealing items
  useEffect(() => {
    if (!currentPage) return;
    
    const timer = setInterval(() => {
      setRenderedItems(prev => {
        const nextCount = prev + 1;
        
        // Check if we've rendered all items
        if (nextCount >= currentPage.items.length) {
          // Always show next/exit button after delay
          setTimeout(() => setShowNext(true), 1000);
          clearInterval(timer);
        }
        
        return nextCount;
      });
    }, 800); // Delay between item reveals

    return () => clearInterval(timer);
  }, [currentPage]);

  const handleNext = useCallback(() => {
    if (selectedChoice) {
      // Handle choice navigation
      const choicePage = script.pages.find(page => page.id === selectedChoice);
      if (choicePage) {
        const choiceIndex = script.pages.indexOf(choicePage);
        setCurrentPageIndex(choiceIndex);
        onChoice?.(selectedChoice, currentPage.id);
        return;
      }
    }

    if (currentPage.next) {
      // Navigate to specific next page
      const nextPage = script.pages.find(page => page.id === currentPage.next);
      if (nextPage) {
        const nextIndex = script.pages.indexOf(nextPage);
        setCurrentPageIndex(nextIndex);
        return;
      }
    }

    if (isLastPage) {
      onComplete();
    } else {
      setCurrentPageIndex(prev => prev + 1);
    }
  }, [selectedChoice, currentPage, script.pages, isLastPage, onComplete, onChoice]);

  const handleChoiceSelect = useCallback((choiceNext: string) => {
    setSelectedChoice(choiceNext);
  }, []);

  if (!currentPage) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-8 py-16 text-center">
        
        {/* Render items with smooth height animations */}
        <div className="space-y-8">
          {currentPage.items.slice(0, renderedItems).map((item, index) => {
            const key = `${currentPageIndex}-${index}`;
            
            return (
              <div
                key={key}
                className="animate-in slide-in-from-bottom-4 fade-in duration-700 ease-out"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="transform-gpu">
                  {item.type === 'text' && (
                    <div className="text-white text-xl leading-relaxed font-mono">
                      {item.content}
                    </div>
                  )}
                  
                  {item.type === 'image' && (
                    <div className="flex justify-center">
                      <img 
                        src={item.src} 
                        alt={item.alt || ''} 
                        className="max-w-md max-h-64 object-contain"
                      />
                    </div>
                  )}
                  
                  {item.type === 'choice' && (
                    <div>
                      <Button
                        onClick={() => handleChoiceSelect(item.next || '')}
                        className={`
                          mx-2 px-6 py-3 text-lg font-mono border-2 transition-all duration-300
                          ${selectedChoice === item.next 
                            ? 'bg-white text-black border-white' 
                            : `bg-transparent border-white text-white hover:bg-white hover:text-black`
                          }
                        `}
                        title={item.tooltip}
                      >
                        {item.text}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Next/Exit buttons */}
        {showNext && (
          <div className="fixed bottom-8 right-8 animate-in fade-in duration-500 flex gap-4">
            {/* Exit button for last page */}
            {isLastPage && !hasChoices && (
              <Button
                onClick={onComplete}
                className="bg-red-600 text-white hover:bg-red-700 px-6 py-3 text-lg font-mono border-2 border-red-600 flex items-center gap-2"
              >
                EXIT
                <X size={20} />
              </Button>
            )}
            
            {/* Next button */}
            {(!isLastPage || selectedChoice || hasChoices) && (
              <Button
                onClick={handleNext}
                className="bg-white text-black hover:bg-gray-200 px-6 py-3 text-lg font-mono border-2 border-white flex items-center gap-2"
              >
                {isLastPage && !selectedChoice ? 'COMPLETE' : 'NEXT'}
                <ChevronRight size={20} />
              </Button>
            )}
          </div>
        )}

        {/* Page indicator */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-mono opacity-50">
          {currentPageIndex + 1} / {script.pages.length}
        </div>
      </div>
    </div>
  );
}