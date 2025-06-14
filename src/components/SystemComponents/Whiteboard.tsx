import { cn } from "@/lib/utils";
import { InfoIcon, PresentationIcon } from "lucide-react";
import { type NodeProps } from "reactflow";
import { APIDefinition } from "../TextualSolution/APIDefinition";
import { CapacityEstimationDefinition } from "../TextualSolution/CapacityEstimationDefinition";
import { RequirementsDefinition } from "../TextualSolution/RequirementsDefinition";
import { Small } from "../ui/typography";
import { WithMarkdownDetails } from "./Wrappers/WithMarkdownDetails";
import { usePlaygroundPermissions } from "@/lib/hooks/usePlaygroundPermissions";
import { usePlaygroundManager } from "@/lib/hooks/usePlaygroundManager";

export const Whiteboard = ({ selected }: NodeProps) => {
  const { playground } = usePlaygroundManager();
  const { canEdit } = usePlaygroundPermissions(playground);

  return (
    <div
      className={cn(
        "group flex h-full w-full flex-col rounded-md border border-gray-400 dark:border-gray-600 p-2 text-gray-800 dark:text-gray-200",
        selected ? "bg-gray-200 dark:bg-gray-700" : "bg-gray-50 dark:bg-gray-800",
      )}
    >
      <Small className="mb-2">
        System definitions
        {!canEdit && <span className="ml-2 text-xs text-gray-500">(Read Only)</span>}
      </Small>
      <RequirementsDefinition canEdit={canEdit} />
      {/* <APIDefinition /> */}
      <CapacityEstimationDefinition canEdit={canEdit} />
      <WithMarkdownDetails
        className="absolute left-0 top-[-17px] rounded-full bg-gray-200 dark:bg-gray-700 opacity-0 transition-all group-hover:opacity-100"
        Icon={PresentationIcon}
        trigger={<InfoIcon size={16} className="stroke-gray-700 dark:stroke-gray-300" />}
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
