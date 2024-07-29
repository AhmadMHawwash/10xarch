import { type ComponentNodeProps } from "../SystemComponentNode";
import { APIDefinition } from "../TextualSolution/APIDefinition";
import { CapacityEstimationDefinition } from "../TextualSolution/CapacityEstimationDefinition";
import { RequirementsDefinition } from "../TextualSolution/RequirementsDefinition";
import { Small } from "../ui/typography";

export const Whiteboard = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* {Icon && <Icon size={20} />} */}
      <Small className="mb-2">System definitions</Small>
      <RequirementsDefinition name={name} />
      <APIDefinition name={name} />
      <CapacityEstimationDefinition name={name} />
    </div>
  );
};
