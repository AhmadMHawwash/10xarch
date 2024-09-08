import { useSystemDesigner } from "@/lib/hooks/useSystemDesigner";

export type SystemComponentNodeDataProps = {
  id: string;
  name: string;
  configs: Record<string, unknown>;
};

// export default function APIsNode({ data, isConnectable }: NodeProps<APIsNodeDataProps>) {
//   return (
//     <div className="flex flex-col items-center rounded-md border border-gray-600 bg-gray-800 p-2 text-gray-200">
//       <WithMarkdownDetails
//         className="absolute left-0 top-[-17px] rounded-full bg-gray-100 opacity-0 transition-all group-hover:opacity-100"
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//         Icon={InfoIcon}
//         content={APIsNodeContent}
//         trigger={<InfoIcon size={16} className="stroke-gray-500" />}
//       />
//     </div>
//   );
// }

export type Capacity = "Traffic" | "Storage" | "Bandwidth" | "Memory";
export type API = { name: string; definition: string; flow: string };
export const useWhiteboard = () => {
  const { useSystemComponentConfigSlice } = useSystemDesigner();

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

// const APIsNodeContent = `
// ### These are the APIs that you defined for the system.
// #### Now you have to specify the expected behavior of each API endpoint. And how they flow together to serve the system's functionality.
// Example: URL Shortening Service
  
// Create Short URL
// Endpoint: POST /shorten
// ##### Steps:
// 1. The client sends a POST request to /shorten with the original_url to the server.
// 2. The server generates a short_url for the original_url and saves it to the database.
// 3. The server sends the short_url back to the client.
// `;

// type RequestFlow = {
//   edgeId: string;
//   subFlowDescription: string;
// }[];
// type IDtoRequestFlow = [string, RequestFlow];
