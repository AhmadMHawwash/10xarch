import { Input } from "@/components/ui/input";
import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { type ComponentNodeProps } from "../../SystemComponentNode";
import { Label } from "../../ui/label";
import { Small } from "../../ui/typography";
import { WithSettings } from "../WithSettings";

export const DatabaseCluster = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {Icon && <Icon size={20} />}
      <Small>{name}</Small>
      <DatabaseClusterSettings name={name} />
    </div>
  );
};

const DatabaseClusterSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useLevelManager();

  const [primaryInstancesCount, setPrimaryInstancesCount] =
    useSystemComponentConfigSlice<number>(id, "Number of Primary instances");
  const [replicaInstancesCount, setReplicaInstancesCount] =
    useSystemComponentConfigSlice<number>(id, "Number of Replica instances");

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2">
        <div className="grid grid-flow-col grid-cols-2">
          <Label
            htmlFor="primary-instances-count"
            className=" col-span-1 my-auto"
          >
            Read/Write
          </Label>
          <Input
            value={primaryInstancesCount}
            onChange={(e) => setPrimaryInstancesCount(parseInt(e.target.value))}
            name="primary-instances-count"
            className="col-span-1"
            placeholder="# of instances"
            type="number"
          />
        </div>
        <div className="grid grid-flow-col grid-cols-2">
          <Label
            htmlFor="replica-instances-count"
            className=" col-span-1 my-auto"
          >
            Replica (Read only)
          </Label>
          <Input
            value={replicaInstancesCount}
            onChange={(e) => setReplicaInstancesCount(parseInt(e.target.value))}
            name="replica-instances-count"
            className="col-span-1"
            placeholder="# of instances"
            type="number"
          />
        </div>
      </div>
    </WithSettings>
  );
};
