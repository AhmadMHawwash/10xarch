import { cn } from "@/lib/utils";
import { useState, type FC } from "react";
import { getBezierPath, EdgeLabelRenderer, type EdgeProps } from "reactflow";
import { useSystemDesigner } from "@/lib/hooks/_useSystemDesigner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EdgeData {
  label?: string;
  definition?: string;
  flow?: string;
}

export const CustomEdge: FC<EdgeProps<EdgeData>> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  id,
  data,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { updateEdgeLabel } = useSystemDesigner();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(false);
    updateEdgeLabel(id, e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      updateEdgeLabel(id, e.currentTarget.value);
    }
  };

  const handleApiChange = (field: keyof EdgeData, value: string) => {
    const newData = { ...data, [field]: value };
    updateEdgeLabel(id, data?.label ?? '', newData);
  };

  return (
    <>
      <path
        id={id}
        style={{
          strokeWidth: "3px",
        }}
        className={cn("react-flow__edge-path")}
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditing ? (
            <input
              type="text"
              defaultValue={data?.label ?? ""}
              placeholder="Type API name"
              className="min-w-[100px] rounded border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              autoFocus
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <div
              onDoubleClick={handleDoubleClick}
              className={cn(
                "min-w-[30px] cursor-pointer rounded px-2 py-1 text-center text-sm transition-all",
                data?.label 
                  ? "bg-white/90 shadow-sm hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800" 
                  : isHovered 
                    ? "bg-gray-100/90 dark:bg-gray-700/90"
                    : "bg-gray-100/50 dark:bg-gray-700/50",
                "border border-transparent",
                isHovered && !data?.label && "border-dashed border-gray-400 dark:border-gray-500"
              )}
            >
              {data?.label ?? '•••'}
            </div>
          )}
          
          {/* Settings Icon */}
          <Dialog>
            <DialogTrigger asChild>
              <button 
                className={cn(
                  "absolute right-[-20px] top-[50%] translate-y-[-50%] rounded-full bg-gray-200 p-1 opacity-0 transition-opacity dark:bg-gray-700",
                  isHovered && "opacity-100"
                )}
              >
                <Settings size={12} className="text-gray-700 dark:text-gray-300" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
              <DialogHeader>
                <DialogTitle>API Definition</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="definition" className="w-full">
                <TabsList className="w-full bg-gray-200 dark:bg-gray-700">
                  <TabsTrigger value="definition" className="w-full">
                    Definition
                  </TabsTrigger>
                  <TabsTrigger value="flow" className="w-full">
                    Request flow
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="definition">
                  <Textarea
                    value={data?.definition ?? ''}
                    onChange={(e) => handleApiChange('definition', e.target.value)}
                    placeholder={`Example: URL Shortening Service API

Endpoint: POST /shorten
Description: This API generates a short URL for a given long URL.
Parameters:
- original_url (string): The original long URL that needs to be shortened.
Response:
- short_url (string): The generated short URL.

Example Request:
POST /shorten {
  "original_url": "http://example.com/some/very/long/url"
}
Example Response:
{
  "short_url": "http://short.url/xyz"
}`}
                    className="text-md h-[60vh] border-gray-300 bg-gray-100 text-gray-900 focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-600"
                  />
                </TabsContent>
                <TabsContent value="flow">
                  <Textarea
                    value={data?.flow ?? ""}
                    onChange={(e) => handleApiChange("flow", e.target.value)}
                    placeholder={`Describe how the API request flows through the system...

Example:
1. Client sends POST request to /shorten with the original_url
2. Load balancer receives request and routes to available API server
3. API server:
   - Validates the URL format
   - Generates a unique short code
   - Checks if URL already exists in cache
4. If URL in cache:
   - Return existing short URL
5. If URL not in cache:
   - Store mapping in database
   - Add to cache for future requests
6. Return generated short URL to client`}
                    className="text-md h-[60vh] border-gray-300 bg-gray-100 text-gray-900 focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-600"
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
