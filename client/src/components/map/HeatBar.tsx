import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface HeatBarProps {
  heat: number;
}

function getHeatLevel(heat: number): string {
  if (heat <= 10) return "None";
  if (heat <= 30) return "Cold";
  if (heat <= 50) return "Cool";
  if (heat <= 70) return "Warm";
  if (heat <= 90) return "Hot";
  return "Critical";
}

function getHeatColor(heat: number): string {
  if (heat <= 10) return "bg-blue-500";
  if (heat <= 30) return "bg-cyan-500";
  if (heat <= 50) return "bg-green-500";
  if (heat <= 70) return "bg-yellow-500";
  if (heat <= 90) return "bg-orange-500";
  return "bg-red-500";
}

export default function HeatBar({ heat }: HeatBarProps) {
  const level = getHeatLevel(heat);
  const colorClass = getHeatColor(heat);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative inline-flex flex-col items-center">
            <Progress
              value={heat}
              className="w-16 h-2 bg-gray-300 border border-gray-400"
              indicatorClassName={cn(colorClass, "transition-all", heat >= 90 && "animate-pulse")}
            />
            <div className="text-xs text-white font-mono text-center mt-1 bg-black bg-opacity-70 rounded px-1">
              {heat}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="whitespace-pre-line text-center">
          Heat: {heat} – {level}
          {"\n"}Higher heat makes conflict more likely
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}