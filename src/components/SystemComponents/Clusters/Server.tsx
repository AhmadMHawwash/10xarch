import { Input } from "@/components/ui/input";
import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { type ComponentNodeProps } from "../../SystemComponentNode";
import { Label } from "../../ui/label";
import { Small } from "../../ui/typography";
import { WithSettings } from "../Wrappers/WithSettings";

export const ServerCluster = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {Icon && <Icon size={20} />}
      <Small>{name}</Small>
      <ServerClusterSettings name={name} />
    </div>
  );
};

const ServerClusterSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useLevelManager();

  const [serversCount, setServersCount] = useSystemComponentConfigSlice<number>(
    id,
    "servers count",
  );

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2">
        <div className="grid grid-flow-col grid-cols-2">
          <Label htmlFor="servers-count" className=" col-span-1 my-auto">
            Server replicas
          </Label>
          <Input
            value={serversCount}
            onChange={(e) => setServersCount(parseInt(e.target.value))}
            name="servers-count"
            className="col-span-1"
            placeholder="# of instances"
            type="number"
          />
        </div>
      </div>
    </WithSettings>
  );
};
