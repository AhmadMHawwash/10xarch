import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { InfoIcon } from "lucide-react";
import { type FC } from "react";
import { type NodeProps } from "reactflow";
import { WithMarkdownDetails } from "../SystemComponents/Wrappers/WithMarkdownDetails";

export type SystemComponentNodeDataProps = {
  id: string;
  name: string;
  configs: Record<string, unknown>;
};

export const APIsNode: FC<NodeProps<SystemComponentNodeDataProps>> = () => {
  return (
    <div className="group flex w-32 max-w-32 flex-col gap-1 rounded-sm border bg-slate-50 p-1">
      <WithMarkdownDetails
        className="absolute left-0 top-[-17px] rounded-full bg-gray-100 opacity-0 transition-all group-hover:opacity-100"
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        Icon={InfoIcon}
        content={APIsNodeContent}
        trigger={<InfoIcon size={16} className="stroke-gray-500" />}
      />
    </div>
  );
};

export default APIsNode;

export type Capacity = "Traffic" | "Storage" | "Bandwidth" | "Memory";
export type API = { name: string; definition: string; flow: string };
export const useWhiteboard = () => {
  const { useSystemComponentConfigSlice } = useChallengeManager();

  const whiteboardId = "Whiteboard-1";
  const [apis, setApis] = useSystemComponentConfigSlice<API[]>(
    whiteboardId,
    "API definitions and flows",
    [{ name: "new api", definition: "", flow: "" }],
  );

  const [functional, setFunctional] = useSystemComponentConfigSlice<string>(
    whiteboardId,
    "functional requirements",
  );
  const [nonfunctional, setNonfunctional] =
    useSystemComponentConfigSlice<string>(
      whiteboardId,
      "non-functional requirements",
    );

  const [capacity, setCapacity] = useSystemComponentConfigSlice<
    Record<Capacity, string>
  >(whiteboardId, "Capacity estimations", {
    Traffic: "",
    Storage: "",
    Bandwidth: "",
    Memory: "",
  });

  const [flows, setFlows] = useSystemComponentConfigSlice<[string, string][]>(
    whiteboardId,
    "Request API flows",
    [],
  );

  return {
    apis,
    setApis,
    functional,
    setFunctional,
    nonfunctional,
    setNonfunctional,
    capacity,
    setCapacity,
    flows,
    setFlows,
  };
};

const APIsNodeContent = `
### These are the APIs that you defined for the system.
#### Now you have to specify the expected behavior of each API endpoint. And how they flow together to serve the system's functionality.
Example: URL Shortening Service
  
Create Short URL
Endpoint: POST /shorten
##### Steps:
1. The client sends a POST request to /shorten with the original_url to the server.
2. The server generates a short_url for the original_url and saves it to the database.
3. The server sends the short_url back to the client.
`;

// type RequestFlow = {
//   edgeId: string;
//   subFlowDescription: string;
// }[];
// type IDtoRequestFlow = [string, RequestFlow];
