import { type ComponentNodeProps } from "../SystemComponentNode";
import { RequirementsDefinition } from "../TextualSolution/RequirementsDefinition";
import { Small } from "../ui/typography";

export const Whiteboard = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* {Icon && <Icon size={20} />} */}
      <Small className="mb-2">System definitions</Small>
      <RequirementsDefinition />
    </div>
  );
};