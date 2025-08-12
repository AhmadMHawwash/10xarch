"use client";

import { Badge } from "@/components/ui/badge";

export interface AnalysisSummaryBadgesProps {
  nodesCount?: number;
  edgesCount?: number;
  depthRaw?: string;
  confidence?: number | null;
  className?: string;
}

function getDepthDisplay(depthRaw?: string): string {
  if (!depthRaw) return "Standard";
  const numeric = Number(depthRaw);
  if (Number.isFinite(numeric)) return `${numeric}`;
  if (depthRaw === "dynamic") return "Dynamic";
  return "Standard";
}

export default function AnalysisSummaryBadges({
  nodesCount = 0,
  edgesCount = 0,
  depthRaw,
  confidence,
  className,
}: AnalysisSummaryBadgesProps) {
  return (
    <div className={`text-sm text-muted-foreground mb-3 flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <span>
        {nodesCount} components, {edgesCount} connections
      </span>
      <Badge variant="outline" className="text-xs">Depth: {getDepthDisplay(depthRaw)}</Badge>
      {typeof confidence === "number" && (
        <Badge variant="secondary" className="text-xs">Confidence: {confidence}%</Badge>
      )}
    </div>
  );
}


