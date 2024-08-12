import { cn } from "@/lib/utils";
import { APIDefinition } from "../TextualSolution/APIDefinition";
import { CapacityEstimationDefinition } from "../TextualSolution/CapacityEstimationDefinition";
import { RequirementsDefinition } from "../TextualSolution/RequirementsDefinition";
import { Small } from "../ui/typography";
import { type NodeProps } from "reactflow";
import { type FC } from "react";

export const Whiteboard: FC<NodeProps> = ({ selected }) => {
  return (
    <div
      className={cn(
        "group flex flex-col items-center justify-center rounded-sm border border-gray-400 p-2",
        selected ? "bg-gray-300" : "bg-gray-100",
      )}
    >
      <Small className="mb-2">System definitions</Small>
      <RequirementsDefinition />
      <APIDefinition />
      <CapacityEstimationDefinition />
    </div>
  );
};
