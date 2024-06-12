import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLevelManager } from "@/lib/hooks/useLevelManager";
import { useMemo } from "react";
import { type ComponentNodeProps } from "../../SystemComponentNode";
import { Label } from "../../ui/label";
import { Small } from "../../ui/typography";
import { WithSettings } from "../WithSettings";
import { Input } from "@/components/ui/input";

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
  const { makeComponentConfigSlice } = useLevelManager();

  const { get, set } = useMemo(
    () => makeComponentConfigSlice<CachePurpose>(id, "type"),
    [id, makeComponentConfigSlice],
  );

  const cacheType = get();

  return (
    <WithSettings name={id}>
      <div className="grid w-full grid-flow-row grid-cols-1 gap-2">
        <div className="grid grid-flow-col grid-cols-2">
          <Label htmlFor="database-type" className=" col-span-1 my-auto">
            Primary (Write)
          </Label>
          <Input
            className="col-span-1"
            placeholder="# of instances"
            type="number"
          />
        </div>
        <div className="grid grid-flow-col grid-cols-2">
          <Label htmlFor="database-type" className=" col-span-1 my-auto">
            Replica (Read only)
          </Label>
          <Input
            className="col-span-1"
            placeholder="# of instances"
            type="number"
          />
        </div>
      </div>
    </WithSettings>
  );
};
