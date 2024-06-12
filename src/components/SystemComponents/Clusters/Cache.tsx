import { Input } from "@/components/ui/input";
import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { useMemo } from "react";
import { type ComponentNodeProps } from "../../SystemComponentNode";
import { Label } from "../../ui/label";
import { Small } from "../../ui/typography";
import { WithSettings } from "../WithSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CacheCluster = ({ name, Icon }: ComponentNodeProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {Icon && <Icon size={20} />}
      <Small>{name}</Small>
      <CacheSettings name={name} />
    </div>
  );
};

type CachePurpose = "Database Read/Write" | "User Session";

const CacheSettings = ({ name: id }: { name: string }) => {
  const { useSystemComponentConfigSlice } = useLevelManager();

  const [cacheType, setCacheType] = useSystemComponentConfigSlice<CachePurpose>(
    id,
    "type",
  );
  const [primaryInstancesCount, setPrimaryInstancesCount] =
    useSystemComponentConfigSlice<number>(id, "primary instances count");
  const [replicaInstancesCount, setReplicaInstancesCount] =
    useSystemComponentConfigSlice<number>(id, "replica instances count");

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2">
        <div className="grid grid-flow-col grid-cols-2">
          <Label htmlFor="cache-purpose" className=" col-span-1 my-auto">
            Cache purpose
          </Label>
          <div className="col-span-1">
            <Select
              value={cacheType}
              onValueChange={(x: CachePurpose) => setCacheType(x)}
              name="cache-purpose"
            >
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Cache purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Database Read/Write">
                  Database Read/Write
                </SelectItem>
                <SelectItem value="User Session">User Session</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-flow-col grid-cols-2">
          <Label
            htmlFor="primary-instances-count"
            className=" col-span-1 my-auto"
          >
            Primary (Write)
          </Label>
          <Input
            value={primaryInstancesCount}
            onChange={(e) => setPrimaryInstancesCount(parseInt(e.target.value))}
            className="col-span-1"
            placeholder="# of instances"
            type="number"
          />
        </div>
        <div className="grid grid-flow-col grid-cols-2">
          <Label
            htmlFor="replica-instances-count"
            className="col-span-1 my-auto"
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
