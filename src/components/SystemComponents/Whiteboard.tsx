import { cn } from "@/lib/utils";
import { APIDefinition } from "../TextualSolution/APIDefinition";
import { CapacityEstimationDefinition } from "../TextualSolution/CapacityEstimationDefinition";
import { RequirementsDefinition } from "../TextualSolution/RequirementsDefinition";
import { Small } from "../ui/typography";
import { type NodeProps } from "reactflow";
import { type FC } from "react";
import { WithMarkdownDetails } from "./Wrappers/WithMarkdownDetails";
import { InfoIcon, PresentationIcon } from "lucide-react";

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
      <WithMarkdownDetails
        className="absolute left-0 top-[-17px] rounded-full bg-gray-100 opacity-0 transition-all group-hover:opacity-100"
        Icon={PresentationIcon}
        trigger={<InfoIcon size={16} className="stroke-gray-500" />}
        content={`# Whiteboard
Is your digital area where you can write down your notes and thoughts about the system.

It includes 3 main areas:
- **Requirements**: where you define functional and non-functional requirements of the system.
- **System API**: where you define the API endpoints and their expected behavior.
- **Capacity estimations**: where you define the expected traffic, storage, memory, and bandwidth requirements of the system.

Defining these 3 areas at the beginning will help you design the system in a thoughtful and considerable way.
    `}
      />
    </div>
  );
};
