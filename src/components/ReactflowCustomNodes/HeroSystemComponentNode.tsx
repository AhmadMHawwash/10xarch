"use client";
import { Handle, Position, type NodeProps } from "reactflow";

export interface HeroNodeData {
  label: string;
  description: string;
  type: string;
  name: string;
  id: string;
  configs: Record<string, unknown>;
}

export default function HeroSystemComponentNode({
  data,
  selected,
}: NodeProps<HeroNodeData>) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#aaa", width: "10px", height: "10px" }}
        className="transition-all"
      />
      <div
        className={`group flex max-w-[200px] flex-col items-center justify-center rounded-sm border border-gray-300 p-2 dark:border-gray-600 ${
          selected
            ? "bg-gray-200 dark:bg-gray-700"
            : "bg-gray-100 dark:bg-gray-800"
        }`}
      >
        <div className="relative flex flex-col items-center text-gray-800 dark:text-gray-200">
          <div className="text-sm">{data.label}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{data.description}</div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#aaa", width: "10px", height: "10px" }}
        className="transition-all"
      />
    </>
  );
} 