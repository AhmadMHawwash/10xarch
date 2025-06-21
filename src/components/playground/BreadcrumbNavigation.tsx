"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Home,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface BreadcrumbSegment {
  id: string;
  name: string;
}

interface BreadcrumbNavigationProps {
  currentPath: string[];
  segments: BreadcrumbSegment[];
  onNavigateToRoot: () => void;
  onNavigateToPath: (pathIndex: number) => void;
  currentFileName?: string;
  className?: string;
}

const BreadcrumbNavigation = ({
  currentPath,
  segments,
  onNavigateToRoot,
  onNavigateToPath,
  currentFileName,
  className,
}: BreadcrumbNavigationProps) => {
  const [shouldTruncate, setShouldTruncate] = useState(false);
  const breadcrumbRef = useRef<HTMLDivElement>(null);
  const fullBreadcrumbRef = useRef<HTMLDivElement>(null);

  // Get segment name by ID
  const getSegmentName = (segmentId: string): string => {
    const segment = segments.find(s => s.id === segmentId);
    return segment?.name ?? segmentId;
  };

  // Check if breadcrumb needs truncation based on available width
  const checkBreadcrumbWidth = () => {
    if (!breadcrumbRef.current || !fullBreadcrumbRef.current) return;

    const containerWidth = breadcrumbRef.current.offsetWidth;
    const fullWidth = fullBreadcrumbRef.current.scrollWidth;
    
    setShouldTruncate(fullWidth > containerWidth);
  };

  // Monitor breadcrumb width changes
  useLayoutEffect(() => {
    checkBreadcrumbWidth();
  }, [currentPath, segments]);

  // Add resize observer to handle container size changes
  useEffect(() => {
    if (!breadcrumbRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      checkBreadcrumbWidth();
    });

    resizeObserver.observe(breadcrumbRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentPath, segments]);

  // Render full breadcrumb (for measurement)
  const renderFullBreadcrumb = () => (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="p-1 h-auto"
      >
        <Home className="h-4 w-4" />
      </Button>
      {currentPath.map((pathId, index) => (
        <div key={pathId} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto whitespace-nowrap"
          >
            {getSegmentName(pathId)}
          </Button>
        </div>
      ))}
    </>
  );

  // Render breadcrumb with truncation
  const renderBreadcrumb = () => {
    if (!shouldTruncate || currentPath.length <= 1) {
      // Show all segments if no truncation needed
      return (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToRoot}
            className="p-1 h-auto"
          >
            <Home className="h-4 w-4" />
          </Button>
          {currentPath.map((pathId, index) => (
            <div key={pathId} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToPath(index)}
                className="p-1 h-auto"
              >
                {getSegmentName(pathId)}
              </Button>
            </div>
          ))}
        </>
      );
    }

    // Show truncated path: Home > First > ... > Last
    const firstSegment = currentPath[0]!;
    const lastSegment = currentPath[currentPath.length - 1]!;
    const hiddenSegments = currentPath.slice(1, -1);
    
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigateToRoot}
          className="p-1 h-auto"
        >
          <Home className="h-4 w-4" />
        </Button>
        
        {/* First segment */}
        <div className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToPath(0)}
            className="p-1 h-auto"
          >
            {getSegmentName(firstSegment)}
          </Button>
        </div>

        {/* Ellipsis with dropdown */}
        {hiddenSegments.length > 0 && (
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {hiddenSegments.map((pathId, index) => (
                  <DropdownMenuItem
                    key={pathId}
                    onClick={() => onNavigateToPath(index + 1)}
                    className="cursor-pointer"
                  >
                    {getSegmentName(pathId)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Last segment (only if different from first) */}
        {currentPath.length > 1 && (
          <div className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToPath(currentPath.length - 1)}
              className="p-1 h-auto"
            >
              {getSegmentName(lastSegment)}
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <div 
      ref={breadcrumbRef}
      className={cn(
        "flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 min-w-0",
        className
      )}
    >
      {/* Hidden breadcrumb for measurement */}
      <div 
        ref={fullBreadcrumbRef}
        className="absolute -top-96 left-0 flex items-center space-x-1 text-sm opacity-0 pointer-events-none whitespace-nowrap"
        aria-hidden="true"
      >
        {renderFullBreadcrumb()}
        {currentFileName && (
          <>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium">{currentFileName}</span>
          </>
        )}
      </div>
      
      {/* Visible breadcrumb */}
      <div className="flex items-center space-x-1 min-w-0 flex-1">
        {renderBreadcrumb()}
        {currentFileName && (
          <>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium truncate">{currentFileName}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default BreadcrumbNavigation; 