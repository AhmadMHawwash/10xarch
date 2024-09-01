import { Input } from "@/components/ui/input";
import { useChallengeManager } from "@/lib/hooks/useChallengeManager";
import { type ComponentNodeProps } from "../../ReactflowCustomNodes/SystemComponentNode";
import { Label } from "../../ui/label";
import { Small } from "../../ui/typography";
import { WithSettings } from "../Wrappers/WithSettings";
import { Textarea } from "@/components/ui/textarea";

export const ServerCluster = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center text-gray-200">
      {Icon && <Icon size={20} className="text-gray-300" />}
      <Small>{name}</Small>
      <ServerClusterSettings name={name} />
    </div>
  );
};

const ServerClusterSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useChallengeManager();

  const [serversCount, setServersCount] = useSystemComponentConfigSlice<number>(
    id,
    "servers count",
  );
  const [purpose, setPurpose] = useSystemComponentConfigSlice<string>(
    id,
    "Server purpose",
  );

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2 text-gray-200">
        <div className="grid grid-flow-col grid-cols-2">
          <Label
            htmlFor="servers-count"
            className="col-span-1 my-auto text-gray-300"
          >
            Server replicas
          </Label>
          <Input
            value={serversCount}
            onChange={(e) => setServersCount(parseInt(e.target.value))}
            name="servers-count"
            id="servers-count"
            className="text-md border-gray-700 bg-gray-800 text-gray-100 focus:border-gray-600"
            placeholder="# of instances"
            type="number"
          />
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="server-purpose" className="text-gray-300">
            Server purpose
          </Label>
          <Textarea
            name="server-purpose"
            id="server-purpose"
            rows={10}
            className="text-md border-gray-700 bg-gray-800 text-gray-100 focus:border-gray-600"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>
      </div>
    </WithSettings>
  );
};
