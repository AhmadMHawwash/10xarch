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
          <Label htmlFor="cache-purpose" className=" col-span-1 my-auto">
            Cache purpose
          </Label>
          <div className="col-span-1">
            <Select
              value={cacheType}
              onValueChange={(x: CachePurpose) => set(x)}
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
      </div>
    </WithSettings>
  );
};
